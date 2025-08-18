import {
  Check,
  Clock,
  Copy,
  LogOut,
  Shield,
  ShieldCheck,
  User,
} from "lucide-react";
import { useState } from "react";
import authService from "../../services/authService";
import useAuthStore from "../../store/authStore";

const AuthStatusIndicator = () => {
  const {
    isAuthenticated,
    authType,
    clientInfo,
    userInfo,
    tokenExpiry,
    clearAuth,
    isValidAuth,
    setAuthModalOpen,
  } = useAuthStore();

  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleLogin = () => {
    setAuthModalOpen(true);
    setShowDropdown(false);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Attempt to revoke token on server
      const token = useAuthStore.getState().token;
      if (token) {
        await authService.revokeToken(token);
      }
    } catch (error) {
      console.error("Error revoking token:", error);
    } finally {
      clearAuth();
      setIsLoggingOut(false);
      setShowDropdown(false);
    }
  };

  const copyClientId = () => {
    if (clientInfo?.client_id) {
      navigator.clipboard.writeText(clientInfo.client_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatTimeRemaining = () => {
    if (!tokenExpiry) return "Unknown";

    const now = new Date();
    const expiry = new Date(tokenExpiry);
    const diff = expiry - now;

    if (diff <= 0) return "Expired";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const isValid = isValidAuth();

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
          isValid
            ? "bg-green-500/10 text-green-400 hover:bg-green-500/20"
            : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
        }`}
        title={isValid ? "Authenticated" : "Not authenticated"}>
        {isValid ? (
          authType === "user" ? (
            <User className="w-4 h-4" />
          ) : (
            <ShieldCheck className="w-4 h-4" />
          )
        ) : (
          <Shield className="w-4 h-4" />
        )}
        <span className="text-sm font-medium hidden sm:inline">
          {isValid
            ? authType === "user"
              ? userInfo?.username || "User"
              : clientInfo?.client_name || "OAuth2"
            : "Login"}
        </span>
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-50">
          {isValid ? (
            // Authenticated State
            <div className="p-4 space-y-4">
              {/* Header */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-green-500/10 rounded-lg">
                  <ShieldCheck className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Authenticated</h3>
                  <p className="text-xs text-zinc-400">
                    {authType === "oauth2"
                      ? "OAuth2 Client Credentials"
                      : "User Session"}
                  </p>
                </div>
              </div>

              {/* OAuth2 Client Info */}
              {authType === "oauth2" && clientInfo && (
                <div className="space-y-3">
                  <div className="bg-zinc-900 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-zinc-400">
                        Client
                      </span>
                    </div>
                    <div className="text-sm text-white font-mono">
                      {clientInfo.client_name || clientInfo.client_id}
                    </div>
                  </div>

                  <div className="bg-zinc-900 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-zinc-400">
                        Client ID
                      </span>
                      <button
                        onClick={copyClientId}
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1">
                        {copied ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copied ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                    <div className="text-sm text-white font-mono">
                      {clientInfo.client_id}
                    </div>
                  </div>
                </div>
              )}

              {/* User Info */}
              {authType === "user" && userInfo && (
                <div className="space-y-3">
                  <div className="bg-zinc-900 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-zinc-400">
                        User
                      </span>
                    </div>
                    <div className="text-sm text-white">
                      {userInfo.first_name && userInfo.last_name
                        ? `${userInfo.first_name} ${userInfo.last_name}`
                        : userInfo.username}
                    </div>
                    <div className="text-xs text-zinc-400">
                      {userInfo.email}
                    </div>
                  </div>

                  <div className="bg-zinc-900 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-zinc-400">
                        Username
                      </span>
                    </div>
                    <div className="text-sm text-white font-mono">
                      {userInfo.username}
                    </div>
                  </div>

                  <div className="bg-zinc-900 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-zinc-400">
                        Role
                      </span>
                    </div>
                    <div className="text-sm text-white capitalize">
                      {userInfo.role}
                    </div>
                  </div>
                </div>
              )}

              {/* Session Expiry (for both types) */}
              {tokenExpiry && (
                <div className="bg-zinc-900 rounded-lg p-3 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3 h-3 text-zinc-400" />
                    <span className="text-xs font-medium text-zinc-400">
                      Expires in
                    </span>
                  </div>
                  <div className="text-sm text-white">
                    {formatTimeRemaining()}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="border-t border-zinc-700 pt-3">
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50">
                  {isLoggingOut ? (
                    <>
                      <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                      <span>Logging out...</span>
                    </>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            // Not Authenticated State
            <div className="p-4 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-zinc-700 rounded-lg">
                  <Shield className="w-4 h-4 text-zinc-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Not Authenticated</h3>
                  <p className="text-xs text-zinc-400">
                    Login to access protected features
                  </p>
                </div>
              </div>

              <div className="bg-zinc-900 rounded-lg p-3">
                <p className="text-sm text-zinc-300 mb-3">
                  You need to authenticate to send requests and access other
                  features.
                </p>
                <button
                  onClick={handleLogin}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                  <User className="w-4 h-4" />
                  <span>Login with OAuth2</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default AuthStatusIndicator;
