import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Storage Configuration Store
 * Manages user preferences for history storage (Database vs JSON)
 */
const useStorageConfigStore = create(
  persist(
    (set, get) => ({
      // Current storage configuration
      storageType: null, // "database" | "json" | null (not configured)
      isFirstTime: true,
      hasShownPreferenceModal: false,

      // Storage availability status
      storageAvailability: {
        json: true, // JSON is always available in browser
        database: false,
        lastChecked: null,
      },

      // Database storage configuration
      databaseConfig: {
        enabled: false,
        connected: false,
        lastSyncTime: null,
        connectionError: null,
      },

      // JSON storage configuration
      jsonConfig: {
        enabled: false,
        filePath: null, // For Electron app
        lastBackupTime: null,
        autoBackup: true,
        maxBackups: 5,
      },

      // User preferences
      preferences: {
        autoSync: true,
        backupInterval: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
        maxHistoryEntries: 1000,
        enableEncryption: true,
      },

      // Storage status
      status: {
        isConfigured: false,
        currentStorage: null,
        lastError: null,
        isAvailable: false,
      },

      // Actions
      setStorageType: (type) => {
        console.log(`🗄️ Setting storage type to: ${type}`);
        set((state) => ({
          storageType: type,
          isFirstTime: false,
          status: {
            ...state.status,
            isConfigured: true,
            currentStorage: type,
          },
        }));
      },

      setDatabaseConfig: (config) => {
        set((state) => ({
          databaseConfig: {
            ...state.databaseConfig,
            ...config,
          },
        }));
      },

      setJsonConfig: (config) => {
        set((state) => ({
          jsonConfig: {
            ...state.jsonConfig,
            ...config,
          },
        }));
      },

      setPreferences: (prefs) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            ...prefs,
          },
        }));
      },

      setStatus: (status) => {
        set((state) => ({
          status: {
            ...state.status,
            ...status,
          },
        }));
      },

      markPreferenceModalShown: () => {
        set({ hasShownPreferenceModal: true });
      },

      // Check storage availability
      checkAvailability: async () => {
        console.log("🔍 Checking storage availability...");

        try {
          // Test JSON storage (always available in browser)
          const jsonAvailable = !!window.localStorage;
          console.log("📄 JSON storage available:", jsonAvailable);

          // Test database storage
          console.log("🔍 Testing database connection...");
          const dbAvailable = await get().testDatabaseConnection();
          console.log("🗄️ Database available:", dbAvailable);

          const availability = {
            json: jsonAvailable,
            database: dbAvailable,
            lastChecked: new Date().toISOString(),
          };

          // Update state with availability
          set({ storageAvailability: availability });

          console.log("📊 Final storage availability:", availability);
          return availability;
        } catch (error) {
          console.error("❌ Error checking storage availability:", error);
          const fallback = {
            json: true, // Fallback to JSON
            database: false,
            lastChecked: new Date().toISOString(),
          };
          set({ storageAvailability: fallback });
          return fallback;
        }
      },

      // Initialize storage configuration
      initializeStorage: async () => {
        const state = get();
        console.log("🔧 Initializing storage configuration...");
        console.log("Current storage type:", state.storageType);

        // Check if running in Electron
        const isElectron = window.electronAPI !== undefined;

        // Test database connection
        const dbAvailable = await get().testDatabaseConnection();
        console.log("Database available:", dbAvailable);

        // Set default storage based on environment and availability
        if (!state.storageType) {
          if (dbAvailable) {
            console.log(
              "✅ Database available, defaulting to database storage"
            );
            set({ storageType: "database" });
            set({
              databaseConfig: {
                ...state.databaseConfig,
                enabled: true,
                connected: true,
              },
            });
          } else {
            console.log(
              "📄 Database not available, defaulting to JSON storage"
            );
            set({ storageType: "json" });
            set({
              jsonConfig: {
                ...state.jsonConfig,
                enabled: true,
              },
            });
          }
        }

        // Update status
        set({
          status: {
            ...state.status,
            isConfigured: true,
            currentStorage: get().storageType,
            isAvailable: true,
          },
        });

        console.log(
          "🔧 Storage configuration complete. Type:",
          get().storageType
        );
        return { success: true };
      },

      // Test database connection
      testDatabaseConnection: async () => {
        try {
          console.log("🔍 Testing database connection...");

          // Try to get base URL from API service
          const port = window.electronAPI
            ? await window.electronAPI.getBackendPort?.()
            : 5001;

          const baseURL = `http://localhost:${port}`;
          const healthURL = `${baseURL}/health`;

          console.log("🌐 Testing connection to:", healthURL);

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          const response = await fetch(healthURL, {
            method: "GET",
            signal: controller.signal,
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          });

          clearTimeout(timeoutId);

          console.log("📡 Health check response status:", response.status);

          if (response.ok) {
            const data = await response.json();
            console.log("✅ Database server response:", data);

            set({
              databaseConfig: {
                ...get().databaseConfig,
                connected: true,
                lastSyncTime: new Date().toISOString(),
                connectionError: null,
              },
            });

            return true;
          } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
        } catch (error) {
          console.warn("❌ Database connection test failed:", error.message);

          let errorMessage = error.message;
          if (error.name === "AbortError") {
            errorMessage = "Connection timeout";
          } else if (error.message.includes("fetch")) {
            errorMessage = "Network error - server may be down";
          }

          set({
            databaseConfig: {
              ...get().databaseConfig,
              connected: false,
              connectionError: errorMessage,
            },
          });

          return false;
        }
      },

      // Switch storage type with data migration
      switchStorageType: async (newType) => {
        const currentType = get().storageType;

        if (currentType === newType) {
          console.log(`Already using ${newType} storage`);
          return { success: true };
        }

        console.log(`🔄 Switching storage from ${currentType} to ${newType}`);

        try {
          // Update configuration first
          set({ storageType: newType });

          if (newType === "database") {
            set({
              databaseConfig: { ...get().databaseConfig, enabled: true },
              jsonConfig: { ...get().jsonConfig, enabled: false },
            });
          } else {
            set({
              jsonConfig: { ...get().jsonConfig, enabled: true },
              databaseConfig: { ...get().databaseConfig, enabled: false },
            });
          }

          // Import storage interface dynamically to avoid circular dependency
          const storageInterface = (
            await import("../services/storageInterface")
          ).default;

          // Switch the storage interface to use the new type
          const switchResult = await storageInterface.switchToStorageType(
            newType
          );

          if (!switchResult.success) {
            throw new Error(
              switchResult.error || `Failed to initialize ${newType} storage`
            );
          }

          // Reinitialize the storage interface to ensure it's properly set up
          const initResult = await storageInterface.initialize();

          if (!initResult.success) {
            throw new Error(
              initResult.error || `Failed to reinitialize ${newType} storage`
            );
          }

          console.log(`✅ Successfully switched to ${newType} storage`);
          return { success: true };
        } catch (error) {
          console.error("❌ Storage switch failed:", error);

          // Revert the storage type on failure
          set({ storageType: currentType });

          set({
            status: { ...get().status, lastError: error.message },
          });

          return { success: false, error: error.message };
        }
      },

      // Get current storage configuration summary
      getStorageSummary: () => {
        const state = get();
        return {
          type: state.storageType,
          isConfigured: state.status.isConfigured,
          isFirstTime: state.isFirstTime,
          databaseConnected: state.databaseConfig.connected,
          jsonEnabled: state.jsonConfig.enabled,
          hasError: !!state.status.lastError,
          needsConfiguration: !state.storageType || state.isFirstTime,
        };
      },

      // Reset configuration (for testing or re-setup)
      resetConfiguration: () => {
        set({
          storageType: null,
          isFirstTime: true,
          hasShownPreferenceModal: false,
          databaseConfig: {
            enabled: false,
            connected: false,
            lastSyncTime: null,
            connectionError: null,
          },
          jsonConfig: {
            enabled: false,
            filePath: null,
            lastBackupTime: null,
            autoBackup: true,
            maxBackups: 5,
          },
          status: {
            isConfigured: false,
            currentStorage: null,
            lastError: null,
            isAvailable: false,
          },
        });
      },

      // Validate current configuration
      validateConfiguration: () => {
        const state = get();
        const errors = [];

        if (!state.storageType) {
          errors.push("No storage type selected");
        }

        if (
          state.storageType === "database" &&
          !state.databaseConfig.connected
        ) {
          errors.push("Database storage selected but not connected");
        }

        if (state.storageType === "json" && !state.jsonConfig.enabled) {
          errors.push("JSON storage selected but not enabled");
        }

        return {
          isValid: errors.length === 0,
          errors,
        };
      },
    }),
    {
      name: "hoppscotch-storage-config",
      partialize: (state) => ({
        storageType: state.storageType,
        isFirstTime: state.isFirstTime,
        hasShownPreferenceModal: state.hasShownPreferenceModal,
        databaseConfig: state.databaseConfig,
        jsonConfig: state.jsonConfig,
        preferences: state.preferences,
      }),
    }
  )
);

export default useStorageConfigStore;
