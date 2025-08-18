import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import authService from "../../services/authService";
import useAuthStore from "../../store/authStore";

const AuthModal = () => {
  const {
    isAuthModalOpen,
    setAuthModalOpen,
    setToken,
    setLoading,
    setError,
    isLoading,
    error,
  } = useAuthStore();

  const [clientId, setClientId] = useState("demo-client");
  const [clientSecret, setClientSecret] = useState("demo-secret");
  const [showSecret, setShowSecret] = useState(false);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clear form when modal opens/closes
  useEffect(() => {
    if (isAuthModalOpen) {
      setFormError("");
      setError(null);
    }
  }, [isAuthModalOpen, setError]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!clientId.trim() || !clientSecret.trim()) {
      setFormError("Both Client ID and Client Secret are required");
      return;
    }

    setIsSubmitting(true);
    setFormError("");
    setLoading(true);

    try {
      console.log("🔐 Attempting OAuth2 authentication...");
      const tokenData = await authService.authenticateWithClientCredentials(
        clientId.trim(),
        clientSecret.trim()
      );

      console.log("✅ Authentication successful:", tokenData.client_info);
      setToken(tokenData);
      setAuthModalOpen(false);

      // Show success message briefly
      setTimeout(() => {
        setError(null);
      }, 3000);
    } catch (err) {
      console.error("❌ Authentication failed:", err);
      setFormError(err.message || "Authentication failed");
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setAuthModalOpen(false);
      setFormError("");
      setError(null);
    }
  };

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-primary border border-zinc-700 rounded-lg shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-700">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-500/10 rounded-lg">
              <Lock className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Authentication Required
              </h2>
              <p className="text-sm text-zinc-400">OAuth2 Client Credentials</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Info Message */}
          <div className="flex items-start space-x-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-blue-200 font-medium mb-1">
                Demo Credentials Available
              </p>
              <p className="text-blue-300/80">
                Use{" "}
                <code className="bg-blue-500/20 px-1.5 py-0.5 rounded text-blue-200">
                  demo-client
                </code>{" "}
                and{" "}
                <code className="bg-blue-500/20 px-1.5 py-0.5 rounded text-blue-200">
                  demo-secret
                </code>{" "}
                for testing
              </p>
            </div>
          </div>

          {/* Form Error */}
          {formError && (
            <div className="flex items-center space-x-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-200">{formError}</p>
            </div>
          )}

          {/* Client ID Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-300">
              Client ID
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-zinc-400" />
              </div>
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="Enter your client ID"
                disabled={isSubmitting}
                className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                required
              />
            </div>
          </div>

          {/* Client Secret Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-300">
              Client Secret
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-zinc-400" />
              </div>
              <input
                type={showSecret ? "text" : "password"}
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                placeholder="Enter your client secret"
                disabled={isSubmitting}
                className="w-full pl-10 pr-12 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                disabled={isSubmitting}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-white transition-colors disabled:opacity-50">
                {showSecret ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 text-sm font-medium text-zinc-300 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting || !clientId.trim() || !clientSecret.trim()
              }
              className="flex-1 px-4 py-3 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2">
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Authenticate</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
