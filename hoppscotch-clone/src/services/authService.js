// Get backend port from window config (Electron) or environment, fallback to 5001
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

class AuthService {
  constructor() {
    this.baseURL = null; // Will be set lazily
  }

  async getBaseURL() {
    if (!this.baseURL) {
      const port = await getBackendPort();
      this.baseURL = `http://localhost:${port}/api`;
      console.log("🔐 Auth Service initialized with base URL:", this.baseURL);
    }
    return this.baseURL;
  }

  // OAuth2 Client Credentials flow
  async authenticateWithClientCredentials(clientId, clientSecret) {
    try {
      const baseURL = await this.getBaseURL();
      const response = await fetch(`${baseURL}/auth/oauth2/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grant_type: "client_credentials",
          client_id: clientId,
          client_secret: clientSecret,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error_description || data.error || "Authentication failed"
        );
      }

      return data;
    } catch (error) {
      console.error("❌ Authentication error:", error);
      throw error;
    }
  }

  // Basic Auth - User Login
  async loginUser(username, password) {
    try {
      const baseURL = await this.getBaseURL();
      const response = await fetch(`${baseURL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Login failed");
      }

      return data;
    } catch (error) {
      console.error("❌ Login error:", error);
      throw error;
    }
  }

  // Basic Auth - Register User
  async registerUser(userDetails) {
    try {
      const baseURL = await this.getBaseURL();
      const response = await fetch(`${baseURL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userDetails),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error_description || data.error || "Registration failed"
        );
      }

      return data;
    } catch (error) {
      console.error("❌ Registration error:", error);
      throw error;
    }
  }

  // Validate current token
  async validateToken(token) {
    try {
      const baseURL = await this.getBaseURL();
      const response = await fetch(`${baseURL}/auth/validate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      return response.ok ? data : null;
    } catch (error) {
      console.error("❌ Token validation error:", error);
      return null;
    }
  }

  // Revoke token (logout)
  async revokeToken(token) {
    try {
      const baseURL = await this.getBaseURL();
      const response = await fetch(`${baseURL}/auth/revoke`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      return response.ok;
    } catch (error) {
      console.error("❌ Token revocation error:", error);
      return false;
    }
  }

  // Check auth system health
  async checkAuthHealth() {
    try {
      const baseURL = await this.getBaseURL();
      // Use the general health endpoint instead
      const response = await fetch(`${baseURL.replace("/api", "")}/health`);
      const data = await response.json();
      return response.ok ? data : null;
    } catch (error) {
      console.error("❌ Auth health check error:", error);
      return null;
    }
  }

  // Get client information
  async getClientInfo(clientId) {
    try {
      const baseURL = await this.getBaseURL();
      const response = await fetch(`${baseURL}/auth/client/${clientId}`);
      const data = await response.json();
      return response.ok ? data : null;
    } catch (error) {
      console.error("❌ Get client info error:", error);
      return null;
    }
  }
}

export default new AuthService();
