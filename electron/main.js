const {
  app,
  BrowserWindow,
  Menu,
  ipcMain,
  dialog,
  shell,
} = require("electron");
const { spawn, exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const { autoUpdater } = require("electron-updater");

// Keep a global reference of the window object
let mainWindow;
let backendProcess;
let frontendProcess;
let splashWindow;
let installerWindow;

const isDevelopment = process.env.NODE_ENV === "development";

// Function to get proper paths for user data
function getInstallationMarkerPath() {
  return path.join(app.getPath("userData"), ".installed");
}

function getConfigPath() {
  return path.join(app.getPath("userData"), "config.json");
}

const isFirstRun = !fs.existsSync(getInstallationMarkerPath());

// Configure auto-updater
if (!isDevelopment) {
  try {
    autoUpdater.checkForUpdatesAndNotify().catch((err) => {
      console.log("Update check failed:", err.message);
    });
  } catch (error) {
    console.log("Auto-updater initialization failed:", error.message);
  }
}

// Test server accessibility
async function testServerAccessibility() {
  const http = require("http");

  console.log("🧪 Testing server accessibility...");

  // Get the actual backend port (might be different from configured port due to conflicts)
  const actualBackendPort = global.installationConfig?.backendPort || 5001;

  // Test backend health endpoint
  const testBackend = () =>
    new Promise((resolve) => {
      const req = http.get(
        `http://localhost:${actualBackendPort}/health`,
        (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            console.log(
              `✅ Backend accessible at http://localhost:${actualBackendPort}`
            );
            console.log("Backend response:", data);
            resolve(true);
          });
        }
      );

      req.on("error", (err) => {
        console.log(
          `❌ Backend not accessible at port ${actualBackendPort}:`,
          err.message
        );
        resolve(false);
      });

      req.setTimeout(3000, () => {
        req.destroy();
        console.log("❌ Backend health check timeout");
        resolve(false);
      });
    });

  const backendStatus = await testBackend();

  if (backendStatus) {
    console.log("🎉 Both frontend and backend are working!");
    console.log("🖥️  Electron App: Frontend loaded in app window");
    console.log("🌐 Browser Access:");
    console.log("   Frontend: http://localhost:5173");
    console.log(`   Backend:  http://localhost:${actualBackendPort}`);
    console.log(
      `📡 API Health Check: http://localhost:${actualBackendPort}/health`
    );
  }

  return backendStatus;
}

// IPC handlers
ipcMain.on("installation-complete", (event, config) => {
  console.log("Installation completed with config:", config);

  // Save configuration for future use
  global.installationConfig = config;

  // Ensure user data directory exists
  const userDataDir = app.getPath("userData");
  if (!fs.existsSync(userDataDir)) {
    fs.mkdirSync(userDataDir, { recursive: true });
  }

  // Mark installation as complete using user data directory
  const installedMarker = getInstallationMarkerPath();
  const configPath = getConfigPath();

  try {
    fs.writeFileSync(installedMarker, "installed");
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log("Installation marker created at:", installedMarker);
    console.log("Configuration saved at:", configPath);
  } catch (error) {
    console.error("Failed to save installation data:", error);
  }

  // Close installer window and start main application
  setTimeout(async () => {
    if (installerWindow) {
      installerWindow.close();
      installerWindow = null;
    }

    console.log(
      "🚀 Starting main application after installation completion..."
    );
    try {
      await startApplication();
      console.log("✅ Main application started successfully");
    } catch (error) {
      console.error("❌ Failed to start main application:", error);
      // Show an error dialog to the user
      const { dialog } = require("electron");
      dialog.showErrorBox(
        "Application Launch Failed",
        `Failed to start the application: ${error.message}\n\nPlease try launching the app manually from the Applications folder.`
      );
    }
  }, 500);
});

ipcMain.on("close-installer", () => {
  if (installerWindow) {
    installerWindow.close();
    installerWindow = null;
  }

  // If installer is closed without completion, exit the app
  if (!global.installationConfig) {
    app.quit();
  }
});

// Port availability testing
ipcMain.on("test-ports", async (event, { frontendPort, backendPort }) => {
  console.log("Testing port availability:", { frontendPort, backendPort });

  try {
    const net = require("net");

    const testPort = (port) => {
      return new Promise((resolve) => {
        const server = net.createServer();

        server.listen(port, () => {
          server.once("close", () => {
            resolve(true); // Port is available
          });
          server.close();
        });

        server.on("error", (err) => {
          resolve(false); // Port is in use
        });
      });
    };

    const frontendAvailable = await testPort(frontendPort);
    const backendAvailable = await testPort(backendPort);

    event.reply("test-ports-response", {
      success: true,
      frontendAvailable,
      backendAvailable,
      frontendPort,
      backendPort,
    });
  } catch (error) {
    console.error("Port testing error:", error);
    event.reply("test-ports-response", {
      success: false,
      error: error.message,
    });
  }
});

// Database connection testing
ipcMain.on("test-database", async (event, dbConfig) => {
  console.log("Testing database connection:", {
    ...dbConfig,
    password: dbConfig.password ? "***" : "(empty)",
  });

  try {
    if (dbConfig.type === "mysql") {
      // Test MySQL connection using a simpler approach with better error handling
      const { spawn } = require("child_process");

      console.log("Testing MySQL connection with:", {
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.username,
        database: dbConfig.database,
        passwordProvided: !!dbConfig.password,
      });

      // Use full path to mysql to avoid PATH issues
      const mysqlPath = "/usr/local/bin/mysql";

      // Build MySQL command - test basic connection first
      const args = [
        "-h",
        dbConfig.host,
        "-P",
        dbConfig.port.toString(),
        "-u",
        dbConfig.username,
      ];

      // Add password if provided (note: -p with no space for password)
      if (dbConfig.password && dbConfig.password.trim() !== "") {
        args.push(`-p${dbConfig.password}`);
      }

      // Add the test query
      args.push("-e", "SELECT 1 as connection_test;");

      console.log("Executing MySQL command:", mysqlPath, args.join(" "));

      const testProcess = spawn(mysqlPath, args, {
        stdio: ["pipe", "pipe", "pipe"],
        env: {
          ...process.env,
          PATH: process.env.PATH + ":/usr/local/bin:/opt/homebrew/bin",
        },
      });

      let stdout = "";
      let stderr = "";
      let processCompleted = false;

      const timeout = setTimeout(() => {
        if (!processCompleted) {
          testProcess.kill();
          event.reply("test-database-response", {
            success: false,
            error: "Database connection test timed out after 10 seconds",
          });
        }
      }, 10000);

      testProcess.stdout.on("data", (data) => {
        stdout += data.toString();
        console.log("MySQL stdout:", data.toString());
      });

      testProcess.stderr.on("data", (data) => {
        stderr += data.toString();
        console.log("MySQL stderr:", data.toString());
      });

      testProcess.on("close", (code) => {
        clearTimeout(timeout);
        processCompleted = true;

        console.log("MySQL process closed with code:", code);
        console.log("MySQL stdout:", stdout);
        console.log("MySQL stderr:", stderr);

        if (code === 0 && stdout.includes("connection_test")) {
          console.log(
            "Basic MySQL connection successful, now testing database"
          );

          // Connection successful, now test database creation/access
          const dbArgs = [
            "-h",
            dbConfig.host,
            "-P",
            dbConfig.port.toString(),
            "-u",
            dbConfig.username,
          ];

          if (dbConfig.password && dbConfig.password.trim() !== "") {
            dbArgs.push(`-p${dbConfig.password}`);
          }

          dbArgs.push(
            "-e",
            `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`; USE \`${dbConfig.database}\`; SELECT 'database_ok' as db_test;`
          );

          const dbTestProcess = spawn(mysqlPath, dbArgs, {
            stdio: ["pipe", "pipe", "pipe"],
            env: {
              ...process.env,
              PATH: process.env.PATH + ":/usr/local/bin:/opt/homebrew/bin",
            },
          });

          let dbStdout = "";
          let dbStderr = "";

          dbTestProcess.stdout.on("data", (data) => {
            dbStdout += data.toString();
          });

          dbTestProcess.stderr.on("data", (data) => {
            dbStderr += data.toString();
          });

          dbTestProcess.on("close", (dbCode) => {
            if (dbCode === 0 && dbStdout.includes("database_ok")) {
              event.reply("test-database-response", {
                success: true,
                message: "Database connection and access successful",
              });
            } else {
              console.error("Database test failed:", dbStderr);
              event.reply("test-database-response", {
                success: false,
                error: `Database test failed: ${
                  dbStderr.trim() || "Cannot create or access database"
                }`,
              });
            }
          });
        } else {
          // Connection failed, provide detailed error
          let errorMessage = "Connection failed";

          if (stderr.includes("Access denied")) {
            errorMessage = `Access denied for user '${dbConfig.username}' - check username and password`;
          } else if (stderr.includes("Can't connect to MySQL server")) {
            errorMessage = `Cannot connect to MySQL server at '${dbConfig.host}:${dbConfig.port}' - check if server is running`;
          } else if (stderr.includes("Unknown host")) {
            errorMessage = `Unknown host '${dbConfig.host}' - check hostname`;
          } else if (stderr.includes("mysql: command not found")) {
            errorMessage =
              "MySQL client not found - MySQL may not be installed";
          } else if (stderr.trim()) {
            errorMessage = `MySQL error: ${stderr.trim()}`;
          } else if (code !== 0) {
            errorMessage = `Connection failed with exit code ${code}`;
          }

          console.error("MySQL connection failed:", errorMessage);
          event.reply("test-database-response", {
            success: false,
            error: errorMessage,
          });
        }
      });

      testProcess.on("error", (error) => {
        clearTimeout(timeout);
        processCompleted = true;
        console.error("MySQL test process error:", error);

        let errorMessage = "Failed to start MySQL test";
        if (error.code === "ENOENT") {
          errorMessage =
            "MySQL client not found at /usr/local/bin/mysql. Please install MySQL or try SQLite instead.";
        } else {
          errorMessage = `Database test error: ${error.message}`;
        }

        event.reply("test-database-response", {
          success: false,
          error: errorMessage,
        });
      });
    } else if (dbConfig.type === "sqlite") {
      // SQLite connection test
      const fs = require("fs");
      const path = require("path");

      try {
        // For SQLite, just verify the directory exists and is writable
        const dbDir = path.dirname(dbConfig.filename);

        if (!fs.existsSync(dbDir)) {
          fs.mkdirSync(dbDir, { recursive: true });
        }

        // Try to create/access the database file
        const testFile = path.join(dbDir, "test_write.tmp");
        fs.writeFileSync(testFile, "test");
        fs.unlinkSync(testFile);

        event.reply("test-database-response", {
          success: true,
          message: "SQLite location accessible",
        });
      } catch (error) {
        event.reply("test-database-response", {
          success: false,
          error: `SQLite access failed: ${error.message}`,
        });
      }
    } else {
      event.reply("test-database-response", {
        success: false,
        error: "Unsupported database type",
      });
    }
  } catch (error) {
    console.error("Database test error:", error);
    event.reply("test-database-response", {
      success: false,
      error: `Test failed: ${error.message}`,
    });
  }
});

// Main application startup
async function startApplication() {
  try {
    console.log("🚀 Starting Hoppscotch Clone application...");
    console.log("📋 Using configuration:", global.installationConfig);

    // Show splash screen
    createSplashWindow();

    console.log("Starting backend server...");
    // Start backend server first
    let backendStarted = false;
    try {
      await startBackendServer();
      backendStarted = true;
      console.log("✅ Backend server started successfully");
    } catch (error) {
      console.error("❌ Backend startup failed:", error);
      // Continue without backend - don't quit the app
      backendStarted = false;
    }

    console.log("Starting frontend development server...");
    // Start frontend dev server for browser access
    let frontendStarted = false;
    try {
      await startFrontendDevServer();
      frontendStarted = true;
      console.log("✅ Frontend server started successfully");
    } catch (error) {
      console.error("❌ Frontend dev server startup failed:", error);
      // Continue without frontend dev server
      frontendStarted = false;
    }

    // Wait for servers to be ready
    console.log("⏳ Waiting for servers to be ready...");
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Create main window (will load the built frontend) - this should always work
    try {
      console.log("🖼️ Creating main window...");
      await createMainWindow();
      console.log("✅ Main window created successfully");
    } catch (error) {
      console.error("❌ Failed to create main window:", error);
      // Try to show an error window instead of quitting
      createErrorWindow("Failed to create main window: " + error.message);
    }

    // Create application menu
    try {
      createApplicationMenu();
    } catch (error) {
      console.error("❌ Failed to create application menu:", error);
    }

    // Close splash screen
    if (splashWindow) {
      splashWindow.close();
      splashWindow = null;
      console.log("✅ Splash screen closed");
    }

    console.log("🎉 Application startup completed!");
    if (backendStarted) {
      console.log(
        `🔧 Backend available at: http://localhost:${
          global.installationConfig?.backendPort || 5001
        }`
      );
    } else {
      console.log("⚠️  Backend not available - check console for errors");
    }
    if (frontendStarted) {
      console.log(
        `🌐 Frontend available at: http://localhost:${
          global.installationConfig?.frontendPort || 5173
        }`
      );
    }
  } catch (error) {
    console.error("💥 Critical failure in startApplication:", error);

    // Close splash screen if it exists
    if (splashWindow) {
      splashWindow.close();
      splashWindow = null;
    }

    // Don't quit immediately - try to show an error dialog
    try {
      const { dialog } = require("electron");
      dialog.showErrorBox(
        "Startup Error",
        `Failed to start the application: ${error.message}\n\nThe app will continue to run, but some features may not work.`
      );

      // Try to create a basic main window
      createErrorWindow(error.message);
    } catch (dialogError) {
      console.error("💥 Failed to show error dialog:", dialogError);
      // As last resort, quit the app
      app.quit();
    }
  }
}

function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 500,
    height: 350,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  splashWindow.loadFile(path.join(__dirname, "splash.html"));
  splashWindow.center();

  splashWindow.on("closed", () => {
    splashWindow = null;
  });
}

function createErrorWindow(errorMessage) {
  const errorWindow = new BrowserWindow({
    width: 600,
    height: 400,
    frame: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const errorHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Hoppscotch Clone - Error</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
            .container { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .error { color: #d32f2f; }
            .title { color: #1976d2; margin-bottom: 20px; }
            .message { margin: 20px 0; padding: 15px; background: #ffebee; border-left: 4px solid #f44336; }
            .suggestion { margin-top: 20px; padding: 15px; background: #e3f2fd; border-left: 4px solid #2196f3; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1 class="title">🚨 Application Startup Error</h1>
            <div class="message">
                <strong>Error:</strong> ${errorMessage}
            </div>
            <div class="suggestion">
                <strong>What you can try:</strong>
                <ul>
                    <li>Restart the application</li>
                    <li>Check if MySQL database is running</li>
                    <li>Try accessing the web version at <a href="http://localhost:5173">http://localhost:5173</a></li>
                </ul>
            </div>
            <p><em>The application window will remain open, but some features may not work properly.</em></p>
        </div>
    </body>
    </html>
  `;

  errorWindow.loadURL(
    `data:text/html;charset=utf-8,${encodeURIComponent(errorHtml)}`
  );
  errorWindow.center();

  errorWindow.on("closed", () => {
    // Don't quit the app when error window is closed
  });

  return errorWindow;
}

function createInstallerWindow() {
  console.log("🔧 Creating installer window...");

  installerWindow = new BrowserWindow({
    width: 900,
    height: 700,
    frame: true,
    resizable: false,
    show: false, // Start hidden and show explicitly
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    icon: path.join(__dirname, "..", "assets", "icon.png"),
  });

  console.log("📄 Loading installer HTML...");
  installerWindow.loadFile(path.join(__dirname, "installer.html"));

  installerWindow.once("ready-to-show", () => {
    console.log("✅ Installer window ready to show");
    installerWindow.show();
    installerWindow.center();
  });

  installerWindow.on("closed", () => {
    console.log("❌ Installer window closed");
    installerWindow = null;
    if (!global.installationConfig) {
      app.quit();
    }
  });
}

async function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    icon: path.join(__dirname, "..", "assets", "icon.png"),
    show: false, // Don't show until ready-to-show
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
  });

  // Load the built frontend application
  const frontendDistPath = path.join(
    __dirname,
    "..",
    "hoppscotch-clone",
    "dist",
    "index.html"
  );

  try {
    if (fs.existsSync(frontendDistPath)) {
      await mainWindow.loadFile(frontendDistPath);
      console.log("Loaded built frontend from:", frontendDistPath);
    } else {
      console.log("Built frontend not found, trying dev server...");
      const frontendUrl = global.installationConfig?.frontendPort
        ? `http://localhost:${global.installationConfig.frontendPort}`
        : "http://localhost:5173";
      await mainWindow.loadURL(frontendUrl);
    }
  } catch (error) {
    console.error("Failed to load frontend:", error);
    // Fallback to showing an error page
    mainWindow.loadFile(path.join(__dirname, "error.html"));
  }

  // Show window when ready
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();

    // Focus on the window
    if (isDevelopment) {
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
    // Terminate backend process
    if (backendProcess) {
      backendProcess.kill();
    }
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  return mainWindow;
}

async function startBackendServer() {
  return new Promise(async (resolve, reject) => {
    // In packaged app, files are in Resources directory
    const resourcesPath = process.resourcesPath || path.join(__dirname, "..");
    const backendPath =
      path.join(resourcesPath, "app.asar.unpacked", "hoppscotch-backend") ||
      path.join(resourcesPath, "hoppscotch-backend") ||
      path.join(__dirname, "..", "hoppscotch-backend");

    const userDataPath = app.getPath("userData");
    const workingBackendPath = path.join(userDataPath, "hoppscotch-backend");

    // Try different possible paths for the backend
    let actualBackendPath = null;
    const possiblePaths = [
      path.join(resourcesPath, "app.asar.unpacked", "hoppscotch-backend"),
      path.join(resourcesPath, "hoppscotch-backend"),
      path.join(__dirname, "..", "hoppscotch-backend"),
      path.join(process.cwd(), "hoppscotch-backend"),
    ];

    for (const testPath of possiblePaths) {
      console.log("Checking backend path:", testPath);
      if (fs.existsSync(testPath)) {
        actualBackendPath = testPath;
        console.log("Found backend at:", actualBackendPath);
        break;
      }
    }

    if (!actualBackendPath) {
      console.error(
        "Backend directory not found in any of these paths:",
        possiblePaths
      );
      reject(new Error("Backend directory not found"));
      return;
    }

    console.log("Setting up backend server...");
    console.log("📊 Using database configuration:", {
      dbHost: global.installationConfig?.dbHost || "localhost",
      dbPort: global.installationConfig?.dbPort || 3306,
      dbName: global.installationConfig?.dbName || "hoppscotch_db",
      dbUsername: global.installationConfig?.dbUsername || "root",
      dbPasswordProvided: !!global.installationConfig?.dbPassword,
    });

    // Copy backend files to writable location if not already done
    if (!fs.existsSync(workingBackendPath)) {
      console.log("Copying backend files to working directory...");
      try {
        fs.cpSync(actualBackendPath, workingBackendPath, { recursive: true });
      } catch (error) {
        console.error("Failed to copy backend files:", error);
        reject(error);
        return;
      }
    }

    // Check if node_modules exists, if not install dependencies
    const nodeModulesPath = path.join(workingBackendPath, "node_modules");
    if (!fs.existsSync(nodeModulesPath)) {
      console.log("Installing backend dependencies...");
      try {
        await new Promise((installResolve, installReject) => {
          const installProcess = spawn("npm", ["install"], {
            cwd: workingBackendPath,
            stdio: "pipe",
          });

          installProcess.on("close", (code) => {
            if (code === 0) {
              console.log("Backend dependencies installed successfully");
              installResolve();
            } else {
              installReject(new Error(`npm install failed with code ${code}`));
            }
          });

          installProcess.on("error", installReject);
        });
      } catch (error) {
        console.error("Failed to install backend dependencies:", error);
        reject(error);
        return;
      }
    }

    const backendPort = global.installationConfig?.backendPort || 5001;

    console.log("Starting backend process from:", workingBackendPath);
    console.log("Backend port:", backendPort);

    // Try direct node execution instead of npm start for better reliability
    const serverPath = path.join(workingBackendPath, "server.js");

    // Prepare environment variables
    const dbEnv = {
      DB_HOST: global.installationConfig?.dbHost || "localhost",
      DB_PORT: global.installationConfig?.dbPort || 3306,
      DB_NAME: global.installationConfig?.dbName || "hoppscotch_db",
      DB_USER: global.installationConfig?.dbUsername || "root", // Note: backend uses DB_USER not DB_USERNAME
      DB_PASSWORD: global.installationConfig?.dbPassword || "",
    };

    console.log("🔧 Environment variables for backend:", {
      ...dbEnv,
      DB_PASSWORD: dbEnv.DB_PASSWORD ? "***" : "(empty)",
    });

    backendProcess = spawn("node", [serverPath], {
      cwd: workingBackendPath,
      env: {
        ...process.env,
        PORT: backendPort,
        NODE_ENV: "production",
        // Database configuration from installer (matching backend variable names)
        ...dbEnv,
        // Ensure PATH includes node
        PATH: process.env.PATH + ":/usr/local/bin:/opt/homebrew/bin",
      },
      stdio: ["pipe", "pipe", "pipe"],
      detached: false, // Keep attached so we can manage it
      shell: false, // Use direct execution, no shell
    });

    let actualBackendPort = backendPort;

    backendProcess.stdout.on("data", (data) => {
      console.log(`Backend: ${data}`);

      // Look for port information in the output
      const portMatch = data.toString().match(/Server running on port (\d+)/);
      if (portMatch) {
        actualBackendPort = parseInt(portMatch[1]);
        console.log(`📡 Backend started on port: ${actualBackendPort}`);

        // Update global config with actual port
        if (global.installationConfig) {
          global.installationConfig.backendPort = actualBackendPort;
        }
      }
    });

    backendProcess.stderr.on("data", (data) => {
      const errorStr = data.toString();
      console.error(`Backend Error: ${errorStr}`);

      // Check for port in use errors
      if (errorStr.includes("EADDRINUSE") || errorStr.includes("port")) {
        console.log(
          "🔄 Port conflict detected, backend should find alternative port..."
        );
      }
    });

    backendProcess.on("error", (error) => {
      console.error("Failed to start backend:", error);
      console.error("Error details:", {
        code: error.code,
        errno: error.errno,
        syscall: error.syscall,
        path: error.path,
      });

      // Try to restart the backend after a delay
      setTimeout(async () => {
        console.log("Attempting to restart backend...");
        try {
          await startBackendServer();
        } catch (restartError) {
          console.error("Backend restart failed:", restartError);
        }
      }, 5000);

      reject(error);
    });

    backendProcess.on("close", (code, signal) => {
      console.log(
        `Backend process exited with code: ${code}, signal: ${signal}`
      );
      if (code !== 0 && code !== null) {
        console.error("Backend process failed with code:", code);

        // Don't immediately reject, try to restart
        setTimeout(async () => {
          console.log("Backend process died, attempting restart...");
          try {
            await startBackendServer();
          } catch (restartError) {
            console.error("Backend restart after crash failed:", restartError);
          }
        }, 3000);

        reject(new Error(`Backend process failed with exit code: ${code}`));
      }
    });

    backendProcess.on("disconnect", () => {
      console.log("Backend process disconnected");
    });

    // Give backend time to start and wait for port confirmation
    console.log("Waiting for backend to start...");

    let serverReady = false;
    let timeoutCount = 0;
    const maxTimeout = 10; // 10 seconds total

    // Listen for server ready indication
    const checkServerReady = () => {
      return new Promise((checkResolve) => {
        const checkInterval = setInterval(async () => {
          timeoutCount++;

          if (serverReady || timeoutCount >= maxTimeout) {
            clearInterval(checkInterval);
            checkResolve(serverReady);
            return;
          }

          // Try to test connectivity
          try {
            const http = require("http");
            const actualPort =
              global.installationConfig?.backendPort || backendPort;

            const testReq = http.get(
              `http://localhost:${actualPort}/health`,
              (res) => {
                if (res.statusCode === 200) {
                  console.log(
                    `✅ Backend confirmed running on port ${actualPort}`
                  );
                  serverReady = true;
                  clearInterval(checkInterval);
                  checkResolve(true);
                }
              }
            );

            testReq.on("error", () => {
              // Still waiting for server to be ready
            });

            testReq.setTimeout(1000, () => {
              testReq.destroy();
            });
          } catch (error) {
            // Continue waiting
          }
        }, 1000);
      });
    };

    const isReady = await checkServerReady();

    if (backendProcess && !backendProcess.killed && isReady) {
      console.log("Backend process is running and accessible!");
      // Test server accessibility one more time to confirm
      setTimeout(async () => {
        try {
          await testServerAccessibility();
        } catch (error) {
          console.error("Final server accessibility test failed:", error);
        }
      }, 1000);
      resolve();
    } else {
      const error =
        !backendProcess || backendProcess.killed
          ? new Error("Backend process failed to start or was killed")
          : new Error("Backend server not accessible after 10 seconds");
      console.error(error.message);
      reject(error);
    }
  });
}

async function startFrontendDevServer() {
  return new Promise(async (resolve, reject) => {
    console.log("🚀 Starting frontend server for browser access...");

    // In a packaged app, we need to serve the built frontend files
    let frontendPath;
    let isBuiltVersion = false;

    if (app.isPackaged) {
      // In packaged app, serve the built dist files
      frontendPath = path.join(
        process.resourcesPath,
        "app.asar",
        "hoppscotch-clone",
        "dist"
      );
      isBuiltVersion = true;
      console.log("Using built frontend files from:", frontendPath);
    } else {
      // In development, use source files
      frontendPath = path.join(__dirname, "..", "hoppscotch-clone");
      console.log("Using development frontend from:", frontendPath);
    }

    console.log("Checking frontend path:", frontendPath);

    // Check if the frontend directory exists
    if (!fs.existsSync(frontendPath)) {
      console.error("Frontend directory not found:", frontendPath);
      console.log(
        "🌐 Frontend server not available - using electron-only mode"
      );
      resolve(); // Don't reject, just continue without server
      return;
    }

    if (isBuiltVersion) {
      // Serve built files with a simple static server
      console.log("🌐 Starting static file server for built frontend...");
      await startStaticServer(frontendPath);
      resolve();
    } else {
      // Check if package.json exists for dev server
      const packageJsonPath = path.join(frontendPath, "package.json");
      if (!fs.existsSync(packageJsonPath)) {
        console.log("📦 No package.json found, cannot start dev server");
        console.log("🌐 Frontend will be Electron-only");
        resolve();
        return;
      }

      console.log("Starting Vite dev server from:", frontendPath);

      // Start Vite dev server
      frontendProcess = spawn(
        "npm",
        ["run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"],
        {
          cwd: frontendPath,
          env: {
            ...process.env,
            NODE_ENV: "development",
          },
          stdio: "pipe",
        }
      );

      frontendProcess.stdout.on("data", (data) => {
        console.log(`Frontend Dev: ${data}`);
        // Check if server is ready
        if (
          data.toString().includes("Local:") ||
          data.toString().includes("ready")
        ) {
          setTimeout(() => {
            console.log("🌐 Frontend dev server ready at:");
            console.log("   - http://localhost:5173");
            console.log("   - http://127.0.0.1:5173");
            resolve();
          }, 1000);
        }
      });

      frontendProcess.stderr.on("data", (data) => {
        console.error(`Frontend Dev Error: ${data}`);
      });

      frontendProcess.on("error", (error) => {
        console.error("Failed to start frontend dev server:", error);
        resolve(); // Don't reject, app can still work without browser access
      });

      frontendProcess.on("close", (code) => {
        console.log(`Frontend dev server process exited with code: ${code}`);
      });

      // Fallback timeout
      setTimeout(() => {
        if (frontendProcess && !frontendProcess.killed) {
          console.log("Frontend dev server started (fallback timeout)");
          resolve();
        } else {
          console.log(
            "Frontend dev server failed to start, continuing without browser access"
          );
          resolve(); // Don't reject, app can still work
        }
      }, 10000); // 10 second timeout
    }
  });
}

async function startFrontendServer() {
  return new Promise(async (resolve, reject) => {
    const frontendPath = path.join(__dirname, "..", "hoppscotch-clone");
    const userDataPath = app.getPath("userData");
    const workingFrontendPath = path.join(userDataPath, "hoppscotch-clone");

    if (!fs.existsSync(frontendPath)) {
      reject(new Error("Frontend directory not found"));
      return;
    }

    console.log("Setting up frontend server...");

    // Copy frontend files to writable location if not already done
    if (!fs.existsSync(workingFrontendPath)) {
      console.log("Copying frontend files to working directory...");
      try {
        fs.cpSync(frontendPath, workingFrontendPath, { recursive: true });
      } catch (error) {
        console.error("Failed to copy frontend files:", error);
        reject(error);
        return;
      }
    }

    // Check if node_modules exists, if not install dependencies
    const nodeModulesPath = path.join(workingFrontendPath, "node_modules");
    if (!fs.existsSync(nodeModulesPath)) {
      console.log("Installing frontend dependencies...");
      try {
        await new Promise((installResolve, installReject) => {
          const installProcess = spawn("npm", ["install"], {
            cwd: workingFrontendPath,
            stdio: "pipe",
          });

          installProcess.on("close", (code) => {
            if (code === 0) {
              console.log("Frontend dependencies installed successfully");
              installResolve();
            } else {
              installReject(new Error(`npm install failed with code ${code}`));
            }
          });

          installProcess.on("error", installReject);
        });
      } catch (error) {
        console.error("Failed to install frontend dependencies:", error);
        reject(error);
        return;
      }
    }

    const frontendPort = global.installationConfig?.frontendPort || 5173;

    frontendProcess = spawn("npm", ["run", "dev"], {
      cwd: workingFrontendPath,
      env: {
        ...process.env,
        PORT: frontendPort,
        HOST: "0.0.0.0",
      },
    });

    frontendProcess.stdout.on("data", (data) => {
      console.log(`Frontend: ${data}`);
    });

    frontendProcess.stderr.on("data", (data) => {
      console.error(`Frontend Error: ${data}`);
    });

    frontendProcess.on("error", (error) => {
      console.error("Failed to start frontend:", error);
      reject(error);
    });

    // Give frontend time to start
    setTimeout(() => {
      if (frontendProcess && !frontendProcess.killed) {
        resolve();
      } else {
        reject(new Error("Frontend process failed to start"));
      }
    }, 8000); // Reduced timeout
  });
}

function createApplicationMenu() {
  const template = [
    {
      label: "File",
      submenu: [
        {
          label: "New Request",
          accelerator: "CmdOrCtrl+N",
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send("menu-new-request");
            }
          },
        },
        {
          label: "Save Request",
          accelerator: "CmdOrCtrl+S",
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send("menu-save-request");
            }
          },
        },
        { type: "separator" },
        process.platform === "darwin"
          ? {
              label: "Close",
              accelerator: "CmdOrCtrl+W",
              role: "close",
            }
          : {
              label: "Exit",
              accelerator: "CmdOrCtrl+Q",
              role: "quit",
            },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { label: "Undo", accelerator: "CmdOrCtrl+Z", role: "undo" },
        { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", role: "redo" },
        { type: "separator" },
        { label: "Cut", accelerator: "CmdOrCtrl+X", role: "cut" },
        { label: "Copy", accelerator: "CmdOrCtrl+C", role: "copy" },
        { label: "Paste", accelerator: "CmdOrCtrl+V", role: "paste" },
      ],
    },
    {
      label: "View",
      submenu: [
        { label: "Reload", accelerator: "CmdOrCtrl+R", role: "reload" },
        {
          label: "Force Reload",
          accelerator: "CmdOrCtrl+Shift+R",
          role: "forceReload",
        },
        {
          label: "Toggle Developer Tools",
          accelerator: "F12",
          role: "toggleDevTools",
        },
        { type: "separator" },
        { label: "Actual Size", accelerator: "CmdOrCtrl+0", role: "resetZoom" },
        { label: "Zoom In", accelerator: "CmdOrCtrl+Plus", role: "zoomIn" },
        { label: "Zoom Out", accelerator: "CmdOrCtrl+-", role: "zoomOut" },
        { type: "separator" },
        {
          label: "Toggle Fullscreen",
          accelerator: "F11",
          role: "togglefullscreen",
        },
      ],
    },
    {
      label: "Window",
      submenu: [
        { label: "Minimize", accelerator: "CmdOrCtrl+M", role: "minimize" },
        { label: "Close", accelerator: "CmdOrCtrl+W", role: "close" },
      ],
    },
    {
      label: "Tools",
      submenu: [
        {
          label: "Start Web Servers",
          click: async () => {
            try {
              await startWebServers();
              dialog.showMessageBox(mainWindow, {
                type: "info",
                title: "Web Servers Started",
                message: "Frontend and Backend servers are now running!",
                detail:
                  "Frontend: http://localhost:5173\nBackend: http://localhost:5001",
              });
            } catch (error) {
              dialog.showErrorBox(
                "Server Error",
                "Failed to start web servers: " + error.message
              );
            }
          },
        },
        {
          label: "Open Frontend in Browser",
          click: () => {
            shell.openExternal("http://localhost:5173");
          },
        },
        {
          label: "Open Backend API in Browser",
          click: () => {
            shell.openExternal("http://localhost:5001/health");
          },
        },
        { type: "separator" },
        {
          label: "Stop Web Servers",
          click: () => {
            stopWebServers();
            dialog.showMessageBox(mainWindow, {
              type: "info",
              title: "Web Servers Stopped",
              message: "Frontend and Backend servers have been stopped.",
            });
          },
        },
      ],
    },
    {
      label: "Help",
      submenu: [
        {
          label: "About",
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: "info",
              title: "About Hoppscotch Clone",
              message: "Hoppscotch Clone",
              detail:
                "A powerful API development environment built with Electron.",
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Function to start web servers for browser access
async function startWebServers() {
  console.log("Starting web servers for browser access...");

  try {
    // Start backend server if not already running
    if (!backendProcess || backendProcess.killed) {
      await startBackendServer();
    }

    // Start frontend dev server
    await startFrontendServer();

    console.log("Web servers started successfully!");
  } catch (error) {
    console.error("Failed to start web servers:", error);
    throw error;
  }
}

// Function to stop web servers
function stopWebServers() {
  console.log("Stopping web servers...");

  if (frontendProcess && !frontendProcess.killed) {
    frontendProcess.kill();
    frontendProcess = null;
  }

  if (backendProcess && !backendProcess.killed) {
    backendProcess.kill();
    backendProcess = null;
  }

  if (frontendProcess && !frontendProcess.killed) {
    frontendProcess.kill();
    frontendProcess = null;
  }

  console.log("Web servers stopped.");
}

// IPC handlers for window controls
ipcMain.handle("get-app-version", () => {
  return app.getVersion();
});

ipcMain.handle("get-backend-port", () => {
  const backendPort = global.installationConfig?.backendPort || 5001;
  console.log("📡 Frontend requesting backend port:", backendPort);
  return backendPort;
});

ipcMain.handle("minimize-window", () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.handle("maximize-window", () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle("close-window", () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

ipcMain.handle("select-directory", async () => {
  if (mainWindow) {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ["openDirectory"],
    });

    return result.filePaths[0] || null;
  }
  return null;
});

// App event handlers
app.whenReady().then(async () => {
  console.log("🚀 Electron app ready!");
  console.log("📂 User data path:", app.getPath("userData"));
  console.log("🔍 Checking first run status...");
  console.log("📁 Installation marker path:", getInstallationMarkerPath());
  console.log("📋 Is first run:", isFirstRun);

  if (isFirstRun) {
    console.log("🎯 First run detected - showing installer");
    createInstallerWindow();
  } else {
    console.log(
      "✅ Previous installation detected - loading config and starting app"
    );
    // Load saved configuration
    try {
      const configPath = getConfigPath();
      console.log("📖 Loading config from:", configPath);
      const configData = fs.readFileSync(configPath, "utf8");
      global.installationConfig = JSON.parse(configData);
      console.log("✅ Configuration loaded:", global.installationConfig);
    } catch (error) {
      console.log("⚠️  No saved configuration found, using defaults");
      global.installationConfig = {
        frontendPort: 5173,
        backendPort: 5001,
      };
    }

    await startApplication();
  }
});

app.on("window-all-closed", () => {
  // Terminate backend process
  if (backendProcess) {
    backendProcess.kill();
  }

  // Terminate frontend process
  if (frontendProcess) {
    frontendProcess.kill();
  }

  // On macOS, keep app running even when all windows are closed
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", async () => {
  // On macOS, re-create window when dock icon is clicked
  if (BrowserWindow.getAllWindows().length === 0) {
    if (isFirstRun) {
      createInstallerWindow();
    } else {
      await startApplication();
    }
  }
});

// Simple static file server for built frontend using Node.js built-in modules
async function startStaticServer(distPath) {
  const http = require("http");
  const url = require("url");
  const path = require("path");
  const fs = require("fs");

  const staticPort = global.installationConfig?.frontendPort || 5173;

  // MIME types for common file extensions
  const mimeTypes = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".gif": "image/gif",
    ".ico": "image/x-icon",
    ".svg": "image/svg+xml",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
  };

  // Find available port starting from 5173
  const findAvailablePort = (port) => {
    return new Promise((resolve) => {
      const net = require("net");
      const server = net.createServer();

      server.listen(port, "0.0.0.0", () => {
        const actualPort = server.address().port;
        server.close(() => {
          resolve(actualPort);
        });
      });

      server.on("error", () => {
        resolve(findAvailablePort(port + 1));
      });
    });
  };

  try {
    const availablePort = await findAvailablePort(staticPort);

    const server = http.createServer((req, res) => {
      // Parse URL
      const parsedUrl = url.parse(req.url);
      let pathname = path.join(distPath, parsedUrl.pathname);

      // Default to index.html for root and SPA routes
      if (parsedUrl.pathname === "/" || !path.extname(pathname)) {
        pathname = path.join(distPath, "index.html");
      }

      // Security: prevent directory traversal
      if (!pathname.startsWith(distPath)) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
      }

      // Check if file exists
      fs.access(pathname, fs.constants.F_OK, (err) => {
        if (err) {
          // File not found, serve index.html for SPA routing
          const indexPath = path.join(distPath, "index.html");
          fs.readFile(indexPath, (err, data) => {
            if (err) {
              res.writeHead(404);
              res.end("Not Found");
              return;
            }
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(data);
          });
          return;
        }

        // Serve the file
        fs.readFile(pathname, (err, data) => {
          if (err) {
            res.writeHead(500);
            res.end("Server Error");
            return;
          }

          // Get content type
          const ext = path.extname(pathname);
          const contentType = mimeTypes[ext] || "application/octet-stream";

          res.writeHead(200, {
            "Content-Type": contentType,
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          });
          res.end(data);
        });
      });
    });

    server.listen(availablePort, "0.0.0.0", () => {
      console.log(`✅ Frontend static server running on port ${availablePort}`);
      console.log(`🌐 Browser access: http://localhost:${availablePort}`);
      console.log(`📁 Serving files from: ${distPath}`);

      // Update global config with actual frontend port
      if (global.installationConfig) {
        global.installationConfig.frontendPort = availablePort;
      }
    });

    // Store server reference for cleanup
    global.staticServer = server;
  } catch (error) {
    console.error("Failed to start static server:", error);
  }
}

app.on("before-quit", () => {
  // Cleanup backend process
  if (backendProcess) {
    backendProcess.kill();
  }

  // Cleanup frontend process
  if (frontendProcess) {
    frontendProcess.kill();
  }

  // Cleanup static server
  if (global.staticServer) {
    global.staticServer.close();
  }
});

// Handle certificate errors
app.on(
  "certificate-error",
  (event, webContents, url, error, certificate, callback) => {
    if (url.startsWith("https://localhost")) {
      // Ignore certificate errors for localhost in development
      event.preventDefault();
      callback(true);
    } else {
      callback(false);
    }
  }
);
