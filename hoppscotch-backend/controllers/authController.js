const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

class AuthController {
  constructor(db) {
    this.db = db;
  }

  // Basic Authentication - Login
  async basicLogin(req, res) {
    try {
      const { username, password } = req.body;

      // Validate required fields
      if (!username || !password) {
        return res.status(400).json({
          error: "invalid_request",
          message: "Username and password are required",
        });
      }

      // Find user by username or email
      const [users] = await this.db.execute(
        "SELECT * FROM users WHERE (username = ? OR email = ?) AND is_active = TRUE",
        [username, username]
      );

      if (users.length === 0) {
        return res.status(401).json({
          error: "invalid_credentials",
          message: "Invalid username or password",
        });
      }

      const user = users[0];

      // Verify password
      const isValidPassword = await bcrypt.compare(
        password,
        user.password_hash
      );
      if (!isValidPassword) {
        return res.status(401).json({
          error: "invalid_credentials",
          message: "Invalid username or password",
        });
      }

      // Generate session token
      const tokenPayload = {
        user_id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        type: "user_session",
      };

      const sessionToken = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRY || "24h",
        issuer: "hoppscotch-api",
      });

      // Calculate token expiry
      const expiresIn = 24 * 60 * 60; // 24 hours in seconds
      const expiresAt = new Date(Date.now() + expiresIn * 1000);

      // Store session in database
      const tokenHash = crypto
        .createHash("sha256")
        .update(sessionToken)
        .digest("hex");
      const deviceInfo = req.headers["user-agent"] || "Unknown Device";
      const ipAddress = req.ip || req.connection.remoteAddress || "Unknown IP";

      await this.db.execute(
        `INSERT INTO user_sessions (user_id, token_hash, device_info, ip_address, expires_at) 
         VALUES (?, ?, ?, ?, ?)`,
        [user.id, tokenHash, deviceInfo, ipAddress, expiresAt]
      );

      // Update last login
      await this.db.execute(
        "UPDATE users SET last_login = NOW(), login_count = login_count + 1 WHERE id = ?",
        [user.id]
      );

      // Return user session response
      res.json({
        access_token: sessionToken,
        token_type: "Bearer",
        expires_in: expiresIn,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          avatar_url: user.avatar_url,
        },
      });

      console.log(`✅ User login successful: ${user.username} (${user.email})`);
    } catch (error) {
      console.error("❌ Basic login error:", error);
      res.status(500).json({
        error: "server_error",
        message: "Internal server error",
      });
    }
  }

  // Basic Authentication - Register
  async basicRegister(req, res) {
    try {
      const { username, email, password, first_name, last_name } = req.body;

      // Validate required fields
      if (!username || !email || !password) {
        return res.status(400).json({
          error: "invalid_request",
          message: "Username, email, and password are required",
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          error: "invalid_email",
          message: "Please provide a valid email address",
        });
      }

      // Validate password strength
      if (password.length < 6) {
        return res.status(400).json({
          error: "weak_password",
          message: "Password must be at least 6 characters long",
        });
      }

      // Check if username or email already exists
      const [existingUsers] = await this.db.execute(
        "SELECT username, email FROM users WHERE username = ? OR email = ?",
        [username, email]
      );

      if (existingUsers.length > 0) {
        const existing = existingUsers[0];
        if (existing.username === username) {
          return res.status(409).json({
            error: "username_taken",
            message: "Username is already taken",
          });
        }
        if (existing.email === email) {
          return res.status(409).json({
            error: "email_taken",
            message: "Email is already registered",
          });
        }
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Generate email verification token
      const emailVerificationToken = crypto.randomBytes(32).toString("hex");

      // Insert new user
      const [result] = await this.db.execute(
        `INSERT INTO users (username, email, password_hash, first_name, last_name, email_verification_token) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          username,
          email,
          passwordHash,
          first_name || null,
          last_name || null,
          emailVerificationToken,
        ]
      );

      const userId = result.insertId;

      // For demo purposes, auto-verify the email
      await this.db.execute(
        "UPDATE users SET email_verified = TRUE, email_verification_token = NULL WHERE id = ?",
        [userId]
      );

      // Generate session token for immediate login
      const tokenPayload = {
        user_id: userId,
        username,
        email,
        role: "user",
        type: "user_session",
      };

      const sessionToken = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRY || "24h",
        issuer: "hoppscotch-api",
      });

      // Calculate token expiry
      const expiresIn = 24 * 60 * 60; // 24 hours in seconds
      const expiresAt = new Date(Date.now() + expiresIn * 1000);

      // Store session in database
      const tokenHash = crypto
        .createHash("sha256")
        .update(sessionToken)
        .digest("hex");
      const deviceInfo = req.headers["user-agent"] || "Unknown Device";
      const ipAddress = req.ip || req.connection.remoteAddress || "Unknown IP";

      await this.db.execute(
        `INSERT INTO user_sessions (user_id, token_hash, device_info, ip_address, expires_at) 
         VALUES (?, ?, ?, ?, ?)`,
        [userId, tokenHash, deviceInfo, ipAddress, expiresAt]
      );

      // Return registration success with immediate login
      res.status(201).json({
        message: "Registration successful",
        access_token: sessionToken,
        token_type: "Bearer",
        expires_in: expiresIn,
        user: {
          id: userId,
          username,
          email,
          first_name: first_name || null,
          last_name: last_name || null,
          role: "user",
          avatar_url: null,
        },
      });

      console.log(`✅ User registration successful: ${username} (${email})`);
    } catch (error) {
      console.error("❌ Registration error:", error);
      res.status(500).json({
        error: "server_error",
        message: "Internal server error",
      });
    }
  }

  // OAuth2 Client Credentials Grant
  async clientCredentials(req, res) {
    try {
      const { client_id, client_secret, grant_type } = req.body;

      // Validate grant type
      if (grant_type !== "client_credentials") {
        return res.status(400).json({
          error: "unsupported_grant_type",
          error_description: "Grant type must be client_credentials",
        });
      }

      // Validate required fields
      if (!client_id || !client_secret) {
        return res.status(400).json({
          error: "invalid_request",
          error_description: "client_id and client_secret are required",
        });
      }

      // Find client in database
      const [clients] = await this.db.execute(
        "SELECT * FROM oauth_clients WHERE client_id = ? AND is_active = TRUE",
        [client_id]
      );

      if (clients.length === 0) {
        return res.status(401).json({
          error: "invalid_client",
          error_description: "Invalid client credentials",
        });
      }

      const client = clients[0];

      // Verify client secret
      const isValidSecret = await bcrypt.compare(
        client_secret,
        client.client_secret_hash
      );
      if (!isValidSecret) {
        return res.status(401).json({
          error: "invalid_client",
          error_description: "Invalid client credentials",
        });
      }

      // Check if client has expired
      if (client.expires_at && new Date() > new Date(client.expires_at)) {
        return res.status(401).json({
          error: "invalid_client",
          error_description: "Client credentials have expired",
        });
      }

      // Generate access token
      const tokenPayload = {
        client_id: client.client_id,
        client_name: client.client_name,
        scopes: JSON.parse(client.scopes || '["api:read"]'),
        type: "client_credentials",
      };

      const accessToken = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRY || "24h",
        issuer: "hoppscotch-api",
      });

      // Calculate token expiry
      const expiresIn = 24 * 60 * 60; // 24 hours in seconds
      const expiresAt = new Date(Date.now() + expiresIn * 1000);

      // Store token in database for tracking
      const tokenHash = crypto
        .createHash("sha256")
        .update(accessToken)
        .digest("hex");
      await this.db.execute(
        `INSERT INTO access_tokens (token_hash, client_id, scopes, expires_at) 
         VALUES (?, ?, ?, ?)`,
        [tokenHash, client_id, client.scopes, expiresAt]
      );

      // Return OAuth2 standard response
      res.json({
        access_token: accessToken,
        token_type: "Bearer",
        expires_in: expiresIn,
        scope: JSON.parse(client.scopes || '["api:read"]').join(" "),
        client_info: {
          client_id: client.client_id,
          client_name: client.client_name,
        },
      });

      console.log(`✅ OAuth2 token issued for client: ${client_id}`);
    } catch (error) {
      console.error("❌ OAuth2 token error:", error);
      res.status(500).json({
        error: "server_error",
        error_description: "Internal server error",
      });
    }
  }

  // Validate access token
  async validateToken(req, res) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          error: "invalid_token",
          error_description: "Bearer token required",
        });
      }

      const token = authHeader.substring(7);

      // Verify JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if token exists in database and is not revoked
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
      const [tokens] = await this.db.execute(
        "SELECT * FROM access_tokens WHERE token_hash = ? AND is_revoked = FALSE AND expires_at > NOW()",
        [tokenHash]
      );

      if (tokens.length === 0) {
        return res.status(401).json({
          error: "invalid_token",
          error_description: "Token not found or expired",
        });
      }

      // Return token info
      res.json({
        valid: true,
        client_id: decoded.client_id,
        client_name: decoded.client_name,
        scopes: decoded.scopes,
        expires_at: tokens[0].expires_at,
      });
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          error: "invalid_token",
          error_description: "Invalid token format",
        });
      }

      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          error: "invalid_token",
          error_description: "Token has expired",
        });
      }

      console.error("❌ Token validation error:", error);
      res.status(500).json({
        error: "server_error",
        error_description: "Internal server error",
      });
    }
  }

  // Revoke access token
  async revokeToken(req, res) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          error: "invalid_request",
          error_description: "Token is required",
        });
      }

      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

      // Mark token as revoked
      await this.db.execute(
        "UPDATE access_tokens SET is_revoked = TRUE WHERE token_hash = ?",
        [tokenHash]
      );

      res.json({
        success: true,
        message: "Token revoked successfully",
      });
    } catch (error) {
      console.error("❌ Token revocation error:", error);
      res.status(500).json({
        error: "server_error",
        error_description: "Internal server error",
      });
    }
  }

  // Get client info (for debugging/admin)
  async getClientInfo(req, res) {
    try {
      const { client_id } = req.params;

      const [clients] = await this.db.execute(
        "SELECT client_id, client_name, scopes, created_at, is_active, expires_at FROM oauth_clients WHERE client_id = ?",
        [client_id]
      );

      if (clients.length === 0) {
        return res.status(404).json({
          error: "client_not_found",
          error_description: "Client not found",
        });
      }

      const client = clients[0];
      client.scopes = JSON.parse(client.scopes || "[]");

      res.json(client);
    } catch (error) {
      console.error("❌ Get client info error:", error);
      res.status(500).json({
        error: "server_error",
        error_description: "Internal server error",
      });
    }
  }

  // Validate token (works for both OAuth2 and user session tokens)
  async validateToken(req, res) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          error: "invalid_token",
          message: "Missing or invalid Authorization header",
        });
      }

      const token = authHeader.substring(7);

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.type === "client_credentials") {
        // OAuth2 token validation
        const tokenHash = crypto
          .createHash("sha256")
          .update(token)
          .digest("hex");

        const [accessTokens] = await this.db.execute(
          "SELECT at.*, oc.client_name, oc.scopes FROM access_tokens at JOIN oauth_clients oc ON at.client_id = oc.client_id WHERE at.token_hash = ? AND at.expires_at > NOW() AND at.is_revoked = 0",
          [tokenHash]
        );

        if (accessTokens.length === 0) {
          return res.status(401).json({
            error: "invalid_token",
            message: "Token not found or expired",
          });
        }

        const tokenData = accessTokens[0];
        res.json({
          valid: true,
          token_type: "client_credentials",
          client_id: tokenData.client_id,
          client_name: tokenData.client_name,
          scopes: JSON.parse(tokenData.scopes || "[]"),
          expires_at: tokenData.expires_at,
        });
      } else if (decoded.type === "user_session") {
        // User session token validation
        const tokenHash = crypto
          .createHash("sha256")
          .update(token)
          .digest("hex");

        const [sessions] = await this.db.execute(
          `SELECT us.*, u.username, u.email, u.first_name, u.last_name, u.role, u.avatar_url 
           FROM user_sessions us 
           JOIN users u ON us.user_id = u.id 
           WHERE us.token_hash = ? AND us.expires_at > NOW() AND us.is_revoked = 0`,
          [tokenHash]
        );

        if (sessions.length === 0) {
          return res.status(401).json({
            error: "invalid_token",
            message: "Session not found or expired",
          });
        }

        const session = sessions[0];
        res.json({
          valid: true,
          token_type: "user_session",
          user: {
            id: session.user_id,
            username: session.username,
            email: session.email,
            first_name: session.first_name,
            last_name: session.last_name,
            role: session.role,
            avatar_url: session.avatar_url,
          },
          session: {
            id: session.id,
            device_info: session.device_info,
            ip_address: session.ip_address,
            last_accessed: session.last_accessed,
            expires_at: session.expires_at,
          },
        });
      } else {
        return res.status(401).json({
          error: "invalid_token",
          message: "Unknown token type",
        });
      }
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          error: "invalid_token",
          message: "Invalid token format",
        });
      }
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          error: "token_expired",
          message: "Token has expired",
        });
      }

      console.error("❌ Token validation error:", error);
      res.status(500).json({
        error: "server_error",
        message: "Internal server error",
      });
    }
  }
}

module.exports = AuthController;
