const express = require("express");
const cors = require("cors");
const pool = require("./config/database");
require("dotenv").config();

const app = express();

// Detect if running in Electron
const isElectron = process.versions && process.versions.electron;

// Port configuration - use different ports for Electron vs standalone
const PORT = process.env.PORT || (isElectron ? 5001 : 5000);

console.log(`🔧 Running in ${isElectron ? "Electron" : "standalone"} mode`);
console.log(`📡 Server will start on port ${PORT}`);

// Log database configuration for debugging
console.log("🗄️ Database configuration:", {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  database: process.env.DB_NAME || "hoppscotch_db",
  port: process.env.DB_PORT || 3306,
  passwordProvided: !!process.env.DB_PASSWORD,
});

// Test DB connection
pool
  .getConnection()
  .then((connection) => {
    console.log("✅ Database connected successfully");
    connection.release();
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err.message);
    console.error("❌ Error details:", {
      code: err.code,
      errno: err.errno,
      sqlState: err.sqlState,
      sqlMessage: err.sqlMessage,
    });

    // In Electron mode, continue without DB for now
    if (!isElectron) {
      process.exit(1);
    }
  });

// CORS setup - more permissive for Electron
const corsOptions = isElectron
  ? {
      origin: true, // Allow all origins in Electron
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }
  : {
      origin: [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
      ],
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    };

app.use(cors(corsOptions));

app.options("*", cors());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// Routes
const historyRoutes = require("./routes/history");
app.use("/api/history", historyRoutes);

// Proxy route for CORS-blocked requests
app.all("/api/proxy", async (req, res) => {
  try {
    const {
      url,
      method = "GET",
      headers = {},
      data,
    } = req.method === "GET" ? req.query : req.body;

    if (!url) {
      return res.status(400).json({ error: "URL parameter is required" });
    }

    console.log(`Proxying ${method} request to: ${url}`);

    const axios = require("axios");

    const config = {
      method: method.toLowerCase(),
      url: url,
      headers: {
        ...headers,
        // Remove browser-specific headers that might cause issues
        "User-Agent": "Hoppscotch-Proxy/1.0",
      },
      timeout: 30000,
      validateStatus: () => true, // Accept all status codes
    };

    if (data && ["post", "put", "patch"].includes(method.toLowerCase())) {
      config.data = data;
    }

    const response = await axios(config);

    // Set CORS headers for the response
    res.set({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    });

    res.status(response.status).json({
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers,
    });
  } catch (error) {
    console.error("Proxy request failed:", error.message);
    res.status(500).json({
      error: "Proxy request failed",
      message: error.message,
      status: 0,
      statusText: "Network Error",
    });
  }
});

// 404 handler
app.use((req, res) => {
  console.log(`404: ${req.method} ${req.url}`);
  res.status(404).json({ error: "Not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Function to find an available port
function findAvailablePort(port) {
  return new Promise((resolve) => {
    const net = require("net");
    const server = net.createServer();

    server.listen(port, () => {
      const actualPort = server.address().port;
      server.close(() => {
        resolve(actualPort);
      });
    });

    server.on("error", () => {
      resolve(findAvailablePort(port + 1));
    });
  });
}

// Start server with port detection
(async () => {
  const availablePort = await findAvailablePort(PORT);

  // Bind to all interfaces (0.0.0.0) to allow external access
  const host = "0.0.0.0";

  app.listen(availablePort, host, () => {
    console.log(`🚀 Server running on port ${availablePort}`);
    console.log(`📡 Health check: http://localhost:${availablePort}/health`);
    console.log(`🌐 External access: http://0.0.0.0:${availablePort}/health`);

    if (isElectron) {
      console.log(`⚡ Running in Electron mode`);
      // Signal to Electron main process that server is ready
      if (process.send) {
        process.send({ type: "server-ready", port: availablePort });
      }
    } else {
      console.log(`🌍 Standalone server accessible at:`);
      console.log(`   - http://localhost:${availablePort}`);
      console.log(`   - http://127.0.0.1:${availablePort}`);
    }
  });
})();
