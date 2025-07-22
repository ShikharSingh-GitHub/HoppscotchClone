import { createContext, useCallback, useContext, useState } from "react";

const TabContext = createContext();

export const useTabContext = () => {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error("useTabContext must be used within a TabProvider");
  }
  return context;
};

export const TabProvider = ({ children }) => {
  const [tabs, setTabs] = useState([
    {
      id: 1,
      method: "GET",
      title: "Untitled",
      url: "https://echo.hoppscotch.io",
      headers: {},
      body: "",
      params: [],
    },
  ]);
  const [activeTabId, setActiveTabId] = useState(1);

  const addTab = useCallback(() => {
    const newId = Math.max(...tabs.map((t) => t.id)) + 1;
    const newTab = {
      id: newId,
      method: "GET",
      title: "Untitled",
      url: "https://echo.hoppscotch.io",
      headers: {},
      body: "",
      params: [],
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

        // Find existing tab with same ID
        const existingTab = tabs.find((tab) => tab.id === historyEntry.tabId);

        if (existingTab) {
          // Update existing tab
          updateTab(historyEntry.tabId, {
            method: historyEntry.method || "GET",
            url: historyEntry.url || "",
            headers: parsedHeaders,
            body: historyEntry.body || "",
            title: historyEntry.tabTitle || "Restored Request",
          });
          setActiveTabId(historyEntry.tabId);
        } else {
          // Create new tab
          const newTab = {
            id: historyEntry.tabId || Date.now(),
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
        const fallbackTab = {
          id: historyEntry.tabId || Date.now(),
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
