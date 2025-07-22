import { create } from "zustand";
import apiService from "../services/api";

const useHistoryStore = create((set, get) => ({
  history: [],
  loading: false,
  error: null,
  isAddingHistory: false,

  // Fetch history from backend
  fetchHistory: async (type = null) => {
    set({ loading: true, error: null });
    try {
      console.log("Fetching history...");
      const response = await apiService.getHistory();
      console.log("History fetched successfully:", response);
      set({ history: response.data || [], loading: false });
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

      const response = await apiService.addToHistory(requestData);
      console.log("History entry added successfully:", response);

      // Refresh the history list after successful addition
      setTimeout(() => {
        get().fetchHistory();
      }, 500);

      return response;
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
      await apiService.deleteHistory(id);
      const currentHistory = get().history;
      const updatedHistory = currentHistory.filter((entry) => entry.id !== id);
      set({ history: updatedHistory });
    } catch (error) {
      console.error("Error deleting history entry:", error);
      set({ error: error.message });
      throw error;
    }
  },

  // Toggle history star
  toggleHistoryStar: async (id) => {
    try {
      await apiService.toggleHistoryStar(id);
      const currentHistory = get().history;
      const updatedHistory = currentHistory.map((entry) =>
        entry.id === id ? { ...entry, is_starred: !entry.is_starred } : entry
      );
      set({ history: updatedHistory });
    } catch (error) {
      console.error("Error toggling history star:", error);
      set({ error: error.message });
      throw error;
    }
  },

  // Clear all history
  clearAllHistory: async (type = null) => {
    try {
      await apiService.clearAllHistory();
      set({ history: [] });
    } catch (error) {
      console.error("Error clearing history:", error);
      set({ error: error.message });
      throw error;
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
