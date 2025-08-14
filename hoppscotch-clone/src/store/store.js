import { create } from "zustand";

const useRequestStore = create((set) => ({
  isRequested: false,
  activeRequest: {
    method: "GET",
    url: "",
    headers: {},
    body: null,
  },
  responseData: null, // Add response data storage
  requested: () => set({ isRequested: true }), // Always set to true when request is made
  setActiveRequest: (request) => set({ activeRequest: request }),
  setResponseData: (response) => set({ responseData: response }), // Add response setter

  restoreFromHistory: (historyEntry) => {
    try {
      // Parse headers if they're stored as a string
      const parsedHeaders =
        typeof historyEntry.headers === "string"
          ? JSON.parse(historyEntry.headers || "{}")
          : historyEntry.headers || {};

      // Create the request object to restore
      const restoredRequest = {
        method: historyEntry.method || "GET",
        url: historyEntry.url || "",
        headers: parsedHeaders,
        body: historyEntry.body || null,
      };

      // Update the active request
      set({ activeRequest: restoredRequest });

      console.log(
        "Successfully restored request from history:",
        historyEntry.url
      );
      return restoredRequest; // Return the restored request
    } catch (error) {
      console.error("Failed to restore from history:", error);
      return null;
    }
  },
}));

export default useRequestStore;
