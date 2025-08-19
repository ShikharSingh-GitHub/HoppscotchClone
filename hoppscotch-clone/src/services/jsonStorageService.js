/**
 * JSON Storage Service
 * Handles local JSON file operations for history storage
 * Works in both browser (localStorage) and Electron (file system)
 */

class JsonStorageService {
  constructor() {
    this.isElectron = window.electronAPI !== undefined;
    this.storageKey = "hoppscotch-history";
    this.backupKey = "hoppscotch-history-backup";
    this.maxBackups = 5;

    console.log(
      `📄 JSON Storage Service initialized (${
        this.isElectron ? "Electron" : "Browser"
      } mode)`
    );
  }

  // Initialize storage
  async initialize() {
    try {
      if (this.isElectron) {
        await this.initializeElectronStorage();
      } else {
        await this.initializeBrowserStorage();
      }
      console.log("✅ JSON Storage initialized successfully");
      return { success: true };
    } catch (error) {
      console.error("❌ JSON Storage initialization failed:", error);
      return { success: false, error: error.message };
    }
  }

  // Initialize Electron file system storage
  async initializeElectronStorage() {
    if (!this.isElectron || !window.electronAPI.getStoragePath) {
      throw new Error("Electron API not available");
    }

    try {
      this.storagePath = await window.electronAPI.getStoragePath();
      this.historyFilePath = `${this.storagePath}/history.json`;
      this.backupDir = `${this.storagePath}/backups`;

      // Ensure directory exists
      await window.electronAPI.ensureDirectory(this.storagePath);
      await window.electronAPI.ensureDirectory(this.backupDir);

      console.log(`📁 Electron storage path: ${this.storagePath}`);
    } catch (error) {
      console.error("Failed to initialize Electron storage:", error);
      throw error;
    }
  }

  // Initialize browser localStorage
  async initializeBrowserStorage() {
    // Check if localStorage is available
    if (typeof Storage === "undefined") {
      throw new Error("localStorage not supported in this browser");
    }

    // Initialize with empty array if not exists
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify([]));
    }

    console.log("🌐 Browser localStorage initialized");
  }

  // Get all history entries
  async getHistory() {
    try {
      let data;

      if (this.isElectron) {
        data = await this.readFromFile();
      } else {
        data = this.readFromLocalStorage();
      }

      // Ensure data is an array
      if (!Array.isArray(data)) {
        console.warn("History data is not an array, resetting to empty array");
        data = [];
        await this.saveHistory(data);
      }

      console.log(
        `📖 Retrieved ${data.length} history entries from JSON storage`
      );
      return { success: true, data };
    } catch (error) {
      console.error("❌ Failed to get history from JSON storage:", error);
      return { success: false, error: error.message, data: [] };
    }
  }

  // Add new history entry
  async addHistoryEntry(entry) {
    try {
      const historyResult = await this.getHistory();
      if (!historyResult.success) {
        throw new Error(historyResult.error);
      }

      const history = historyResult.data;

      // Generate ID if not provided
      if (!entry.id) {
        entry.id = this.generateId();
      }

      // Add timestamp if not provided
      if (!entry.timestamp) {
        entry.timestamp = new Date().toISOString();
      }

      // Add to beginning of array (most recent first)
      history.unshift(entry);

      // Limit history size
      const maxEntries = 1000; // Can be configurable
      if (history.length > maxEntries) {
        history.splice(maxEntries);
      }

      await this.saveHistory(history);

      console.log(`✅ Added history entry with ID: ${entry.id}`);
      return { success: true, data: entry };
    } catch (error) {
      console.error("❌ Failed to add history entry:", error);
      return { success: false, error: error.message };
    }
  }

  // Update history entry
  async updateHistoryEntry(id, updates) {
    try {
      const historyResult = await this.getHistory();
      if (!historyResult.success) {
        throw new Error(historyResult.error);
      }

      const history = historyResult.data;
      const entryIndex = history.findIndex((entry) => entry.id === id);

      if (entryIndex === -1) {
        throw new Error(`History entry with ID ${id} not found`);
      }

      // Update the entry
      history[entryIndex] = { ...history[entryIndex], ...updates };

      await this.saveHistory(history);

      console.log(`✅ Updated history entry with ID: ${id}`);
      return { success: true, data: history[entryIndex] };
    } catch (error) {
      console.error("❌ Failed to update history entry:", error);
      return { success: false, error: error.message };
    }
  }

  // Delete history entry
  async deleteHistoryEntry(id) {
    try {
      const historyResult = await this.getHistory();
      if (!historyResult.success) {
        throw new Error(historyResult.error);
      }

      const history = historyResult.data;
      const initialLength = history.length;
      const updatedHistory = history.filter((entry) => entry.id !== id);

      if (updatedHistory.length === initialLength) {
        throw new Error(`History entry with ID ${id} not found`);
      }

      await this.saveHistory(updatedHistory);

      console.log(`✅ Deleted history entry with ID: ${id}`);
      return { success: true };
    } catch (error) {
      console.error("❌ Failed to delete history entry:", error);
      return { success: false, error: error.message };
    }
  }

  // Toggle star status
  async toggleHistoryStar(id) {
    try {
      const historyResult = await this.getHistory();
      if (!historyResult.success) {
        throw new Error(historyResult.error);
      }

      const history = historyResult.data;
      const entry = history.find((entry) => entry.id === id);

      if (!entry) {
        throw new Error(`History entry with ID ${id} not found`);
      }

      entry.is_starred = !entry.is_starred;

      await this.saveHistory(history);

      console.log(`✅ Toggled star for history entry with ID: ${id}`);
      return { success: true, data: entry };
    } catch (error) {
      console.error("❌ Failed to toggle history star:", error);
      return { success: false, error: error.message };
    }
  }

  // Clear all history
  async clearAllHistory() {
    try {
      await this.saveHistory([]);
      console.log("✅ Cleared all history entries");
      return { success: true };
    } catch (error) {
      console.error("❌ Failed to clear history:", error);
      return { success: false, error: error.message };
    }
  }

  // Save history to storage
  async saveHistory(history) {
    try {
      if (this.isElectron) {
        await this.writeToFile(history);
      } else {
        this.writeToLocalStorage(history);
      }
    } catch (error) {
      console.error("❌ Failed to save history:", error);
      throw error;
    }
  }

  // Read from file (Electron)
  async readFromFile() {
    if (!this.isElectron || !window.electronAPI.readFile) {
      throw new Error("Electron file API not available");
    }

    try {
      const content = await window.electronAPI.readFile(this.historyFilePath);
      return JSON.parse(content);
    } catch (error) {
      // If file doesn't exist or is corrupted, return empty array
      if (error.code === "ENOENT" || error instanceof SyntaxError) {
        console.log("History file not found or corrupted, creating new one");
        return [];
      }
      throw error;
    }
  }

  // Write to file (Electron)
  async writeToFile(data) {
    if (!this.isElectron || !window.electronAPI.writeFile) {
      throw new Error("Electron file API not available");
    }

    const content = JSON.stringify(data, null, 2);
    await window.electronAPI.writeFile(this.historyFilePath, content);
  }

  // Read from localStorage (Browser)
  readFromLocalStorage() {
    const content = localStorage.getItem(this.storageKey);
    return content ? JSON.parse(content) : [];
  }

  // Write to localStorage (Browser)
  writeToLocalStorage(data) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  // Create backup
  async createBackup() {
    try {
      const historyResult = await this.getHistory();
      if (!historyResult.success) {
        throw new Error(historyResult.error);
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

      if (this.isElectron) {
        await this.createElectronBackup(historyResult.data, timestamp);
      } else {
        await this.createBrowserBackup(historyResult.data, timestamp);
      }

      console.log(`✅ Created backup at ${timestamp}`);
      return { success: true, timestamp };
    } catch (error) {
      console.error("❌ Failed to create backup:", error);
      return { success: false, error: error.message };
    }
  }

  // Create backup in Electron
  async createElectronBackup(data, timestamp) {
    const backupFilePath = `${this.backupDir}/history-backup-${timestamp}.json`;
    const content = JSON.stringify(data, null, 2);
    await window.electronAPI.writeFile(backupFilePath, content);

    // Clean up old backups
    await this.cleanupOldBackups();
  }

  // Create backup in browser
  async createBrowserBackup(data, timestamp) {
    const backupKey = `${this.backupKey}-${timestamp}`;
    localStorage.setItem(backupKey, JSON.stringify(data));

    // Clean up old backups
    await this.cleanupBrowserBackups();
  }

  // Clean up old backups (Electron)
  async cleanupOldBackups() {
    if (!this.isElectron || !window.electronAPI.listFiles) return;

    try {
      const files = await window.electronAPI.listFiles(this.backupDir);
      const backupFiles = files
        .filter((file) => file.startsWith("history-backup-"))
        .sort()
        .reverse(); // Most recent first

      // Keep only the latest maxBackups files
      if (backupFiles.length > this.maxBackups) {
        const filesToDelete = backupFiles.slice(this.maxBackups);
        for (const file of filesToDelete) {
          await window.electronAPI.deleteFile(`${this.backupDir}/${file}`);
        }
      }
    } catch (error) {
      console.warn("Warning: Failed to cleanup old backups:", error);
    }
  }

  // Clean up old backups (Browser)
  async cleanupBrowserBackups() {
    try {
      const backupKeys = Object.keys(localStorage)
        .filter((key) => key.startsWith(this.backupKey))
        .sort()
        .reverse(); // Most recent first

      // Keep only the latest maxBackups
      if (backupKeys.length > this.maxBackups) {
        const keysToDelete = backupKeys.slice(this.maxBackups);
        for (const key of keysToDelete) {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.warn("Warning: Failed to cleanup browser backups:", error);
    }
  }

  // Export history as JSON
  async exportHistory() {
    try {
      const historyResult = await this.getHistory();
      if (!historyResult.success) {
        throw new Error(historyResult.error);
      }

      const exportData = {
        version: "1.0",
        exported_at: new Date().toISOString(),
        app: "Hoppscotch Clone",
        history: historyResult.data,
      };

      return { success: true, data: exportData };
    } catch (error) {
      console.error("❌ Failed to export history:", error);
      return { success: false, error: error.message };
    }
  }

  // Import history from JSON
  async importHistory(importData) {
    try {
      // Validate import data
      if (!importData || !Array.isArray(importData.history)) {
        throw new Error("Invalid import data format");
      }

      // Create backup before import
      await this.createBackup();

      // Import the data
      await this.saveHistory(importData.history);

      console.log(`✅ Imported ${importData.history.length} history entries`);
      return { success: true, count: importData.history.length };
    } catch (error) {
      console.error("❌ Failed to import history:", error);
      return { success: false, error: error.message };
    }
  }

  // Generate unique ID
  generateId() {
    return `json_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get storage statistics
  async getStorageStats() {
    try {
      const historyResult = await this.getHistory();
      if (!historyResult.success) {
        throw new Error(historyResult.error);
      }

      const history = historyResult.data;
      const totalEntries = history.length;
      const starredEntries = history.filter((entry) => entry.is_starred).length;

      let storageSize = 0;
      if (this.isElectron && window.electronAPI.getFileSize) {
        try {
          storageSize = await window.electronAPI.getFileSize(
            this.historyFilePath
          );
        } catch (error) {
          console.warn("Could not get file size:", error);
        }
      } else {
        // Estimate size for browser storage
        const dataString = JSON.stringify(history);
        storageSize = new Blob([dataString]).size;
      }

      return {
        success: true,
        stats: {
          totalEntries,
          starredEntries,
          storageSize,
          storagePath: this.isElectron ? this.historyFilePath : "localStorage",
          lastModified: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error("❌ Failed to get storage stats:", error);
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
const jsonStorageService = new JsonStorageService();

export default jsonStorageService;
