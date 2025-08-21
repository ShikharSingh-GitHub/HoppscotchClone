import { createContext, useCallback, useContext, useState } from "react";

const TabContext = createContext();

// Custom hook with proper naming for Fast Refresh
const useTabContext = () => {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error("useTabContext must be used within a TabProvider");
  }
  return context;
};

// Component with proper naming for Fast Refresh
const TabProvider = ({ children }) => {
  const [tabs, setTabs] = useState([
    {
      id: 1,
      method: "GET",
      title: "Untitled",
      url: "https://echo.hoppscotch.io",
      headers: {},
      body: "",
      params: [],
      auth: { authType: "none", authActive: true }, // Add auth field
    },
  ]);
  const [activeTabId, setActiveTabId] = useState(1);

  const addTab = useCallback(() => {
    // Generate a truly unique ID
    const existingIds = tabs.map((t) => t.id);
    let newId = Math.max(...existingIds, 0) + 1;

    // Extra safety check to ensure uniqueness
    while (existingIds.includes(newId)) {
      newId = Math.max(...existingIds) + Math.floor(Math.random() * 1000) + 1;
    }

    const newTab = {
      id: newId,
      method: "GET",
      title: "Untitled",
      url: "https://echo.hoppscotch.io",
      headers: {},
      body: "",
      params: [],
      auth: { authType: "none", authActive: true }, // Add auth field
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
    return newTab;
  }, [tabs]);

  const removeTab = useCallback(
    (id) => {
      if (tabs.length === 1) return;

      setTabs((prev) => {
        const updated = prev.filter((t) => t.id !== id);
        // If removing active tab, switch to first available
        if (activeTabId === id) {
          setActiveTabId(updated[0]?.id || 1);
        }
        return updated;
      });
    },
    [tabs, activeTabId]
  );

  const updateTab = useCallback((id, updates) => {
    setTabs((prev) =>
      prev.map((tab) => (tab.id === id ? { ...tab, ...updates } : tab))
    );
  }, []);

  const restoreTab = useCallback(
    (historyEntry) => {
      console.log("Restoring tab:", historyEntry);

      try {
        // Safely parse headers - handle different data types
        let parsedHeaders = {};

        if (historyEntry.headers) {
          if (typeof historyEntry.headers === "string") {
            try {
              parsedHeaders = JSON.parse(historyEntry.headers);
            } catch (e) {
              console.error(
                "Failed to parse headers string:",
                historyEntry.headers
              );
              parsedHeaders = {};
            }
          } else if (typeof historyEntry.headers === "object") {
            parsedHeaders = historyEntry.headers;
          }
        }

        // First, try to find an existing tab with the same content
        const existingContentTab = tabs.find(
          (tab) =>
            tab.method === (historyEntry.method || "GET") &&
            tab.url === (historyEntry.url || "") &&
            JSON.stringify(tab.headers) === JSON.stringify(parsedHeaders) &&
            tab.body === (historyEntry.body || "")
        );

        if (existingContentTab) {
          // If we found a tab with identical content, just switch to it
          console.log("Found existing tab with same content, switching to it");
          setActiveTabId(existingContentTab.id);
          return;
        }

        // Check if there's an existing tab with the exact same ID
        const existingTab = tabs.find((tab) => tab.id === historyEntry.tabId);

        if (existingTab && historyEntry.tabId) {
          // Update existing tab only if we have a valid tabId
          updateTab(historyEntry.tabId, {
            method: historyEntry.method || "GET",
            url: historyEntry.url || "",
            headers: parsedHeaders,
            body: historyEntry.body || "",
            title: historyEntry.tabTitle || "Restored Request",
          });
          setActiveTabId(historyEntry.tabId);
        } else {
          // Generate a unique ID that doesn't conflict with existing tabs
          const generateUniqueId = () => {
            const existingIds = tabs.map((tab) => tab.id);
            let newId = Math.max(...existingIds, 0) + 1;
            while (existingIds.includes(newId)) {
              newId =
                Math.max(...existingIds) + Math.floor(Math.random() * 1000) + 1;
            }
            return newId;
          };

          // Create new tab with unique ID
          const newTab = {
            id: generateUniqueId(),
            method: historyEntry.method || "GET",
            url: historyEntry.url || "",
            headers: parsedHeaders,
            body: historyEntry.body || "",
            title: historyEntry.tabTitle || "Restored Request",
            params: [],
          };
          setTabs((prev) => [...prev, newTab]);
          setActiveTabId(newTab.id);
        }

        console.log("Tab restored successfully");
      } catch (error) {
        console.error("Error restoring tab:", error);

        // Fallback: create a simple tab without headers
        const generateUniqueId = () => {
          const existingIds = tabs.map((tab) => tab.id);
          let newId = Math.max(...existingIds, 0) + 1;
          while (existingIds.includes(newId)) {
            newId =
              Math.max(...existingIds) + Math.floor(Math.random() * 1000) + 1;
          }
          return newId;
        };

        const fallbackTab = {
          id: generateUniqueId(),
          method: historyEntry.method || "GET",
          url: historyEntry.url || "",
          headers: {},
          body: historyEntry.body || "",
          title: historyEntry.tabTitle || "Restored Request",
          params: [],
        };
        setTabs((prev) => [...prev, fallbackTab]);
        setActiveTabId(fallbackTab.id);
      }
    },
    [tabs, updateTab]
  );

  const activeTab = tabs.find((tab) => tab.id === activeTabId) || tabs[0];

  const value = {
    tabs,
    activeTabId,
    activeTab,
    addTab,
    removeTab,
    updateTab,
    restoreTab,
    setActiveTabId,
  };

  return <TabContext.Provider value={value}>{children}</TabContext.Provider>;
};

// Export at the bottom for better Fast Refresh compatibility
export { TabProvider, useTabContext };
