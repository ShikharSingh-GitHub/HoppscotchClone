const API_BASE_URL = "http://localhost:5001/api";

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async getHistory() {
    try {
      const response = await fetch(`${this.baseURL}/history`);

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
      const response = await fetch(`${this.baseURL}/history`, {
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
      const response = await fetch(`${this.baseURL}/history/${id}`, {
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
      const response = await fetch(`${this.baseURL}/history/${id}/star`, {
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
      const response = await fetch(`${this.baseURL}/history/clear`, {
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
