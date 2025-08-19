import useStorageConfigStore from "../store/storageConfigStore";
import databaseStorageService from "./databaseStorageService";
import jsonStorageService from "./jsonStorageService";

/**
 * Unified Storage Interface
 * Provides a single API that switches between JSON and Database storage
 * based on user preferences
 */

class StorageInterface {
  constructor() {
    this.currentService = null;
    this.initialized = false;
    console.log("🔧 Storage Interface initialized");
  }

  // Initialize the storage interface
  async initialize() {
    try {
      if (this.initialized) {
        console.log("Storage interface already initialized");
        return { success: true };
      }

      // Initialize storage configuration
      const storageConfig = useStorageConfigStore.getState();
      await storageConfig.initializeStorage();

      // Get current storage type
      const storageType = storageConfig.storageType;

      if (!storageType) {
        console.warn("⚠️ No storage type configured");
        return { success: false, error: "No storage type configured" };
      }

      // Initialize the appropriate service
      await this.switchToStorageType(storageType);

      this.initialized = true;
      console.log(
        `✅ Storage Interface initialized with ${storageType} storage`
      );
      return { success: true };
    } catch (error) {
      console.error("❌ Failed to initialize Storage Interface:", error);
      return { success: false, error: error.message };
    }
  }

  // Switch to a specific storage type
  async switchToStorageType(storageType) {
    try {
      console.log(`🔄 Switching to ${storageType} storage...`);

      if (storageType === "json") {
        this.currentService = jsonStorageService;
      } else if (storageType === "database") {
        this.currentService = databaseStorageService;
      } else {
        throw new Error(`Unsupported storage type: ${storageType}`);
      }

      // Initialize the service
      const initResult = await this.currentService.initialize();
      if (!initResult.success) {
        throw new Error(
          `Failed to initialize ${storageType} storage: ${initResult.error}`
        );
      }

      // Update storage config
      const storageConfig = useStorageConfigStore.getState();
      storageConfig.setStorageType(storageType);

      console.log(`✅ Successfully switched to ${storageType} storage`);
      return { success: true };
    } catch (error) {
      console.error(`❌ Failed to switch to ${storageType} storage:`, error);
      this.currentService = null;
      return { success: false, error: error.message };
    }
  }

  // Ensure service is available
  ensureService() {
    if (!this.currentService) {
      throw new Error(
        "Storage service not initialized. Call initialize() first."
      );
    }
    return this.currentService;
  }

  // Get current storage type
  getCurrentStorageType() {
    const storageConfig = useStorageConfigStore.getState();
    return storageConfig.storageType;
  }

  // Get all history entries
  async getHistory() {
    try {
      const service = this.ensureService();
      const result = await service.getHistory();

      // Log storage activity
      if (result.success) {
        console.log(
          `📖 Retrieved ${
            result.data.length
          } entries via ${this.getCurrentStorageType()} storage`
        );
      }

      return result;
    } catch (error) {
      console.error("❌ Failed to get history:", error);
      return { success: false, error: error.message, data: [] };
    }
  }

  // Add new history entry
  async addHistoryEntry(entry) {
    try {
      const service = this.ensureService();
      const result = await service.addHistoryEntry(entry);

      if (result.success) {
        console.log(
          `✅ Added entry via ${this.getCurrentStorageType()} storage`
        );
      }

      return result;
    } catch (error) {
      console.error("❌ Failed to add history entry:", error);
      return { success: false, error: error.message };
    }
  }

  // Update history entry
  async updateHistoryEntry(id, updates) {
    try {
      const service = this.ensureService();
      const result = await service.updateHistoryEntry(id, updates);

      if (result.success) {
        console.log(
          `✅ Updated entry ${id} via ${this.getCurrentStorageType()} storage`
        );
      }

      return result;
    } catch (error) {
      console.error("❌ Failed to update history entry:", error);
      return { success: false, error: error.message };
    }
  }

  // Delete history entry
  async deleteHistoryEntry(id) {
    try {
      const service = this.ensureService();
      const result = await service.deleteHistoryEntry(id);

      if (result.success) {
        console.log(
          `✅ Deleted entry ${id} via ${this.getCurrentStorageType()} storage`
        );
      }

      return result;
    } catch (error) {
      console.error("❌ Failed to delete history entry:", error);
      return { success: false, error: error.message };
    }
  }

  // Toggle star status
  async toggleHistoryStar(id) {
    try {
      const service = this.ensureService();
      const result = await service.toggleHistoryStar(id);

      if (result.success) {
        console.log(
          `✅ Toggled star for entry ${id} via ${this.getCurrentStorageType()} storage`
        );
      }

      return result;
    } catch (error) {
      console.error("❌ Failed to toggle history star:", error);
      return { success: false, error: error.message };
    }
  }

  // Clear all history
  async clearAllHistory() {
    try {
      const service = this.ensureService();
      const result = await service.clearAllHistory();

      if (result.success) {
        console.log(
          `✅ Cleared all history via ${this.getCurrentStorageType()} storage`
        );
      }

      return result;
    } catch (error) {
      console.error("❌ Failed to clear history:", error);
      return { success: false, error: error.message };
    }
  }

  // Create backup
  async createBackup() {
    try {
      const service = this.ensureService();
      const result = await service.createBackup();

      if (result.success) {
        console.log(
          `✅ Created backup via ${this.getCurrentStorageType()} storage`
        );
      }

      return result;
    } catch (error) {
      console.error("❌ Failed to create backup:", error);
      return { success: false, error: error.message };
    }
  }

  // Export history
  async exportHistory() {
    try {
      const service = this.ensureService();
      const result = await service.exportHistory();

      if (result.success) {
        console.log(
          `✅ Exported history via ${this.getCurrentStorageType()} storage`
        );
      }

      return result;
    } catch (error) {
      console.error("❌ Failed to export history:", error);
      return { success: false, error: error.message };
    }
  }

  // Import history
  async importHistory(importData) {
    try {
      const service = this.ensureService();
      const result = await service.importHistory(importData);

      if (result.success) {
        console.log(
          `✅ Imported history via ${this.getCurrentStorageType()} storage`
        );
      }

      return result;
    } catch (error) {
      console.error("❌ Failed to import history:", error);
      return { success: false, error: error.message };
    }
  }

  // Get storage statistics
  async getStorageStats() {
    try {
      const service = this.ensureService();
      const result = await service.getStorageStats();

      if (result.success) {
        result.stats.storageType = this.getCurrentStorageType();
      }

      return result;
    } catch (error) {
      console.error("❌ Failed to get storage stats:", error);
      return { success: false, error: error.message };
    }
  }

  // Migrate data between storage types
  async migrateData(fromType, toType) {
    try {
      console.log(`🔄 Starting migration from ${fromType} to ${toType}...`);

      // Validate storage types
      if (
        !["json", "database"].includes(fromType) ||
        !["json", "database"].includes(toType)
      ) {
        throw new Error("Invalid storage type for migration");
      }

      if (fromType === toType) {
        throw new Error(
          "Source and destination storage types cannot be the same"
        );
      }

      // Get source service
      const sourceService =
        fromType === "json" ? jsonStorageService : databaseStorageService;
      const targetService =
        toType === "json" ? jsonStorageService : databaseStorageService;

      // Initialize both services
      await sourceService.initialize();
      await targetService.initialize();

      // Export data from source
      const exportResult = await sourceService.exportHistory();
      if (!exportResult.success) {
        throw new Error(
          `Failed to export from ${fromType}: ${exportResult.error}`
        );
      }

      // Create backup of target before migration
      try {
        await targetService.createBackup();
      } catch (backupError) {
        console.warn(
          "Warning: Could not create backup before migration:",
          backupError
        );
      }

      // Import data to target
      const importResult = await targetService.importHistory(exportResult.data);
      if (!importResult.success) {
        throw new Error(`Failed to import to ${toType}: ${importResult.error}`);
      }

      // Switch to new storage type
      await this.switchToStorageType(toType);

      console.log(
        `✅ Successfully migrated ${importResult.count} entries from ${fromType} to ${toType}`
      );
      return {
        success: true,
        migratedCount: importResult.count,
        fromType,
        toType,
      };
    } catch (error) {
      console.error("❌ Migration failed:", error);
      return { success: false, error: error.message };
    }
  }

  // Get migration status and recommendations
  async getMigrationInfo() {
    try {
      const currentType = this.getCurrentStorageType();
      const otherType = currentType === "json" ? "database" : "json";

      // Get current storage stats
      const currentStats = await this.getStorageStats();

      // Test availability of other storage type
      const otherService =
        otherType === "json" ? jsonStorageService : databaseStorageService;
      const otherAvailable = await otherService.initialize();

      return {
        success: true,
        current: {
          type: currentType,
          stats: currentStats.success ? currentStats.stats : null,
        },
        alternative: {
          type: otherType,
          available: otherAvailable.success,
          error: otherAvailable.error,
        },
        canMigrate: otherAvailable.success,
      };
    } catch (error) {
      console.error("❌ Failed to get migration info:", error);
      return { success: false, error: error.message };
    }
  }

  // Health check for current storage
  async healthCheck() {
    try {
      const storageType = this.getCurrentStorageType();

      if (!this.currentService) {
        return {
          success: false,
          storageType,
          error: "Storage service not initialized",
        };
      }

      // Test basic operations
      const testResults = {
        canRead: false,
        canWrite: false,
        connectionOk: false,
      };

      // Test read operation
      try {
        const readResult = await this.getHistory();
        testResults.canRead = readResult.success;
      } catch (error) {
        console.warn("Read test failed:", error);
      }

      // Test connection (if database)
      if (
        storageType === "database" &&
        this.currentService.getConnectionStatus
      ) {
        try {
          const connectionResult =
            await this.currentService.getConnectionStatus();
          testResults.connectionOk = connectionResult.connected;
        } catch (error) {
          console.warn("Connection test failed:", error);
        }
      } else {
        testResults.connectionOk = true; // JSON storage doesn't need connection
      }

      const isHealthy = testResults.canRead && testResults.connectionOk;

      return {
        success: true,
        storageType,
        healthy: isHealthy,
        tests: testResults,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("❌ Health check failed:", error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

// Create singleton instance
const storageInterface = new StorageInterface();

export default storageInterface;
