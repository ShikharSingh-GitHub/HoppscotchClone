// Try to get backend port from window configuration (set by Electron) or environment, fallback to 5001
const getBackendPort = async () => {
  // Check if running in Electron and has configuration
  if (window.electronAPI && window.electronAPI.getBackendPort) {
    try {
      const port = await window.electronAPI.getBackendPort();
      return port;
    } catch (error) {
      console.warn("Failed to get backend port from Electron:", error);
    }
  }

  // Check environment variables (for development)
  if (import.meta.env.VITE_BACKEND_PORT) {
    return import.meta.env.VITE_BACKEND_PORT;
  }

  // Default fallback
  return 5001;
};

class ApiService {
  constructor() {
    this.baseURL = null; // Will be set lazily
    this.backendPort = null;
  }

  async getBaseURL() {
    if (!this.baseURL) {
      const port = await getBackendPort();
      this.baseURL = `http://localhost:${port}/api`;
      console.log("🔧 API Service initialized with base URL:", this.baseURL);
    }
    return this.baseURL;
  }

  async getHistory() {
    try {
      const baseURL = await this.getBaseURL();
      const response = await fetch(`${baseURL}/history`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Get history failed:", error);
      throw error;
    }
  }

  async addToHistory(requestData) {
    console.log("Sending to history:", requestData);

    // Ensure headers are properly formatted before sending
    const cleanedData = {
      ...requestData,
      headers: this.ensureProperHeaders(requestData.headers),
      responseHeaders: this.ensureProperHeaders(requestData.responseHeaders),
    };

    console.log("Cleaned data:", cleanedData);

    try {
      const baseURL = await this.getBaseURL();
      const response = await fetch(`${baseURL}/history`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanedData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Server returned ${response.status}: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Add to history failed:", error);
      throw error;
    }
  }

  // Helper method to ensure headers are properly formatted
  ensureProperHeaders(headers) {
    if (!headers) return {};

    if (typeof headers === "string") {
      try {
        return JSON.parse(headers);
      } catch (e) {
        console.error("Failed to parse headers string:", headers);
        return {};
      }
    }

    if (typeof headers === "object") {
      return headers;
    }

    return {};
  }

  async deleteHistory(id) {
    try {
      const baseURL = await this.getBaseURL();
      const response = await fetch(`${baseURL}/history/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Delete history failed:", error);
      throw error;
    }
  }

  async toggleHistoryStar(id) {
    try {
      const baseURL = await this.getBaseURL();
      const response = await fetch(`${baseURL}/history/${id}/star`, {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Toggle history star failed:", error);
      throw error;
    }
  }

  async clearAllHistory() {
    try {
      const baseURL = await this.getBaseURL();
      const response = await fetch(`${baseURL}/history/clear`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Clear all history failed:", error);
      throw error;
    }
  }
}

const apiService = new ApiService();
export default apiService;
