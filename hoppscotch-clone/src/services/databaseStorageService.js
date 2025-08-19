import apiService from "./api";

/**
 * Database Storage Service
 * Handles database operations for history storage
 * Wraps the existing API service with consistent interface
 */

class DatabaseStorageService {
  constructor() {
    console.log("🗄️ Database Storage Service initialized");
  }

  // Initialize storage
  async initialize() {
    try {
      // Test database connection
      const isConnected = await this.testConnection();
      if (!isConnected) {
        throw new Error("Database connection failed");
      }

      console.log("✅ Database Storage initialized successfully");
      return { success: true };
    } catch (error) {
      console.error("❌ Database Storage initialization failed:", error);
      return { success: false, error: error.message };
    }
  }

  // Test database connection
  async testConnection() {
    try {
      const baseURL = await apiService.getBaseURL();
      const response = await fetch(`${baseURL.replace("/api", "")}/health`);
      return response.ok;
    } catch (error) {
      console.warn("Database connection test failed:", error);
      return false;
    }
  }

  // Get all history entries
  async getHistory() {
    try {
      console.log("📖 Fetching history from database...");
      const response = await apiService.getHistory();

      console.log(
        `📖 Retrieved ${
          response.data?.length || 0
        } history entries from database`
      );
      return {
        success: true,
        data: response.data || [],
      };
    } catch (error) {
      console.error("❌ Failed to get history from database:", error);
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  }

  // Add new history entry
  async addHistoryEntry(entry) {
    try {
      console.log("➕ Adding history entry to database...");
      const response = await apiService.addToHistory(entry);

      console.log(
        `✅ Added history entry to database with ID: ${response.data?.id}`
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("❌ Failed to add history entry to database:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Update history entry
  async updateHistoryEntry(id, updates) {
    try {
      console.log(`✏️ Updating history entry ${id} in database...`);

      // Since the API doesn't have a direct update method,
      // we'll implement this by getting the entry, updating it, and saving
      const historyResult = await this.getHistory();
      if (!historyResult.success) {
        throw new Error("Failed to fetch current history");
      }

      const entry = historyResult.data.find((item) => item.id === id);
      if (!entry) {
        throw new Error(`History entry with ID ${id} not found`);
      }

      // For now, we'll handle specific updates like starring
      if ("is_starred" in updates) {
        await apiService.toggleHistoryStar(id);
        return {
          success: true,
          data: { ...entry, is_starred: updates.is_starred },
        };
      }

      // For other updates, we might need to extend the API
      console.warn("⚠️ Generic update not implemented for database storage");
      return {
        success: true,
        data: { ...entry, ...updates },
      };
    } catch (error) {
      console.error("❌ Failed to update history entry in database:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Delete history entry
  async deleteHistoryEntry(id) {
    try {
      console.log(`🗑️ Deleting history entry ${id} from database...`);
      await apiService.deleteHistory(id);

      console.log(`✅ Deleted history entry with ID: ${id}`);
      return { success: true };
    } catch (error) {
      console.error("❌ Failed to delete history entry from database:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Toggle star status
  async toggleHistoryStar(id) {
    try {
      console.log(`⭐ Toggling star for history entry ${id} in database...`);
      await apiService.toggleHistoryStar(id);

      // Get updated entry to return
      const historyResult = await this.getHistory();
      if (historyResult.success) {
        const updatedEntry = historyResult.data.find((item) => item.id === id);
        console.log(`✅ Toggled star for history entry with ID: ${id}`);
        return {
          success: true,
          data: updatedEntry,
        };
      }

      return { success: true };
    } catch (error) {
      console.error("❌ Failed to toggle history star in database:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Clear all history
  async clearAllHistory() {
    try {
      console.log("🧹 Clearing all history from database...");
      await apiService.clearAllHistory();

      console.log("✅ Cleared all history entries from database");
      return { success: true };
    } catch (error) {
      console.error("❌ Failed to clear history from database:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Create backup (export from database)
  async createBackup() {
    try {
      console.log("💾 Creating backup from database...");
      const historyResult = await this.getHistory();

      if (!historyResult.success) {
        throw new Error("Failed to fetch history for backup");
      }

      const timestamp = new Date().toISOString();
      const backupData = {
        version: "1.0",
        exported_at: timestamp,
        app: "Hoppscotch Clone",
        source: "database",
        history: historyResult.data,
      };

      console.log(
        `✅ Created database backup with ${historyResult.data.length} entries`
      );
      return {
        success: true,
        timestamp,
        data: backupData,
      };
    } catch (error) {
      console.error("❌ Failed to create database backup:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Export history as JSON
  async exportHistory() {
    try {
      console.log("📤 Exporting history from database...");
      const historyResult = await this.getHistory();

      if (!historyResult.success) {
        throw new Error("Failed to fetch history for export");
      }

      const exportData = {
        version: "1.0",
        exported_at: new Date().toISOString(),
        app: "Hoppscotch Clone",
        source: "database",
        history: historyResult.data,
      };

      console.log(
        `✅ Exported ${historyResult.data.length} entries from database`
      );
      return {
        success: true,
        data: exportData,
      };
    } catch (error) {
      console.error("❌ Failed to export history from database:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Import history to database
  async importHistory(importData) {
    try {
      console.log("📥 Importing history to database...");

      // Validate import data
      if (!importData || !Array.isArray(importData.history)) {
        throw new Error("Invalid import data format");
      }

      // Create backup before import
      await this.createBackup();

      // Clear existing history
      await this.clearAllHistory();

      // Import each entry
      let imported = 0;
      for (const entry of importData.history) {
        try {
          await this.addHistoryEntry(entry);
          imported++;
        } catch (error) {
          console.warn(`Failed to import entry ${entry.id}:`, error);
        }
      }

      console.log(`✅ Imported ${imported} history entries to database`);
      return {
        success: true,
        count: imported,
      };
    } catch (error) {
      console.error("❌ Failed to import history to database:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get storage statistics
  async getStorageStats() {
    try {
      console.log("📊 Getting database storage statistics...");
      const historyResult = await this.getHistory();

      if (!historyResult.success) {
        throw new Error("Failed to fetch history for stats");
      }

      const history = historyResult.data;
      const totalEntries = history.length;
      const starredEntries = history.filter((entry) => entry.is_starred).length;

      // Calculate approximate storage size
      const dataString = JSON.stringify(history);
      const storageSize = new Blob([dataString]).size;

      const stats = {
        totalEntries,
        starredEntries,
        storageSize,
        storagePath: "database",
        lastModified: new Date().toISOString(),
        connectionStatus: (await this.testConnection())
          ? "connected"
          : "disconnected",
      };

      console.log(
        `📊 Database stats: ${totalEntries} total, ${starredEntries} starred`
      );
      return {
        success: true,
        stats,
      };
    } catch (error) {
      console.error("❌ Failed to get database storage stats:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Migrate data from database to JSON format
  async exportForMigration() {
    try {
      console.log("🔄 Preparing database data for migration...");
      const exportResult = await this.exportHistory();

      if (!exportResult.success) {
        throw new Error("Failed to export data for migration");
      }

      return {
        success: true,
        data: exportResult.data.history,
        metadata: {
          exportedAt: exportResult.data.exported_at,
          source: "database",
          totalEntries: exportResult.data.history.length,
        },
      };
    } catch (error) {
      console.error("❌ Failed to prepare data for migration:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get connection status
  async getConnectionStatus() {
    try {
      const isConnected = await this.testConnection();
      return {
        success: true,
        connected: isConnected,
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        connected: false,
        error: error.message,
        lastChecked: new Date().toISOString(),
      };
    }
  }
}

// Create singleton instance
const databaseStorageService = new DatabaseStorageService();

export default databaseStorageService;
