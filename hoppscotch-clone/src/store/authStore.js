import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set, get) => ({
      // Auth state
      isAuthenticated: false,
      token: null,
      authType: null, // 'oauth2' or 'user'
      clientInfo: null, // for OAuth2
      userInfo: null, // for user auth
      tokenExpiry: null,
      isAuthModalOpen: false,
      isLoading: false,
      error: null,

      // Actions
      setOAuth2Token: (tokenData) => {
        const { access_token, client_info, expires_in } = tokenData;
        const expiryTime = new Date(Date.now() + expires_in * 1000);

        set({
          isAuthenticated: true,
          token: access_token,
          authType: "oauth2",
          clientInfo: client_info,
          userInfo: null,
          tokenExpiry: expiryTime,
          error: null,
        });
      },

      setUserToken: (tokenData) => {
        const { access_token, user, expires_in } = tokenData;
        const expiryTime = new Date(Date.now() + expires_in * 1000);

        set({
          isAuthenticated: true,
          token: access_token,
          authType: "user",
          clientInfo: null,
          userInfo: user,
          tokenExpiry: expiryTime,
          error: null,
        });
      },

      // Legacy method for backward compatibility
      setToken: (tokenData) => {
        // Detect token type based on response structure
        if (tokenData.client_info) {
          get().setOAuth2Token(tokenData);
        } else if (tokenData.user) {
          get().setUserToken(tokenData);
        }
      },

      clearAuth: () => {
        set({
          isAuthenticated: false,
          token: null,
          authType: null,
          clientInfo: null,
          userInfo: null,
          tokenExpiry: null,
          error: null,
        });
      },

      setAuthModalOpen: (isOpen) => {
        set({ isAuthModalOpen: isOpen });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      setError: (error) => {
        set({ error });
      },

      // Check if token is expired
      isTokenExpired: () => {
        const { tokenExpiry } = get();
        if (!tokenExpiry) return true;
        return new Date() >= new Date(tokenExpiry);
      },

      // Check if authentication is valid
      isValidAuth: () => {
        const { isAuthenticated, token, isTokenExpired } = get();
        return isAuthenticated && token && !isTokenExpired();
      },

      // Auto-logout on token expiry
      checkTokenExpiry: () => {
        const { isTokenExpired, clearAuth } = get();
        if (isTokenExpired()) {
          clearAuth();
          return false;
        }
        return true;
      },

      // Get auth header for API calls
      getAuthHeader: () => {
        const { token, checkTokenExpiry } = get();
        if (!checkTokenExpiry()) return null;
        return token ? `Bearer ${token}` : null;
      },
    }),
    {
      name: "hoppscotch-auth",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        authType: state.authType,
        clientInfo: state.clientInfo,
        userInfo: state.userInfo,
        tokenExpiry: state.tokenExpiry,
      }),
    }
  )
);

export default useAuthStore;
