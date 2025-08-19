import { Database, FileText, HardDrive, Zap } from "lucide-react";
import React, { useEffect, useState } from "react";
import storageInterface from "../../services/storageInterface";
import useStorageConfigStore from "../../store/storageConfigStore";

const StoragePreferenceModal = ({ isOpen, onClose, onStorageSelected }) => {
  const [selectedStorage, setSelectedStorage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [storageOptions, setStorageOptions] = useState({
    database: { available: false, checking: true },
    json: { available: true, checking: false },
  });

  const { markPreferenceModalShown } = useStorageConfigStore();

  useEffect(() => {
    if (isOpen) {
      checkStorageAvailability();
    }
  }, [isOpen]);

  const checkStorageAvailability = async () => {
    setStorageOptions((prev) => ({
      ...prev,
      database: { available: false, checking: true },
    }));

    try {
      // Check database availability
      const dbAvailable = await useStorageConfigStore
        .getState()
        .testDatabaseConnection();

      setStorageOptions({
        database: { available: dbAvailable, checking: false },
        json: { available: true, checking: false },
      });

      // If database is available, pre-select it
      if (dbAvailable && !selectedStorage) {
        setSelectedStorage("database");
      } else if (!selectedStorage) {
        setSelectedStorage("json");
      }
    } catch (error) {
      console.error("Error checking storage availability:", error);
      setStorageOptions({
        database: { available: false, checking: false },
        json: { available: true, checking: false },
      });
      if (!selectedStorage) {
        setSelectedStorage("json");
      }
    }
  };

  const handleStorageSelect = async () => {
    if (!selectedStorage) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log(`🔄 Switching to ${selectedStorage} storage...`);

      // Use storage config store's switchStorageType method
      const storageConfig = useStorageConfigStore.getState();
      const result = await storageConfig.switchStorageType(selectedStorage);

      if (!result.success) {
        throw new Error(result.error || "Failed to switch storage type");
      }

      // Mark modal as shown
      markPreferenceModalShown();

      console.log(`✅ Successfully switched to ${selectedStorage} storage`);

      // Notify parent component
      if (onStorageSelected) {
        onStorageSelected(selectedStorage);
      }

      onClose();

      // Trigger a storage re-check to update the UI
      setTimeout(async () => {
        await storageConfig.checkAvailability();
        console.log("🔄 Storage availability rechecked after switch");
      }, 100);
    } catch (error) {
      console.error("Failed to switch storage:", error);
      setError(error.message || "Failed to switch storage type");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-primaryDark border border-dividerLight rounded-lg p-6 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <HardDrive className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Choose Storage Method
          </h2>
          <p className="text-zinc-400 text-sm">
            Select how you'd like to store your request history. You can change
            this later in settings.
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {/* Database Storage Option */}
          <div
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedStorage === "database"
                ? "border-accent bg-accent bg-opacity-10"
                : "border-dividerLight hover:border-zinc-500"
            } ${
              !storageOptions.database.available &&
              !storageOptions.database.checking
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            onClick={() => {
              if (storageOptions.database.available) {
                setSelectedStorage("database");
              }
            }}>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Database className="w-6 h-6 text-accent mt-1" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium text-white">Database Storage</h3>
                  {storageOptions.database.checking && (
                    <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {storageOptions.database.available && (
                    <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">
                      Available
                    </span>
                  )}
                  {!storageOptions.database.available &&
                    !storageOptions.database.checking && (
                      <span className="px-2 py-1 bg-red-600 text-white text-xs rounded">
                        Unavailable
                      </span>
                    )}
                </div>
                <p className="text-zinc-400 text-sm mt-1">
                  Store history in MySQL database. Best for shared environments
                  and large datasets.
                </p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-zinc-500">
                  <span>✓ Shared access</span>
                  <span>✓ Advanced search</span>
                  <span>✓ Backup & sync</span>
                </div>
              </div>
            </div>
          </div>

          {/* JSON Storage Option */}
          <div
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedStorage === "json"
                ? "border-accent bg-accent bg-opacity-10"
                : "border-dividerLight hover:border-zinc-500"
            }`}
            onClick={() => setSelectedStorage("json")}>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <FileText className="w-6 h-6 text-blue-400 mt-1" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium text-white">JSON Storage</h3>
                  <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">
                    No Setup
                  </span>
                </div>
                <p className="text-zinc-400 text-sm mt-1">
                  Store history locally in JSON files. No database setup
                  required.
                </p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-zinc-500">
                  <span>✓ No setup</span>
                  <span>✓ Local files</span>
                  <span>✓ Export/Import</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-600 bg-opacity-20 border border-red-600 rounded-lg p-3 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-dividerLight text-zinc-400 rounded-lg hover:bg-zinc-800 transition-colors"
            disabled={isLoading}>
            Cancel
          </button>
          <button
            onClick={handleStorageSelect}
            disabled={!selectedStorage || isLoading}
            className="flex-1 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Setting up...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Continue</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-zinc-500 text-xs">
            You can change storage method anytime in Settings → Storage
          </p>
        </div>
      </div>
    </div>
  );
};

export default StoragePreferenceModal;
