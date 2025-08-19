# 🌐 **BROWSER TESTING GUIDE - JSON Storage Functionality**

## 🚀 **Getting Started**

### **1. Open Your Browser**

- Navigate to: **http://localhost:5173**
- Open **Developer Tools** (F12 or Cmd+Option+I on Mac)
- Go to the **Console** tab to see debug messages

---

## 🧪 **Testing Scenarios**

### **Scenario 1: Initial Storage Setup**

#### **What to Test:**

- First-time user experience
- Storage type selection
- Automatic JSON storage initialization

#### **Steps:**

1. **Clear Browser Storage** (to simulate first-time user):

   ```javascript
   // Run in browser console:
   localStorage.clear();
   location.reload();
   ```

2. **Watch Console Messages**:

   - Look for: `"🚀 Initializing Hoppscotch Clone..."`
   - Look for: `"✅ History storage initialized successfully"`

3. **Check Storage Type**:
   ```javascript
   // Run in browser console:
   console.log(
     "Current storage config:",
     localStorage.getItem("hoppscotch_storage_config")
   );
   console.log("Current history:", localStorage.getItem("hoppscotch_history"));
   ```

### **Scenario 2: Making API Requests & History Storage**

#### **What to Test:**

- JSON storage saving request history
- History persistence
- History display

#### **Steps:**

1. **Make a Test Request**:

   - Go to the REST panel
   - Enter URL: `https://jsonplaceholder.typicode.com/posts/1`
   - Method: `GET`
   - Click **Send**

2. **Verify History Storage**:

   ```javascript
   // Run in browser console:
   const history = JSON.parse(
     localStorage.getItem("hoppscotch_history") || "[]"
   );
   console.log("📚 History entries:", history.length);
   console.log("📝 Latest entry:", history[0]);
   ```

3. **Check History Panel**:
   - Open the History tab in the right panel
   - Verify your request appears
   - Try clicking on a history item to restore it

### **Scenario 3: Settings Panel Storage Configuration**

#### **What to Test:**

- Storage settings interface
- Storage status indicators
- Storage type switching

#### **Steps:**

1. **Open Settings**:

   - Click the ⚙️ Settings icon in the sidebar
   - Scroll down to the **Storage** section

2. **Check Storage Status**:

   - Verify "Current Storage Type" shows your selection
   - Check storage availability indicators (green/red dots)
   - Look for storage status cards

3. **Test Storage Actions**:
   - Try the "Change Storage Type" button
   - Test "Export History" button
   - Test storage info display

### **Scenario 4: JSON Storage Operations**

#### **What to Test:**

- CRUD operations via browser console
- Data persistence
- Error handling

#### **Steps:**

1. **Direct Storage Testing**:

   ```javascript
   // Run in browser console:

   // Test adding entry
   const testEntry = {
     id: Date.now(),
     method: "POST",
     url: "https://test-manual.com",
     headers: { "Content-Type": "application/json" },
     body: { test: "manual" },
     responseStatus: 200,
     timestamp: new Date().toISOString(),
   };

   // Get current history
   let history = JSON.parse(localStorage.getItem("hoppscotch_history") || "[]");

   // Add test entry
   history.unshift(testEntry);
   localStorage.setItem("hoppscotch_history", JSON.stringify(history));

   console.log("✅ Added test entry");

   // Refresh page to test persistence
   location.reload();
   ```

2. **After Page Reload**:
   ```javascript
   // Verify persistence
   const persistedHistory = JSON.parse(
     localStorage.getItem("hoppscotch_history") || "[]"
   );
   console.log("📚 Persisted entries:", persistedHistory.length);
   console.log(
     "🔍 Test entry found:",
     persistedHistory.find((h) => h.url === "https://test-manual.com")
   );
   ```

### **Scenario 5: Large Dataset Testing**

#### **What to Test:**

- Performance with many history entries
- UI responsiveness
- Search/filter functionality

#### **Steps:**

1. **Generate Large Dataset**:

   ```javascript
   // Run in browser console:
   const generateLargeHistory = (count = 100) => {
     const largeHistory = Array.from({ length: count }, (_, i) => ({
       id: Date.now() + i,
       method: i % 2 === 0 ? "GET" : "POST",
       url: `https://api-${i}.test.com/endpoint`,
       headers: { "Content-Type": "application/json" },
       body: {},
       responseStatus: 200,
       responseTime: Math.floor(Math.random() * 500) + 50,
       timestamp: new Date(Date.now() - i * 60000).toISOString(),
       tabTitle: `Test Request ${i}`,
     }));

     localStorage.setItem("hoppscotch_history", JSON.stringify(largeHistory));
     console.log(`✅ Generated ${count} test entries`);
     location.reload();
   };

   generateLargeHistory(50); // Start with 50 entries
   ```

2. **Test Performance**:
   - Check if history loads quickly
   - Test scrolling through history
   - Verify UI remains responsive

### **Scenario 6: Storage Switching Simulation**

#### **What to Test:**

- Switching between storage types
- Data preservation during switches
- Error handling when database unavailable

#### **Steps:**

1. **Simulate Storage Preference Modal**:

   ```javascript
   // Run in browser console:

   // Check current storage config
   const currentConfig = JSON.parse(
     localStorage.getItem("hoppscotch_storage_config") || "{}"
   );
   console.log("Current config:", currentConfig);

   // Test storage availability checking
   console.log("Testing storage availability...");

   // JSON storage should always be available
   const jsonAvailable = !!window.localStorage;
   console.log("JSON storage available:", jsonAvailable);

   // Database storage (will likely be unavailable in browser-only mode)
   fetch("http://localhost:5001/api/health")
     .then((res) => res.ok)
     .then((available) => console.log("Database storage available:", available))
     .catch(() => console.log("Database storage available:", false));
   ```

2. **Test Storage Type Switching**:

   ```javascript
   // Switch to JSON storage explicitly
   const newConfig = {
     storageType: "json",
     lastUpdated: new Date().toISOString(),
   };

   localStorage.setItem("hoppscotch_storage_config", JSON.stringify(newConfig));
   console.log("✅ Switched to JSON storage");
   location.reload();
   ```

---

## 🔍 **What to Look For**

### **✅ Success Indicators:**

- Console shows: `"✅ History storage initialized successfully"`
- History entries appear in localStorage
- History panel displays saved requests
- Settings panel shows storage status
- No error messages in console
- Smooth UI interactions

### **⚠️ Warning Signs:**

- Console errors related to storage
- History not persisting after page reload
- Storage settings not loading
- Slow performance with large datasets

### **❌ Issues to Report:**

- JavaScript errors in console
- Data loss after page refresh
- Storage switching failures
- UI freezing or unresponsiveness

---

## 🐛 **Debugging Tools**

### **Browser Console Commands:**

```javascript
// Check storage state
console.log(
  "Storage Config:",
  localStorage.getItem("hoppscotch_storage_config")
);
console.log("History Data:", localStorage.getItem("hoppscotch_history"));

// Check history count
const history = JSON.parse(localStorage.getItem("hoppscotch_history") || "[]");
console.log("History entries:", history.length);

// Clear all storage (reset to fresh state)
localStorage.clear();
console.log("✅ Storage cleared");

// Monitor storage changes
const originalSetItem = localStorage.setItem;
localStorage.setItem = function (key, value) {
  console.log(
    `📝 localStorage.setItem('${key}', ${value.substring(0, 100)}...)`
  );
  originalSetItem.apply(this, arguments);
};
```

### **Network Tab Monitoring:**

- Watch for API calls to `http://localhost:5001` (database attempts)
- No network requests should be needed for JSON storage operations
- Any failed database requests should not break JSON storage

---

## 🎯 **Expected Results**

After testing, you should see:

1. **✅ JSON Storage Working**: History saves to localStorage automatically
2. **✅ UI Integration**: Settings panel shows storage options
3. **✅ Data Persistence**: History survives page reloads
4. **✅ Performance**: Fast operations even with many entries
5. **✅ Error Resilience**: Graceful handling of any issues

---

## 📝 **Testing Checklist**

- [ ] Application loads without errors
- [ ] Storage initializes automatically
- [ ] API requests get saved to history
- [ ] History persists after page reload
- [ ] Settings panel shows storage options
- [ ] Large datasets perform well
- [ ] Console shows success messages
- [ ] No critical errors in browser tools

---

**🚀 Ready to test? Open http://localhost:5173 in your browser and follow the scenarios above!**
