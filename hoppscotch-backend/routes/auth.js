const express = require("express");
const rateLimit = require("express-rate-limit");
const AuthController = require("../controllers/authController");

const createAuthRoutes = (db) => {
  const router = express.Router();
  const authController = new AuthController(db);

  // Rate limiting for auth endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per windowMs
    message: {
      error: "too_many_requests",
      error_description:
        "Too many authentication attempts, please try again later",
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // OAuth2 Client Credentials Grant
  router.post("/oauth2/token", authLimiter, (req, res) => {
    authController.clientCredentials(req, res);
  });

  // Basic Authentication - Login
  router.post("/login", authLimiter, (req, res) => {
    authController.basicLogin(req, res);
  });

  // Basic Authentication - Register
  router.post("/register", authLimiter, (req, res) => {
    authController.basicRegister(req, res);
  });

  // Token validation endpoint (works for both OAuth2 and Basic Auth)
  router.post("/validate", (req, res) => {
    authController.validateToken(req, res);
  });

  // Token revocation endpoint
  router.post("/revoke", (req, res) => {
    authController.revokeToken(req, res);
  });

  // Get client information (for debugging)
  router.get("/client/:client_id", (req, res) => {
    authController.getClientInfo(req, res);
  });

  // Health check for auth system
  router.get("/health", (req, res) => {
    res.json({
      status: "healthy",
      oauth2_enabled: process.env.OAUTH2_ENABLED === "true",
      auth_required: process.env.REQUIRE_AUTH === "true",
      timestamp: new Date().toISOString(),
    });
  });

  return router;
};

module.exports = createAuthRoutes;
