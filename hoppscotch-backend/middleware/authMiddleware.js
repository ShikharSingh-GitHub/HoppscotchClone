const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Authentication middleware for protected routes (supports both OAuth2 and Basic Auth)
const authMiddleware = (db) => {
  return async (req, res, next) => {
    try {
      // Skip auth if disabled in environment
      if (process.env.REQUIRE_AUTH !== "true") {
        return next();
      }

      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          error: "unauthorized",
          message:
            "Authentication required. Please provide a valid Bearer token.",
          auth_required: true,
        });
      }

      const token = authHeader.substring(7);

      // Verify JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      let authInfo = null;
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

      // Check token type and validate accordingly
      if (decoded.type === "client_credentials") {
        // OAuth2 Client Credentials flow
        const [tokens] = await db.execute(
          "SELECT * FROM access_tokens WHERE token_hash = ? AND is_revoked = FALSE AND expires_at > NOW()",
          [tokenHash]
        );

        if (tokens.length === 0) {
          return res.status(401).json({
            error: "invalid_token",
            message: "Token not found, expired, or revoked",
            auth_required: true,
          });
        }

        authInfo = {
          type: "oauth2",
          client_id: decoded.client_id,
          client_name: decoded.client_name,
          scopes: decoded.scopes,
          token_expires_at: tokens[0].expires_at,
        };
      } else if (decoded.type === "user_session") {
        // Basic Auth User Session
        const [sessions] = await db.execute(
          "SELECT s.*, u.username, u.email, u.role, u.is_active FROM user_sessions s JOIN users u ON s.user_id = u.id WHERE s.token_hash = ? AND s.is_revoked = FALSE AND s.expires_at > NOW() AND u.is_active = TRUE",
          [tokenHash]
        );

        if (sessions.length === 0) {
          return res.status(401).json({
            error: "invalid_token",
            message: "Session not found, expired, or revoked",
            auth_required: true,
          });
        }

        const session = sessions[0];

        // Update last accessed time
        await db.execute(
          "UPDATE user_sessions SET last_accessed = NOW() WHERE id = ?",
          [session.id]
        );

        authInfo = {
          type: "user_session",
          user_id: decoded.user_id,
          username: session.username,
          email: session.email,
          role: session.role,
          session_id: session.id,
          token_expires_at: session.expires_at,
        };
      } else {
        return res.status(401).json({
          error: "invalid_token",
          message: "Unknown token type",
          auth_required: true,
        });
      }

      // Add auth info to request object
      req.auth = authInfo;
      next();
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          error: "invalid_token",
          message: "Invalid token format",
          auth_required: true,
        });
      }

      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          error: "token_expired",
          message: "Token has expired",
          auth_required: true,
        });
      }

      console.error("❌ Auth middleware error:", error);
      res.status(500).json({
        error: "server_error",
        message: "Internal server error",
      });
    }
  };
};

// Optional middleware - doesn't block request if no auth
const optionalAuthMiddleware = (db) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        req.auth = null;
        return next();
      }

      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

      if (decoded.type === "client_credentials") {
        const [tokens] = await db.execute(
          "SELECT * FROM access_tokens WHERE token_hash = ? AND is_revoked = FALSE AND expires_at > NOW()",
          [tokenHash]
        );

        if (tokens.length > 0) {
          req.auth = {
            type: "oauth2",
            client_id: decoded.client_id,
            client_name: decoded.client_name,
            scopes: decoded.scopes,
            token_expires_at: tokens[0].expires_at,
          };
        }
      } else if (decoded.type === "user_session") {
        const [sessions] = await db.execute(
          "SELECT s.*, u.username, u.email, u.role, u.is_active FROM user_sessions s JOIN users u ON s.user_id = u.id WHERE s.token_hash = ? AND s.is_revoked = FALSE AND s.expires_at > NOW() AND u.is_active = TRUE",
          [tokenHash]
        );

        if (sessions.length > 0) {
          const session = sessions[0];
          req.auth = {
            type: "user_session",
            user_id: decoded.user_id,
            username: session.username,
            email: session.email,
            role: session.role,
            session_id: session.id,
            token_expires_at: session.expires_at,
          };
        }
      }

      if (!req.auth) {
        req.auth = null;
      }

      next();
    } catch (error) {
      // For optional auth, we don't block on errors
      req.auth = null;
      next();
    }
  };
};

// Scope validation middleware (for OAuth2)
const requireScope = (requiredScope) => {
  return (req, res, next) => {
    if (!req.auth) {
      return res.status(401).json({
        error: "unauthorized",
        message: "Authentication required",
      });
    }

    // For user sessions, allow all scopes (users have full access)
    if (req.auth.type === "user_session") {
      return next();
    }

    // For OAuth2, check specific scopes
    if (
      req.auth.type === "oauth2" &&
      !req.auth.scopes.includes(requiredScope)
    ) {
      return res.status(403).json({
        error: "insufficient_scope",
        message: `Required scope: ${requiredScope}`,
        required_scope: requiredScope,
        granted_scopes: req.auth.scopes,
      });
    }

    next();
  };
};

// Role-based access control (for user sessions)
const requireRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.auth) {
      return res.status(401).json({
        error: "unauthorized",
        message: "Authentication required",
      });
    }

    if (req.auth.type !== "user_session") {
      return res.status(403).json({
        error: "access_denied",
        message: "User authentication required for this action",
      });
    }

    const roleHierarchy = { user: 1, moderator: 2, admin: 3 };
    const userRoleLevel = roleHierarchy[req.auth.role] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole] || 999;

    if (userRoleLevel < requiredRoleLevel) {
      return res.status(403).json({
        error: "insufficient_role",
        message: `Required role: ${requiredRole}`,
        user_role: req.auth.role,
      });
    }

    next();
  };
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
  requireScope,
  requireRole,
};
