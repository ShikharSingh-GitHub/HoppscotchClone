import { create } from "zustand";

const useRequestStoreBase = create((set, get) => ({
  isRequested: false,
  activeRequest: {
    method: "GET",
    url: "",
    headers: {},
    body: null,
    auth: { authType: "none", authActive: true }, // Add auth field
  },
  responseData: null, // Add response data storage

  // Getters
  currentRequest: () => get().activeRequest,

  // Actions
  requested: () => set({ isRequested: true }), // Always set to true when request is made
  setActiveRequest: (request) => set({ activeRequest: request }),
  setResponseData: (response) => set({ responseData: response }), // Add response setter

  // Update request (partial updates)
  updateRequest: (updates) =>
    set((state) => ({
      activeRequest: { ...state.activeRequest, ...updates },
    })),

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
        auth: historyEntry.auth || { authType: "none", authActive: true }, // Include auth in restoration
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

// Export named hooks for easier use
export const useRequestStore = () => {
  const store = useRequestStoreBase();
  return {
    ...store,
    currentRequest: store.activeRequest,
  };
};

export default useRequestStoreBase;
