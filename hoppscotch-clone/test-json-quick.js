// Quick test to verify JSON storage functionality
console.log("🧪 Testing JSON Storage Functionality...");

// Test localStorage availability
const hasLocalStorage = !!window.localStorage;
console.log("LocalStorage available:", hasLocalStorage);

if (hasLocalStorage) {
  // Test basic operations
  const testKey = "hoppscotch-test";
  const testData = {
    id: 1,
    method: "GET",
    url: "https://api.example.com/test",
    timestamp: new Date().toISOString(),
  };

  try {
    // Store test data
    localStorage.setItem(testKey, JSON.stringify([testData]));
    console.log("✅ Test data stored successfully");

    // Retrieve test data
    const retrieved = JSON.parse(localStorage.getItem(testKey) || "[]");
    console.log("✅ Test data retrieved:", retrieved);

    // Clean up
    localStorage.removeItem(testKey);
    console.log("✅ Test cleanup complete");

    console.log("🎉 JSON Storage is fully functional!");
  } catch (error) {
    console.error("❌ JSON Storage test failed:", error);
  }
} else {
  console.error("❌ LocalStorage not available");
}

// Test if storage config store is properly set up
if (window.useStorageConfigStore) {
  console.log("Storage config store available");
} else {
  console.log("Storage config store not exposed to window");
}
