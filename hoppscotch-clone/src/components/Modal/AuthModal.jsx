import React, { useEffect, useState } from "react";
import authService from "../../services/authService";
import useAuthStore from "../../store/authStore";

const AuthModal = () => {
  const {
    isAuthModalOpen,
    setAuthModalOpen,
    setOAuth2Token,
    setUserToken,
    setLoading,
    setError,
    isLoading,
    error,
  } = useAuthStore();

  const [authMode, setAuthMode] = useState("oauth2"); // 'oauth2' or 'login' or 'register'

  // OAuth2 form state
  const [oauth2Form, setOauth2Form] = useState({
    clientId: "demo-client",
    clientSecret: "demo-secret",
  });

  // User login form state
  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });

  // User registration form state
  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });

  // Function to clear all form data
  const clearAllForms = () => {
    setOauth2Form({
      clientId: "demo-client",
      clientSecret: "demo-secret",
    });
    setLoginForm({
      username: "",
      password: "",
    });
    setRegisterForm({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    });
    setError(null);
  };

  // Clear forms when modal opens/closes
  useEffect(() => {
    if (isAuthModalOpen) {
      setError(null);
    } else {
      // Clear all forms when modal closes
      clearAllForms();
    }
  }, [isAuthModalOpen]);

  // Clear forms when switching auth modes
  useEffect(() => {
    setError(null);
    // Don't clear forms when switching modes to preserve user input
    // but clear errors
  }, [authMode]);

  if (!isAuthModalOpen) return null;

  const handleOAuth2Submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await authService.authenticateWithClientCredentials(
        oauth2Form.clientId,
        oauth2Form.clientSecret
      );
      setOAuth2Token(result);
      clearAllForms(); // Clear forms after successful auth
      setAuthModalOpen(false);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await authService.loginUser(
        loginForm.username,
        loginForm.password
      );
      setUserToken(result);
      clearAllForms(); // Clear forms after successful login
      setAuthModalOpen(false);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (registerForm.password !== registerForm.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const userData = {
        username: registerForm.username,
        email: registerForm.email,
        password: registerForm.password,
        first_name: registerForm.firstName,
        last_name: registerForm.lastName,
      };

      const result = await authService.registerUser(userData);
      setUserToken(result);
      clearAllForms(); // Clear forms after successful registration
      setAuthModalOpen(false);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderOAuth2Form = () => (
    <form onSubmit={handleOAuth2Submit} className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">
        OAuth2 Client Credentials
      </h3>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Client ID
        </label>
        <input
          type="text"
          value={oauth2Form.clientId}
          onChange={(e) =>
            setOauth2Form({ ...oauth2Form, clientId: e.target.value })
          }
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Client Secret
        </label>
        <input
          type="password"
          value={oauth2Form.clientSecret}
          onChange={(e) =>
            setOauth2Form({ ...oauth2Form, clientSecret: e.target.value })
          }
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition-colors">
          {isLoading ? "Authenticating..." : "Authenticate"}
        </button>
        <button
          type="button"
          onClick={() =>
            setOauth2Form({
              clientId: "demo-client",
              clientSecret: "demo-secret",
            })
          }
          className="py-2 px-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md transition-colors"
          title="Clear form">
          Clear
        </button>
      </div>
    </form>
  );

  const renderLoginForm = () => (
    <form onSubmit={handleLoginSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">User Login</h3>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Username or Email
        </label>
        <input
          type="text"
          value={loginForm.username}
          onChange={(e) =>
            setLoginForm({ ...loginForm, username: e.target.value })
          }
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Password
        </label>
        <input
          type="password"
          value={loginForm.password}
          onChange={(e) =>
            setLoginForm({ ...loginForm, password: e.target.value })
          }
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-md transition-colors">
          {isLoading ? "Logging in..." : "Login"}
        </button>
        <button
          type="button"
          onClick={() => setLoginForm({ username: "", password: "" })}
          className="py-2 px-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md transition-colors"
          title="Clear form">
          Clear
        </button>
      </div>

      <p className="text-center text-gray-400 text-sm">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={() => setAuthMode("register")}
          className="text-green-400 hover:text-green-300 underline">
          Sign up
        </button>
      </p>
    </form>
  );

  const renderRegisterForm = () => (
    <form onSubmit={handleRegisterSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Create Account</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            First Name
          </label>
          <input
            type="text"
            value={registerForm.firstName}
            onChange={(e) =>
              setRegisterForm({ ...registerForm, firstName: e.target.value })
            }
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Last Name
          </label>
          <input
            type="text"
            value={registerForm.lastName}
            onChange={(e) =>
              setRegisterForm({ ...registerForm, lastName: e.target.value })
            }
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Username
        </label>
        <input
          type="text"
          value={registerForm.username}
          onChange={(e) =>
            setRegisterForm({ ...registerForm, username: e.target.value })
          }
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Email
        </label>
        <input
          type="email"
          value={registerForm.email}
          onChange={(e) =>
            setRegisterForm({ ...registerForm, email: e.target.value })
          }
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Password
        </label>
        <input
          type="password"
          value={registerForm.password}
          onChange={(e) =>
            setRegisterForm({ ...registerForm, password: e.target.value })
          }
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Confirm Password
        </label>
        <input
          type="password"
          value={registerForm.confirmPassword}
          onChange={(e) =>
            setRegisterForm({
              ...registerForm,
              confirmPassword: e.target.value,
            })
          }
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 py-2 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium rounded-md transition-colors">
          {isLoading ? "Creating Account..." : "Create Account"}
        </button>
        <button
          type="button"
          onClick={() =>
            setRegisterForm({
              firstName: "",
              lastName: "",
              username: "",
              email: "",
              password: "",
              confirmPassword: "",
            })
          }
          className="py-2 px-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md transition-colors"
          title="Clear form">
          Clear
        </button>
      </div>

      <p className="text-center text-gray-400 text-sm">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => setAuthMode("login")}
          className="text-purple-400 hover:text-purple-300 underline">
          Sign in
        </button>
      </p>
    </form>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Authentication</h2>
            <button
              onClick={() => setAuthModalOpen(false)}
              className="text-gray-400 hover:text-white transition-colors">
              ×
            </button>
          </div>

          {/* Auth Mode Tabs */}
          <div className="flex mb-6 border-b border-gray-700">
            <button
              onClick={() => setAuthMode("oauth2")}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                authMode === "oauth2"
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-gray-400 hover:text-white"
              }`}>
              OAuth2
            </button>
            <button
              onClick={() => setAuthMode("login")}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                authMode === "login"
                  ? "text-green-400 border-b-2 border-green-400"
                  : "text-gray-400 hover:text-white"
              }`}>
              Login
            </button>
            <button
              onClick={() => setAuthMode("register")}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                authMode === "register"
                  ? "text-purple-400 border-b-2 border-purple-400"
                  : "text-gray-400 hover:text-white"
              }`}>
              Sign Up
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-900 border border-red-600 rounded-md">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Forms */}
          {authMode === "oauth2" && renderOAuth2Form()}
          {authMode === "login" && renderLoginForm()}
          {authMode === "register" && renderRegisterForm()}

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gray-800 rounded-md">
            <h4 className="text-sm font-medium text-gray-300 mb-2">
              Demo Credentials
            </h4>
            <div className="text-xs text-gray-400 space-y-1">
              <div>
                <strong>OAuth2:</strong> demo-client / demo-secret
              </div>
              <div>
                <strong>User:</strong> demo / password
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
