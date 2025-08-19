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
          // JSON storage is always available in modern browsers (no login required)
          const jsonAvailable =
            typeof Storage !== "undefined" && window.localStorage !== undefined;
          console.log(
            "📄 JSON storage available:",
            jsonAvailable,
            "(no login required)"
          );

          // Test database storage (requires backend connection)
          console.log("🔍 Testing database connection...");
          const dbAvailable = await get().testDatabaseConnection();
          console.log(
            "🗄️ Database available:",
            dbAvailable,
            "(requires backend server)"
          );

          const availability = {
            json: jsonAvailable, // Always true in browser environment
            database: dbAvailable,
            lastChecked: new Date().toISOString(),
          };

          // Update state with availability
          set({ storageAvailability: availability });

          console.log("📊 Final storage availability:", availability);
          console.log("💡 JSON storage works offline without login!");
          return availability;
        } catch (error) {
          console.error("❌ Error checking storage availability:", error);
          // Even if there's an error, JSON storage should still be available
          const fallback = {
            json: true, // JSON is always available as fallback
            database: false,
            lastChecked: new Date().toISOString(),
          };
          set({ storageAvailability: fallback });
          console.log("🔄 Using fallback availability - JSON storage ready!");
          return fallback;
        }
      },

      // Initialize storage configuration
      initializeStorage: async () => {
        const state = get();
        console.log("🔧 Initializing storage configuration...");
        console.log("Current storage type:", state.storageType);

        // Always default to JSON storage (no login required)
        // This ensures users can start using the app immediately
        if (!state.storageType) {
          console.log("🎯 Defaulting to JSON storage - no login required!");
          set({
            storageType: "json",
            isFirstTime: false,
          });
          set({
            jsonConfig: {
              ...state.jsonConfig,
              enabled: true,
            },
          });
        }

        // Check database availability in background (for future switching)
        // This doesn't affect JSON storage functionality
        try {
          const dbAvailable = await get().testDatabaseConnection();
          console.log("Database available for switching:", dbAvailable);

          if (dbAvailable) {
            set({
              storageAvailability: {
                ...get().storageAvailability,
                database: true,
              },
              databaseConfig: {
                ...state.databaseConfig,
                connected: true,
              },
            });
          }
        } catch (error) {
          console.log(
            "Database check failed (JSON storage unaffected):",
            error.message
          );
        }

        // Update status - JSON storage is always ready
        set({
          status: {
            ...state.status,
            isConfigured: true,
            currentStorage: get().storageType,
            isAvailable: true,
          },
        });

        console.log(
          "✅ Storage configuration complete. Type:",
          get().storageType
        );
        console.log("🎉 JSON storage ready - no login required!");
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

      // Enable JSON-only mode (no login required, works offline)
      enableJSONOnlyMode: () => {
        console.log("🎯 Enabling JSON-only mode - no login required!");
        set({
          storageType: "json",
          isFirstTime: false,
          storageAvailability: {
            json: true,
            database: false, // Don't check database in JSON-only mode
            lastChecked: new Date().toISOString(),
          },
          jsonConfig: {
            ...get().jsonConfig,
            enabled: true,
          },
          databaseConfig: {
            ...get().databaseConfig,
            enabled: false,
            connected: false,
          },
          status: {
            isConfigured: true,
            currentStorage: "json",
            lastError: null,
            isAvailable: true,
          },
        });
        console.log(
          "✅ JSON-only mode enabled - ready to store history offline!"
        );
      },

      // Handle successful authentication and complete database switch
      handleAuthSuccess: async () => {
        const { pendingDatabaseSwitch } = get();

        if (pendingDatabaseSwitch) {
          console.log(
            "🔐 Authentication successful - completing database switch"
          );

          // Clear the pending switch flag
          set({ pendingDatabaseSwitch: false });

          // Now attempt the database switch again
          const result = await get().switchStorageType("database");

          if (result.success) {
            console.log(
              "✅ Successfully switched to database storage after authentication"
            );
          } else {
            console.error(
              "❌ Failed to switch to database storage after authentication:",
              result.error
            );
          }

          return result;
        }

        return { success: false, error: "No pending database switch" };
      },

      // Set pending database switch flag
      setPendingDatabaseSwitch: () => {
        console.log("📝 Setting pending database switch flag");
        set({ pendingDatabaseSwitch: true });
      },

      // Initialize the store and set up auth listener
      initialize: () => {
        const { initializeStorage } = get();

        // Initialize storage configuration
        initializeStorage();

        // Set up auth state listener for automatic database switching
        const setupAuthListener = async () => {
          try {
            const { default: useAuthStore } = await import(
              "../store/authStore"
            );

            // Subscribe to auth store changes
            useAuthStore.subscribe((state, prevState) => {
              // Check if authentication just succeeded
              const wasNotAuthenticated =
                !prevState.isAuthenticated || !prevState.token;
              const isNowAuthenticated =
                state.isAuthenticated && state.token && !state.isTokenExpired();

              if (wasNotAuthenticated && isNowAuthenticated) {
                console.log(
                  "🎉 Authentication detected - checking for pending database switch"
                );

                // Handle the successful authentication
                get().handleAuthSuccess();

                // Close the auth modal
                useAuthStore.getState().setAuthModalOpen(false);
              }
            });

            console.log("✅ Auth listener set up successfully");
          } catch (error) {
            console.error("❌ Failed to set up auth listener:", error);
          }
        };

        setupAuthListener();
      },

      // Switch storage type with authentication check
      switchStorageType: async (newType) => {
        const currentType = get().storageType;

        if (currentType === newType) {
          console.log(`Already using ${newType} storage`);
          return { success: true };
        }

        console.log(`🔄 Switching storage from ${currentType} to ${newType}`);

        // If switching to database storage, check authentication
        if (newType === "database") {
          console.log("🔐 Database storage requires authentication");

          // Import auth store dynamically to avoid circular dependency
          try {
            const { default: useAuthStore } = await import(
              "../store/authStore"
            );
            const authState = useAuthStore.getState();

            // Check if user is already authenticated
            if (!authState.isValidAuth()) {
              console.log("❌ Not authenticated - showing login modal");

              // Store pending switch for after authentication
              get().setPendingDatabaseSwitch();

              // Show auth modal
              authState.setAuthModalOpen(true);

              return {
                success: false,
                error: "Authentication required for database storage",
                requiresAuth: true,
              };
            }

            console.log(
              "✅ User is authenticated - proceeding with database storage"
            );
          } catch (error) {
            console.error("❌ Failed to check authentication:", error);
            return {
              success: false,
              error: "Authentication check failed",
            };
          }
        }

        try {
          // Update configuration
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
