import { useEffect } from "react";
import useAuthStore from "../../store/authStore";

const AuthGuard = ({ children, fallback, requireAuth = true }) => {
  const {
    isValidAuth,
    setAuthModalOpen,
    checkTokenExpiry,
    isAuthenticated,
    token,
  } = useAuthStore();

  // Check token expiry on mount and periodically
  useEffect(() => {
    if (!requireAuth) return;

    // Initial check
    checkTokenExpiry();

    // Set up periodic check (every minute)
    const interval = setInterval(() => {
      checkTokenExpiry();
    }, 60000);

    return () => clearInterval(interval);
  }, [checkTokenExpiry, requireAuth]);

  // If auth is not required, render children
  if (!requireAuth) {
    return children;
  }

  // If authenticated and token is valid, render children
  if (isValidAuth()) {
    return children;
  }

  // If fallback provided, render it
  if (fallback) {
    return fallback;
  }

  // Default: render children but they should handle auth prompts
  return children;
};

// Higher-order component for protecting specific actions
export const withAuthGuard = (Component, options = {}) => {
  const WrappedComponent = (props) => {
    const { isValidAuth, setAuthModalOpen } = useAuthStore();
    const { requireAuth = true, onAuthRequired } = options;

    const handleAuthRequired = () => {
      if (onAuthRequired) {
        onAuthRequired();
      } else {
        setAuthModalOpen(true);
      }
    };

    const enhancedProps = {
      ...props,
      isAuthenticated: isValidAuth(),
      requireAuth: () => handleAuthRequired(),
    };

    return <Component {...enhancedProps} />;
  };

  WrappedComponent.displayName = `withAuthGuard(${
    Component.displayName || Component.name
  })`;
  return WrappedComponent;
};

// Hook for checking authentication in components
export const useAuthGuard = () => {
  const { isValidAuth, setAuthModalOpen, isAuthenticated, token } =
    useAuthStore();

  const requireAuth = (callback) => {
    if (isValidAuth()) {
      if (callback) callback();
      return true;
    } else {
      setAuthModalOpen(true);
      return false;
    }
  };

  return {
    isAuthenticated: isValidAuth(),
    requireAuth,
    openAuthModal: () => setAuthModalOpen(true),
  };
};

export default AuthGuard;
