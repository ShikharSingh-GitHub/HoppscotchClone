/**
 * Storage Service - Handles both Database and JSON file storage
 * Provides unified interface for history storage with configurable backends
 */

import apiService from "./api";

class StorageService {
  constructor() {
    this.storageType = this.getStoragePreference();
    this.initializeStorage();
  }

  /**
   * Get storage preference from localStorage
   * @returns {string} 'database' | 'json'
   */
  getStoragePreference() {
    const preference = localStorage.getItem("hoppscotch-storage-preference");
    return preference || "database"; // Default to database for existing users
  }

  /**
   * Set storage preference
   * @param {string} type - 'database' | 'json'
   */
  setStoragePreference(type) {
    localStorage.setItem("hoppscotch-storage-preference", type);
    this.storageType = type;
    this.initializeStorage();
  }

  /**
   * Initialize storage based on preference
   */
  initializeStorage() {
    if (this.storageType === "json") {
      this.initializeJSONStorage();
    }
  }

  /**
   * Initialize JSON storage in localStorage
   */
  initializeJSONStorage() {
    const existingHistory = localStorage.getItem("hoppscotch-history");
    if (!existingHistory) {
      localStorage.setItem("hoppscotch-history", JSON.stringify([]));
    }
  }

  /**
   * Get history from selected storage
   * @returns {Promise<Object>} History response
   */
  async getHistory() {
    if (this.storageType === "database") {
      return await apiService.getHistory();
    } else {
      return this.getJSONHistory();
    }
  }

  /**
   * Add history entry to selected storage
   * @param {Object} requestData - Request data to store
   * @returns {Promise<Object>} Response
   */
  async addToHistory(requestData) {
    if (this.storageType === "database") {
      return await apiService.addToHistory(requestData);
    } else {
      return this.addToJSONHistory(requestData);
    }
  }

  /**
   * Delete history entry from selected storage
   * @param {string} id - Entry ID
   * @returns {Promise<Object>} Response
   */
  async deleteHistory(id) {
    if (this.storageType === "database") {
      return await apiService.deleteHistory(id);
    } else {
      return this.deleteJSONHistory(id);
    }
  }

  /**
   * Toggle star status in selected storage
   * @param {string} id - Entry ID
   * @returns {Promise<Object>} Response
   */
  async toggleHistoryStar(id) {
    if (this.storageType === "database") {
      return await apiService.toggleHistoryStar(id);
    } else {
      return this.toggleJSONHistoryStar(id);
    }
  }

  /**
   * Clear all history from selected storage
   * @returns {Promise<Object>} Response
   */
  async clearAllHistory() {
    if (this.storageType === "database") {
      return await apiService.clearAllHistory();
    } else {
      return this.clearJSONHistory();
    }
  }

  // JSON Storage Methods

  /**
   * Get history from JSON storage
   * @returns {Object} History response
   */
  getJSONHistory() {
    try {
      const history = JSON.parse(
        localStorage.getItem("hoppscotch-history") || "[]"
      );
      // Sort by timestamp descending (newest first)
      const sortedHistory = history.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );

      return {
        success: true,
        data: sortedHistory,
        message: "History retrieved from local storage",
      };
    } catch (error) {
      console.error("Error reading JSON history:", error);
      return {
        success: false,
        data: [],
        error: "Failed to read local history",
      };
    }
  }

  /**
   * Add entry to JSON storage
   * @param {Object} requestData - Request data
   * @returns {Object} Response
   */
  addToJSONHistory(requestData) {
    try {
      const history = JSON.parse(
        localStorage.getItem("hoppscotch-history") || "[]"
      );

      // Create new entry with ID and timestamp
      const newEntry = {
        id: this.generateId(),
        ...requestData,
        timestamp: new Date().toISOString(),
        is_starred: false,
        created_at: new Date().toISOString(),
      };

      // Add to beginning of array (newest first)
      history.unshift(newEntry);

      // Limit history to 1000 entries to prevent storage bloat
      if (history.length > 1000) {
        history.splice(1000);
      }

      localStorage.setItem("hoppscotch-history", JSON.stringify(history));

      return {
        success: true,
        data: { id: newEntry.id },
        message: "History entry added to local storage",
      };
    } catch (error) {
      console.error("Error adding to JSON history:", error);
      return {
        success: false,
        error: "Failed to add to local history",
      };
    }
  }

  /**
   * Delete entry from JSON storage
   * @param {string} id - Entry ID
   * @returns {Object} Response
   */
  deleteJSONHistory(id) {
    try {
      const history = JSON.parse(
        localStorage.getItem("hoppscotch-history") || "[]"
      );
      const updatedHistory = history.filter((entry) => entry.id !== id);

      if (updatedHistory.length === history.length) {
        return {
          success: false,
          error: "History entry not found",
        };
      }

      localStorage.setItem(
        "hoppscotch-history",
        JSON.stringify(updatedHistory)
      );

      return {
        success: true,
        message: "History entry deleted from local storage",
      };
    } catch (error) {
      console.error("Error deleting from JSON history:", error);
      return {
        success: false,
        error: "Failed to delete from local history",
      };
    }
  }

  /**
   * Toggle star status in JSON storage
   * @param {string} id - Entry ID
   * @returns {Object} Response
   */
  toggleJSONHistoryStar(id) {
    try {
      const history = JSON.parse(
        localStorage.getItem("hoppscotch-history") || "[]"
      );
      const entryIndex = history.findIndex((entry) => entry.id === id);

      if (entryIndex === -1) {
        return {
          success: false,
          error: "History entry not found",
        };
      }

      const entry = history[entryIndex];
      const newStarStatus = !entry.is_starred;

      history[entryIndex] = { ...entry, is_starred: newStarStatus };
      localStorage.setItem("hoppscotch-history", JSON.stringify(history));

      return {
        success: true,
        data: { is_starred: newStarStatus },
        message: "Star status updated in local storage",
      };
    } catch (error) {
      console.error("Error toggling star in JSON history:", error);
      return {
        success: false,
        error: "Failed to toggle star in local history",
      };
    }
  }

  /**
   * Clear all history from JSON storage
   * @returns {Object} Response
   */
  clearJSONHistory() {
    try {
      localStorage.setItem("hoppscotch-history", JSON.stringify([]));
      return {
        success: true,
        message: "All local history cleared",
      };
    } catch (error) {
      console.error("Error clearing JSON history:", error);
      return {
        success: false,
        error: "Failed to clear local history",
      };
    }
  }

  /**
   * Generate unique ID for entries
   * @returns {string} Unique ID
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Export history data for backup/migration
   * @returns {Promise<Object>} Exported data
   */
  async exportHistory() {
    const historyResponse = await this.getHistory();
    if (!historyResponse.success) {
      throw new Error("Failed to export history");
    }

    return {
      exportDate: new Date().toISOString(),
      storageType: this.storageType,
      totalEntries: historyResponse.data.length,
      history: historyResponse.data,
    };
  }

  /**
   * Import history data from backup
   * @param {Object} exportedData - Previously exported data
   * @returns {Promise<Object>} Import result
   */
  async importHistory(exportedData) {
    try {
      if (!exportedData.history || !Array.isArray(exportedData.history)) {
        throw new Error("Invalid export data format");
      }

      // Clear existing history
      await this.clearAllHistory();

      // Import entries one by one
      let successCount = 0;
      for (const entry of exportedData.history) {
        try {
          await this.addToHistory(entry);
          successCount++;
        } catch (error) {
          console.warn("Failed to import entry:", entry.id, error);
        }
      }

      return {
        success: true,
        message: `Imported ${successCount} of ${exportedData.history.length} entries`,
        importedCount: successCount,
        totalEntries: exportedData.history.length,
      };
    } catch (error) {
      console.error("Error importing history:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Migrate from one storage type to another
   * @param {string} fromType - Source storage type
   * @param {string} toType - Destination storage type
   * @returns {Promise<Object>} Migration result
   */
  async migrateStorage(fromType, toType) {
    try {
      console.log(`Migrating history from ${fromType} to ${toType}`);

      // Temporarily switch to source type to export
      const originalType = this.storageType;
      this.storageType = fromType;

      const exportData = await this.exportHistory();

      // Switch to destination type and import
      this.storageType = toType;
      this.initializeStorage();

      const importResult = await this.importHistory(exportData);

      if (importResult.success) {
        // Update preference
        this.setStoragePreference(toType);
        console.log("Migration completed successfully");
      } else {
        // Restore original type on failure
        this.storageType = originalType;
      }

      return importResult;
    } catch (error) {
      console.error("Migration failed:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get storage statistics
   * @returns {Promise<Object>} Storage stats
   */
  async getStorageStats() {
    try {
      const historyResponse = await this.getHistory();

      if (!historyResponse.success) {
        return {
          storageType: this.storageType,
          totalEntries: 0,
          error: "Failed to fetch history",
        };
      }

      const history = historyResponse.data || [];
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const stats = {
        storageType: this.storageType,
        totalEntries: history.length,
        starredEntries: history.filter((entry) => entry.is_starred).length,
        entriesThisWeek: history.filter(
          (entry) => new Date(entry.timestamp || entry.created_at) > oneWeekAgo
        ).length,
        entriesThisMonth: history.filter(
          (entry) => new Date(entry.timestamp || entry.created_at) > oneMonthAgo
        ).length,
        requestTypes: this.getRequestTypeStats(history),
        oldestEntry:
          history.length > 0
            ? Math.min(
                ...history.map((entry) =>
                  new Date(entry.timestamp || entry.created_at).getTime()
                )
              )
            : null,
        newestEntry:
          history.length > 0
            ? Math.max(
                ...history.map((entry) =>
                  new Date(entry.timestamp || entry.created_at).getTime()
                )
              )
            : null,
      };

      if (this.storageType === "json") {
        // Add JSON-specific stats
        const historyString =
          localStorage.getItem("hoppscotch-history") || "[]";
        stats.storageSize = new Blob([historyString]).size;
        stats.storageSizeFormatted = this.formatBytes(stats.storageSize);
      }

      return stats;
    } catch (error) {
      console.error("Error getting storage stats:", error);
      return {
        storageType: this.storageType,
        totalEntries: 0,
        error: error.message,
      };
    }
  }

  /**
   * Get request type statistics
   * @param {Array} history - History entries
   * @returns {Object} Request type counts
   */
  getRequestTypeStats(history) {
    const stats = {};
    history.forEach((entry) => {
      const method = entry.method || "UNKNOWN";
      stats[method] = (stats[method] || 0) + 1;
    });
    return stats;
  }

  /**
   * Format bytes to human readable string
   * @param {number} bytes - Bytes
   * @returns {string} Formatted string
   */
  formatBytes(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
}

// Create and export singleton instance
const storageService = new StorageService();

export default storageService;
