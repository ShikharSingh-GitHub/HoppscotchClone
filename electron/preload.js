const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  // App info
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),

  // Configuration
  getBackendPort: () => ipcRenderer.invoke("get-backend-port"),
  getStorageConfig: () => ipcRenderer.invoke("get-storage-config"),

  // JSON Storage methods
  getStoragePath: () => ipcRenderer.invoke("get-storage-path"),
  ensureDirectory: (dirPath) => ipcRenderer.invoke("ensure-directory", dirPath),
  readJsonFile: (filePath) => ipcRenderer.invoke("read-json-file", filePath),
  writeJsonFile: (filePath, data) =>
    ipcRenderer.invoke("write-json-file", filePath, data),
  backupJsonFile: (sourcePath, backupDir) =>
    ipcRenderer.invoke("backup-json-file", sourcePath, backupDir),

  // Installer methods
  installerComplete: () => ipcRenderer.invoke("installer-complete"),
  installerCancel: () => ipcRenderer.invoke("installer-cancel"),

  // Window controls
  minimizeWindow: () => ipcRenderer.invoke("minimize-window"),
  maximizeWindow: () => ipcRenderer.invoke("maximize-window"),
  closeWindow: () => ipcRenderer.invoke("close-window"),

  // File operations
  selectDirectory: () => ipcRenderer.invoke("select-directory"),

  // Menu events
  onMenuNewRequest: (callback) => ipcRenderer.on("menu-new-request", callback),
  onMenuSaveRequest: (callback) =>
    ipcRenderer.on("menu-save-request", callback),

  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
});

// DOM utilities for better UX
contextBridge.exposeInMainWorld("domUtils", {
  // Smooth scrolling
  smoothScrollTo: (element, duration = 300) => {
    const start = element.scrollTop;
    const target = element.scrollHeight - element.clientHeight;
    const startTime = performance.now();

    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      element.scrollTop = start + (target - start) * progress;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  },

  // Add loading states
  setLoading: (element, loading = true) => {
    if (loading) {
      element.classList.add("loading");
      element.disabled = true;
    } else {
      element.classList.remove("loading");
      element.disabled = false;
    }
  },

  // Toast notifications
  showToast: (message, type = "info", duration = 3000) => {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 6px;
      color: white;
      font-size: 14px;
      font-weight: 500;
      z-index: 10000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;

    switch (type) {
      case "success":
        toast.style.background = "#27ae60";
        break;
      case "error":
        toast.style.background = "#e74c3c";
        break;
      case "warning":
        toast.style.background = "#f39c12";
        break;
      default:
        toast.style.background = "#3498db";
    }

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.transform = "translateX(0)";
    }, 100);

    setTimeout(() => {
      toast.style.transform = "translateX(100%)";
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, duration);
  },
});
