const API_BASE_URL = "http://localhost:5001/api";

class AuthService {
  // OAuth2 Client Credentials flow
  async authenticateWithClientCredentials(clientId, clientSecret) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/oauth2/token`, {
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
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
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

  // Basic Auth - User Registration
  async registerUser(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Registration failed");
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
      const response = await fetch(`${API_BASE_URL}/auth/validate`, {
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
      const response = await fetch(`${API_BASE_URL}/auth/revoke`, {
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
      // Use the general health endpoint instead
      const response = await fetch(
        `${API_BASE_URL.replace("/api", "")}/health`
      );
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
      const response = await fetch(`${API_BASE_URL}/auth/client/${clientId}`);
      const data = await response.json();
      return response.ok ? data : null;
    } catch (error) {
      console.error("❌ Get client info error:", error);
      return null;
    }
  }
}

export default new AuthService();
