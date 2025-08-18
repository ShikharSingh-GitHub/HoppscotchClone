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

// ============================================
// DUMMY APIS FOR TESTING AND DEMO PURPOSES
// ============================================

// In-memory storage for demo data
let demoUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    age: 30,
    role: "admin",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    age: 25,
    role: "user",
  },
  {
    id: 3,
    name: "Bob Johnson",
    email: "bob@example.com",
    age: 35,
    role: "user",
  },
];

let demoProducts = [
  { id: 1, name: "Laptop", price: 999.99, category: "Electronics", stock: 50 },
  { id: 2, name: "Coffee Mug", price: 15.99, category: "Home", stock: 100 },
  { id: 3, name: "Book", price: 29.99, category: "Education", stock: 25 },
];

let demoOrders = [
  {
    id: 1,
    userId: 1,
    productId: 1,
    quantity: 1,
    status: "completed",
    total: 999.99,
  },
  {
    id: 2,
    userId: 2,
    productId: 2,
    quantity: 2,
    status: "pending",
    total: 31.98,
  },
];

// Helper function to find next ID
const getNextId = (array) => Math.max(...array.map((item) => item.id), 0) + 1;

// ============================================
// USER MANAGEMENT APIS
// ============================================

// GET /api/demo/users - Get all users
app.get("/api/demo/users", (req, res) => {
  const { page = 1, limit = 10, role } = req.query;
  let filteredUsers = demoUsers;

  if (role) {
    filteredUsers = demoUsers.filter((user) => user.role === role);
  }

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  res.json({
    success: true,
    data: paginatedUsers,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: filteredUsers.length,
      totalPages: Math.ceil(filteredUsers.length / limit),
    },
  });
});

// GET /api/demo/users/:id - Get user by ID
app.get("/api/demo/users/:id", (req, res) => {
  const userId = parseInt(req.params.id);
  const user = demoUsers.find((u) => u.id === userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: "User not found",
    });
  }

  res.json({
    success: true,
    data: user,
  });
});

// POST /api/demo/users - Create new user
app.post("/api/demo/users", (req, res) => {
  const { name, email, age, role = "user" } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      success: false,
      error: "Name and email are required",
    });
  }

  const newUser = {
    id: getNextId(demoUsers),
    name,
    email,
    age: age || null,
    role,
    createdAt: new Date().toISOString(),
  };

  demoUsers.push(newUser);

  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: newUser,
  });
});

// PUT /api/demo/users/:id - Update entire user
app.put("/api/demo/users/:id", (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = demoUsers.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      error: "User not found",
    });
  }

  const { name, email, age, role } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      success: false,
      error: "Name and email are required",
    });
  }

  demoUsers[userIndex] = {
    ...demoUsers[userIndex],
    name,
    email,
    age: age || null,
    role: role || "user",
    updatedAt: new Date().toISOString(),
  };

  res.json({
    success: true,
    message: "User updated successfully",
    data: demoUsers[userIndex],
  });
});

// PATCH /api/demo/users/:id - Partially update user
app.patch("/api/demo/users/:id", (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = demoUsers.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      error: "User not found",
    });
  }

  const allowedFields = ["name", "email", "age", "role"];
  const updates = {};

  Object.keys(req.body).forEach((key) => {
    if (allowedFields.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  demoUsers[userIndex] = {
    ...demoUsers[userIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  res.json({
    success: true,
    message: "User updated successfully",
    data: demoUsers[userIndex],
  });
});

// DELETE /api/demo/users/:id - Delete user
app.delete("/api/demo/users/:id", (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = demoUsers.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      error: "User not found",
    });
  }

  const deletedUser = demoUsers.splice(userIndex, 1)[0];

  res.json({
    success: true,
    message: "User deleted successfully",
    data: deletedUser,
  });
});

// ============================================
// PRODUCT MANAGEMENT APIS
// ============================================

// GET /api/demo/products - Get all products
app.get("/api/demo/products", (req, res) => {
  const { category, minPrice, maxPrice } = req.query;
  let filteredProducts = demoProducts;

  if (category) {
    filteredProducts = filteredProducts.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (minPrice) {
    filteredProducts = filteredProducts.filter(
      (p) => p.price >= parseFloat(minPrice)
    );
  }

  if (maxPrice) {
    filteredProducts = filteredProducts.filter(
      (p) => p.price <= parseFloat(maxPrice)
    );
  }

  res.json({
    success: true,
    data: filteredProducts,
    meta: {
      total: filteredProducts.length,
      filters: { category, minPrice, maxPrice },
    },
  });
});

// POST /api/demo/products - Create new product
app.post("/api/demo/products", (req, res) => {
  const { name, price, category, stock = 0 } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({
      success: false,
      error: "Name, price, and category are required",
    });
  }

  const newProduct = {
    id: getNextId(demoProducts),
    name,
    price: parseFloat(price),
    category,
    stock: parseInt(stock),
    createdAt: new Date().toISOString(),
  };

  demoProducts.push(newProduct);

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: newProduct,
  });
});

// ============================================
// ORDER MANAGEMENT APIS
// ============================================

// GET /api/demo/orders - Get all orders
app.get("/api/demo/orders", (req, res) => {
  const { status, userId } = req.query;
  let filteredOrders = demoOrders;

  if (status) {
    filteredOrders = filteredOrders.filter((o) => o.status === status);
  }

  if (userId) {
    filteredOrders = filteredOrders.filter(
      (o) => o.userId === parseInt(userId)
    );
  }

  res.json({
    success: true,
    data: filteredOrders,
    meta: {
      total: filteredOrders.length,
      filters: { status, userId },
    },
  });
});

// POST /api/demo/orders - Create new order
app.post("/api/demo/orders", (req, res) => {
  const { userId, productId, quantity = 1 } = req.body;

  if (!userId || !productId) {
    return res.status(400).json({
      success: false,
      error: "UserId and productId are required",
    });
  }

  const user = demoUsers.find((u) => u.id === parseInt(userId));
  const product = demoProducts.find((p) => p.id === parseInt(productId));

  if (!user) {
    return res.status(404).json({
      success: false,
      error: "User not found",
    });
  }

  if (!product) {
    return res.status(404).json({
      success: false,
      error: "Product not found",
    });
  }

  const newOrder = {
    id: getNextId(demoOrders),
    userId: parseInt(userId),
    productId: parseInt(productId),
    quantity: parseInt(quantity),
    status: "pending",
    total: product.price * parseInt(quantity),
    createdAt: new Date().toISOString(),
  };

  demoOrders.push(newOrder);

  res.status(201).json({
    success: true,
    message: "Order created successfully",
    data: newOrder,
  });
});

// ============================================
// UTILITY & TEST APIS
// ============================================

// GET /api/demo/status - API status with various response codes
app.get("/api/demo/status/:code?", (req, res) => {
  const code = parseInt(req.params.code) || 200;

  const statusMessages = {
    200: "OK - Request successful",
    201: "Created - Resource created successfully",
    400: "Bad Request - Invalid request",
    401: "Unauthorized - Authentication required",
    403: "Forbidden - Access denied",
    404: "Not Found - Resource not found",
    500: "Internal Server Error - Server error occurred",
  };

  res.status(code).json({
    status: code,
    message: statusMessages[code] || "Unknown status code",
    timestamp: new Date().toISOString(),
    path: req.path,
  });
});

// POST /api/demo/echo - Echo back request data
app.post("/api/demo/echo", (req, res) => {
  res.json({
    success: true,
    echo: {
      method: req.method,
      headers: req.headers,
      body: req.body,
      query: req.query,
      timestamp: new Date().toISOString(),
    },
  });
});

// GET /api/demo/random - Random data generator
app.get("/api/demo/random/:type?", (req, res) => {
  const type = req.params.type || "number";

  const generators = {
    number: () => Math.floor(Math.random() * 1000),
    string: () => Math.random().toString(36).substring(2, 15),
    boolean: () => Math.random() > 0.5,
    uuid: () =>
      "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }),
    email: () => {
      const domains = ["example.com", "test.org", "demo.net"];
      const names = ["john", "jane", "bob", "alice", "charlie"];
      return `${names[Math.floor(Math.random() * names.length)]}${Math.floor(
        Math.random() * 100
      )}@${domains[Math.floor(Math.random() * domains.length)]}`;
    },
  };

  const value = generators[type] ? generators[type]() : generators.number();

  res.json({
    success: true,
    type,
    value,
    timestamp: new Date().toISOString(),
  });
});

// GET /api/demo/delay/:seconds - Delayed response for testing
app.get("/api/demo/delay/:seconds", (req, res) => {
  const seconds = Math.min(parseInt(req.params.seconds) || 1, 10); // Max 10 seconds

  setTimeout(() => {
    res.json({
      success: true,
      message: `Response delayed by ${seconds} seconds`,
      delayed: seconds,
      timestamp: new Date().toISOString(),
    });
  }, seconds * 1000);
});

// ============================================
// END OF DUMMY APIS
// ============================================

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
