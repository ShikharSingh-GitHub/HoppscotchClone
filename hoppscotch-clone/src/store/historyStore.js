import { create } from "zustand";
import storageInterface from "../services/storageInterface";
import useStorageConfigStore from "./storageConfigStore";

const useHistoryStore = create((set, get) => ({
  history: [],
  loading: false,
  error: null,
  isAddingHistory: false,
  storageInitialized: false,

  // Initialize storage interface
  initializeStorage: async () => {
    try {
      const initResult = await storageInterface.initialize();
      if (initResult.success) {
        set({ storageInitialized: true });
        console.log("✅ History storage initialized successfully");
        // Fetch initial history after initialization
        await get().fetchHistory();
      } else {
        console.error(
          "❌ Failed to initialize history storage:",
          initResult.error
        );
        set({ error: initResult.error });
      }
      return initResult;
    } catch (error) {
      console.error("❌ Storage initialization error:", error);
      set({ error: error.message });
      return { success: false, error: error.message };
    }
  },

  // Fetch history from current storage
  fetchHistory: async (type = null) => {
    set({ loading: true, error: null });
    try {
      console.log("Fetching history from storage interface...");

      // Ensure storage is initialized
      if (!get().storageInitialized) {
        await get().initializeStorage();
      }

      const response = await storageInterface.getHistory();

      if (response.success) {
        console.log(
          "History fetched successfully:",
          response.data.length,
          "entries"
        );
        set({ history: response.data || [], loading: false });
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
      set({ error: error.message, loading: false });
    }
  },

  // Add new history entry with duplicate prevention
  addHistoryEntry: async (requestData) => {
    const { isAddingHistory } = get();

    if (isAddingHistory) {
      console.log("History addition already in progress, skipping...");
      return;
    }

    try {
      set({ isAddingHistory: true });
      console.log("Adding history entry:", requestData);

      // Ensure storage is initialized
      if (!get().storageInitialized) {
        await get().initializeStorage();
      }

      const response = await storageInterface.addHistoryEntry(requestData);

      if (response.success) {
        console.log("History entry added successfully:", response.data);
        // Refresh the history list after successful addition
        setTimeout(() => {
          get().fetchHistory();
        }, 500);
        return response;
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error("Error adding to history:", error);
      set({ error: error.message });
      throw error;
    } finally {
      set({ isAddingHistory: false });
    }
  },

  // Delete history entry
  deleteHistoryEntry: async (id) => {
    try {
      const response = await storageInterface.deleteHistoryEntry(id);

      if (response.success) {
        const currentHistory = get().history;
        const updatedHistory = currentHistory.filter(
          (entry) => entry.id !== id
        );
        set({ history: updatedHistory });
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error("Error deleting history entry:", error);
      set({ error: error.message });
      throw error;
    }
  },

  // Toggle history star
  toggleHistoryStar: async (id) => {
    try {
      // Update in storage
      const response = await storageInterface.updateHistoryEntry(id, {
        is_starred: true,
      });

      if (response.success) {
        const currentHistory = get().history;
        const updatedHistory = currentHistory.map((entry) =>
          entry.id === id ? { ...entry, is_starred: !entry.is_starred } : entry
        );
        set({ history: updatedHistory });
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error("Error toggling history star:", error);
      set({ error: error.message });
      throw error;
    }
  },

  // Clear all history
  clearAllHistory: async (type = null) => {
    try {
      const response = await storageInterface.clearAllHistory();

      if (response.success) {
        set({ history: [] });
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error("Error clearing history:", error);
      set({ error: error.message });
      throw error;
    }
  },

  // Storage management functions
  switchStorageType: async (newStorageType) => {
    try {
      console.log("Switching storage type to:", newStorageType);

      const response = await storageInterface.switchStorageType(newStorageType);

      if (response.success) {
        console.log("Storage type switched successfully");
        // Refresh history from new storage
        await get().fetchHistory();
      } else {
        throw new Error(response.error);
      }

      return response;
    } catch (error) {
      console.error("Error switching storage type:", error);
      set({ error: error.message });
      return { success: false, error: error.message };
    }
  },

  // Export history for backup
  exportHistory: async () => {
    try {
      console.log("Exporting history...");

      const response = await storageInterface.exportHistory();

      if (response.success) {
        console.log("History exported successfully");
        return response;
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error("Error exporting history:", error);
      set({ error: error.message });
      return { success: false, error: error.message };
    }
  },

  // Import history from backup
  importHistory: async (historyData) => {
    try {
      console.log("Importing history...");

      const response = await storageInterface.importHistory(historyData);

      if (response.success) {
        console.log("History imported successfully");
        // Refresh history display
        await get().fetchHistory();
      } else {
        throw new Error(response.error);
      }

      return response;
    } catch (error) {
      console.error("Error importing history:", error);
      set({ error: error.message });
      return { success: false, error: error.message };
    }
  },

  // Main function to restore from history with tab management
  restoreFromHistory: (historyEntry) => {
    console.log("Restoring from history:", historyEntry);

    // Trigger tab restoration
    if (window.restoreTab) {
      window.restoreTab(historyEntry);
    }
  },
}));

export default useHistoryStore;
