const { ipcRenderer } = require("electron");

let currentStep = 1;
const totalSteps = 8;
let installationConfig = {
  installPath: "",
  frontendPort: 5173,
  backendPort: 5001,
  autoPortDetection: true,
  allowLocalhost: true,
  allowLAN: false,
  storageType: "database", // Add storage type
  dbType: "mysql",
  dbHost: "localhost",
  dbPort: 3306,
  dbName: "hoppscotch_clone",
  dbUsername: "root",
  dbPassword: "",
  createTables: true,
  seedData: false,
  jsonBackup: true, // Add JSON storage options
  jsonEncrypt: false,
  createDesktopShortcut: true,
  createStartMenu: true,
  autoStart: false,
  acceptedLicense: false,
};

// Initialize the installer
document.addEventListener("DOMContentLoaded", () => {
  initializeInstaller();
  updateUI();
  setDefaultPaths();
});

function initializeInstaller() {
  console.log("Initializing Hoppscotch Clone Installer...");

  // Add event listeners for form elements
  const acceptLicense = document.getElementById("acceptLicense");
  const frontendPort = document.getElementById("frontendPort");
  const backendPort = document.getElementById("backendPort");
  const storageType = document.getElementById("storageType");
  const dbHost = document.getElementById("dbHost");
  const dbName = document.getElementById("dbName");
  const dbUsername = document.getElementById("dbUsername");
  const confirmInstall = document.getElementById("confirmInstall");

  if (acceptLicense) acceptLicense.addEventListener("change", validateStep);
  if (frontendPort) frontendPort.addEventListener("input", validateStep);
  if (backendPort) backendPort.addEventListener("input", validateStep);
  if (storageType) storageType.addEventListener("change", toggleStorageOptions);
  if (dbHost) dbHost.addEventListener("input", validateStep);
  if (dbName) dbName.addEventListener("input", validateStep);
  if (dbUsername) dbUsername.addEventListener("input", validateStep);
  if (confirmInstall) confirmInstall.addEventListener("change", validateStep);

  // Set up navigation buttons - will be managed by updateNavigationButtons()
  const prevBtn = document.getElementById("prevBtn");
  if (prevBtn) {
    prevBtn.onclick = previousStep;
  }

  // Initialize storage options display
  setTimeout(() => {
    toggleStorageOptions();
  }, 100);

  console.log("Installer initialized successfully");
}

function setDefaultPaths() {
  const pathElement = document.getElementById("installPath");
  let defaultPath;

  if (process.platform === "win32") {
    defaultPath = "C:\\Program Files\\Hoppscotch Clone";
  } else if (process.platform === "darwin") {
    defaultPath = "/Applications/Hoppscotch Clone";
  } else {
    defaultPath = "/opt/hoppscotch-clone";
  }

  if (pathElement) {
    pathElement.value = defaultPath;
    installationConfig.installPath = defaultPath;
  }
}

function updateUI() {
  console.log("Updating UI to step:", currentStep);

  // Hide all pages
  for (let i = 1; i <= totalSteps; i++) {
    const page = document.getElementById(`page${i}`);
    if (page) {
      page.classList.remove("active");
      page.style.display = "none";
    }

    const dot = document.getElementById(`dot${i}`);
    if (dot) {
      dot.className = "step-dot";
    }
  }

  // Show current page
  const currentPage = document.getElementById(`page${currentStep}`);
  if (currentPage) {
    currentPage.classList.add("active");
    currentPage.style.display = "block";
  }

  // Update progress dots
  for (let i = 1; i <= currentStep; i++) {
    const dot = document.getElementById(`dot${i}`);
    if (dot) {
      dot.className =
        i === currentStep ? "step-dot active" : "step-dot completed";
    }
  }

  // Update step indicator
  const stepIndicator = document.getElementById("currentStep");
  if (stepIndicator) {
    stepIndicator.textContent = currentStep;
  }

  // Update buttons
  updateNavigationButtons();

  // Validate current step
  validateStep();

  // Update installation summary if on review step
  if (currentStep === 6) {
    updateInstallationSummary();
  }
}

function updateNavigationButtons() {
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  if (prevBtn) {
    prevBtn.style.display = currentStep === 1 ? "none" : "inline-block";
    // Always assign the previousStep function
    prevBtn.onclick = previousStep;
  }

  if (nextBtn) {
    // Update button text and function based on current step
    if (currentStep === 6) {
      nextBtn.textContent = "Start Installation";
      nextBtn.onclick = startInstallation;
    } else if (currentStep === totalSteps) {
      nextBtn.textContent = "Finish";
      nextBtn.onclick = finishInstallation;
    } else {
      nextBtn.textContent = "Next";
      nextBtn.onclick = nextStep;
    }
  }
}

function validateStep() {
  const nextBtn = document.getElementById("nextBtn");
  if (!nextBtn) return;

  let isValid = false;

  switch (currentStep) {
    case 1:
      isValid = true; // Welcome step is always valid
      break;

    case 2:
      const acceptLicense = document.getElementById("acceptLicense");
      isValid = acceptLicense && acceptLicense.checked;
      break;

    case 3:
      const installPath = document.getElementById("installPath");
      isValid = installPath && installPath.value.trim() !== "";
      break;

    case 4:
      const frontendPort = document.getElementById("frontendPort");
      const backendPort = document.getElementById("backendPort");
      const portTestStatus = document.getElementById("portTestStatus");

      isValid =
        frontendPort &&
        backendPort &&
        frontendPort.value > 1023 &&
        frontendPort.value <= 65535 &&
        backendPort.value > 1023 &&
        backendPort.value <= 65535 &&
        frontendPort.value !== backendPort.value;

      // If ports are valid but not tested, encourage testing
      if (
        isValid &&
        (!portTestStatus || !portTestStatus.classList.contains("test-success"))
      ) {
        const testBtn = document.querySelector(
          '.test-connection[onclick*="testPorts"]'
        );
        if (testBtn) {
          testBtn.style.animation = "pulse 2s infinite";
        }
      }
      break;

    case 5:
      const storageTypeSelect = document.getElementById("storageType");
      installationConfig.storageType = storageTypeSelect ? storageTypeSelect.value : "database";

      if (installationConfig.storageType === "database") {
        const dbTypeSelect = document.getElementById("dbType");
        installationConfig.dbType = dbTypeSelect ? dbTypeSelect.value : "mysql";

        if (installationConfig.dbType === "mysql") {
          installationConfig.dbHost = document.getElementById("dbHost").value;
          installationConfig.dbPort = parseInt(
            document.getElementById("dbPort").value
          );
          installationConfig.dbName = document.getElementById("dbName").value;
          installationConfig.dbUsername =
            document.getElementById("dbUsername").value;
          installationConfig.dbPassword =
            document.getElementById("dbPassword").value;
        }

        installationConfig.createTables =
          document.getElementById("createTables").checked;
        installationConfig.seedData = document.getElementById("seedData").checked;
      } else if (installationConfig.storageType === "json") {
        // Save JSON storage options
        installationConfig.jsonBackup = document.getElementById("jsonBackup").checked;
        installationConfig.jsonEncrypt = document.getElementById("jsonEncrypt").checked;
      }
      break;

    case 6:
      // Review step - check confirmation checkbox
      const confirmInstall = document.getElementById("confirmInstall");
      isValid = confirmInstall && confirmInstall.checked;
      break;

    default:
      isValid = true;
  }

  nextBtn.disabled = !isValid;
}

function nextStep() {
  console.log("Next step clicked, current step:", currentStep);
  if (currentStep < totalSteps) {
    // Save current step data
    saveCurrentStepData();
    currentStep++;
    console.log("Moving to step:", currentStep);
    updateUI();
  }
}

function previousStep() {
  console.log("Previous step clicked, current step:", currentStep);
  if (currentStep > 1 && currentStep !== 7) {
    // Don't allow going back from installation progress
    currentStep--;
    console.log("Moving to step:", currentStep);
    updateUI();
  }
}

function saveCurrentStepData() {
  switch (currentStep) {
    case 2:
      installationConfig.acceptedLicense =
        document.getElementById("acceptLicense").checked;
      break;

    case 3:
      installationConfig.installPath =
        document.getElementById("installPath").value;
      installationConfig.createDesktopShortcut = document.getElementById(
        "createDesktopShortcut"
      ).checked;
      installationConfig.createStartMenu =
        document.getElementById("createStartMenu").checked;
      installationConfig.autoStart =
        document.getElementById("autoStart").checked;
      break;

    case 4:
      installationConfig.frontendPort = parseInt(
        document.getElementById("frontendPort").value
      );
      installationConfig.backendPort = parseInt(
        document.getElementById("backendPort").value
      );
      installationConfig.autoPortDetection =
        document.getElementById("autoPortDetection").checked;
      installationConfig.allowLocalhost =
        document.getElementById("allowLocalhost").checked;
      installationConfig.allowLAN = document.getElementById("allowLAN").checked;
      break;

    case 5:
      const storageTypeSelect = document.getElementById("storageType");
      installationConfig.storageType = storageTypeSelect ? storageTypeSelect.value : "database";

      if (installationConfig.storageType === "database") {
        const dbTypeSelect = document.getElementById("dbType");
        installationConfig.dbType = dbTypeSelect ? dbTypeSelect.value : "mysql";

        if (installationConfig.dbType === "mysql") {
          installationConfig.dbHost = document.getElementById("dbHost").value;
          installationConfig.dbPort = parseInt(
            document.getElementById("dbPort").value
          );
          installationConfig.dbName = document.getElementById("dbName").value;
          installationConfig.dbUsername =
            document.getElementById("dbUsername").value;
          installationConfig.dbPassword =
            document.getElementById("dbPassword").value;
        }

        installationConfig.createTables =
          document.getElementById("createTables").checked;
        installationConfig.seedData = document.getElementById("seedData").checked;
      } else if (installationConfig.storageType === "json") {
        // Save JSON storage options
        installationConfig.jsonBackup = document.getElementById("jsonBackup").checked;
        installationConfig.jsonEncrypt = document.getElementById("jsonEncrypt").checked;
      }
      break;
  }
}

function browseInstallPath() {
  // This would typically open a file dialog
  showMessage("info", "File browser integration coming soon!");
}

function testPorts() {
  const frontendPort = parseInt(document.getElementById("frontendPort").value);
  const backendPort = parseInt(document.getElementById("backendPort").value);
  const testBtn = document.querySelector(
    '.test-connection[onclick*="testPorts"]'
  );

  // Clear any existing animation
  if (testBtn) {
    testBtn.style.animation = "";
  }

  if (!frontendPort || !backendPort) {
    showMessage("error", "Please enter both port numbers");
    return;
  }

  if (frontendPort === backendPort) {
    showMessage("error", "Frontend and backend ports cannot be the same");
    return;
  }

  if (
    frontendPort < 1024 ||
    frontendPort > 65535 ||
    backendPort < 1024 ||
    backendPort > 65535
  ) {
    showMessage("error", "Port numbers must be between 1024 and 65535");
    return;
  }

  showMessage("info", "Testing port availability...");

  // Send request to main process to test ports
  ipcRenderer.send("test-ports", { frontendPort, backendPort });

  // Listen for response
  ipcRenderer.once("test-ports-response", (event, result) => {
    if (result.success) {
      if (result.frontendAvailable && result.backendAvailable) {
        showMessage(
          "success",
          `✅ Both ports are available!\n• Frontend: ${frontendPort}\n• Backend: ${backendPort}`
        );

        // Update the installation config immediately
        installationConfig.frontendPort = frontendPort;
        installationConfig.backendPort = backendPort;

        // Enable the next button
        validateStep();
      } else {
        let errorMsg = "❌ Port(s) not available:\n";
        if (!result.frontendAvailable) {
          errorMsg += `• Frontend port ${frontendPort} is in use\n`;
        }
        if (!result.backendAvailable) {
          errorMsg += `• Backend port ${backendPort} is in use\n`;
        }
        errorMsg += "\nPlease try different port numbers.";
        showMessage("error", errorMsg);
      }
    } else {
      showMessage("error", `Port testing failed: ${result.error}`);
    }
  });
}

function toggleDBOptions() {
  const dbType = document.getElementById("dbType");
  const mysqlOptions = document.getElementById("mysqlOptions");
  const sqliteOptions = document.getElementById("sqliteOptions");

  if (mysqlOptions && sqliteOptions) {
    if (dbType.value === "mysql") {
      mysqlOptions.style.display = "block";
      sqliteOptions.style.display = "none";
    } else if (dbType.value === "sqlite") {
      mysqlOptions.style.display = "none";
      sqliteOptions.style.display = "block";
    }
  }

  validateStep();
}

function toggleStorageOptions() {
  const storageType = document.getElementById("storageType");
  const databaseOptions = document.getElementById("databaseOptions");
  const jsonOptions = document.getElementById("jsonOptions");

  if (databaseOptions && jsonOptions) {
    if (storageType.value === "database") {
      databaseOptions.style.display = "block";
      jsonOptions.style.display = "none";
    } else if (storageType.value === "json") {
      databaseOptions.style.display = "none";
      jsonOptions.style.display = "block";
    } else if (storageType.value === "skip") {
      databaseOptions.style.display = "none";
      jsonOptions.style.display = "none";
    }
  }

  validateStep();
}

function testDatabaseConnection() {
  const dbTypeSelect = document.getElementById("dbType");
  const testBtn = document.querySelector(
    '.test-connection[onclick*="testDatabaseConnection"]'
  );

  // Clear any existing animation
  if (testBtn) {
    testBtn.style.animation = "";
  }

  if (!dbTypeSelect || !dbTypeSelect.value) {
    showMessage("error", "Please select a database type");
    return;
  }

  const dbType = dbTypeSelect.value;

  if (dbType === "sqlite") {
    showMessage("success", "✅ SQLite database will be created automatically");
    return;
  }

  if (dbType === "skip") {
    showMessage("info", "ℹ️ Database setup will be skipped");
    return;
  }

  const host = document.getElementById("dbHost").value.trim();
  const port = parseInt(document.getElementById("dbPort").value);
  const database = document.getElementById("dbName").value.trim();
  const username = document.getElementById("dbUsername").value.trim();
  const password = document.getElementById("dbPassword").value;

  if (!host || !database || !username) {
    showMessage(
      "error",
      "Please fill in all required database fields (Host, Database Name, Username)"
    );
    return;
  }

  if (!port || port < 1 || port > 65535) {
    showMessage("error", "Please enter a valid port number (1-65535)");
    return;
  }

  showMessage("info", "🔄 Testing database connection...");

  // Send database test request to main process
  const dbConfig = {
    type: dbType,
    host: host,
    port: port,
    database: database,
    username: username,
    password: password,
  };

  ipcRenderer.send("test-database", dbConfig);

  // Listen for response
  ipcRenderer.once("test-database-response", (event, result) => {
    if (result.success) {
      showMessage(
        "success",
        `✅ Database connection successful!\n• Host: ${host}:${port}\n• Database: ${database}\n• Connected as: ${username}`
      );

      // Update the installation config immediately
      installationConfig.dbType = dbType;
      installationConfig.dbHost = host;
      installationConfig.dbPort = port;
      installationConfig.dbName = database;
      installationConfig.dbUsername = username;
      installationConfig.dbPassword = password;

      // Enable the next button
      validateStep();
    } else {
      let errorMsg = `❌ Database connection failed:\n${result.error}\n\n`;
      errorMsg += "Please check:\n";
      errorMsg += "• MySQL server is running\n";
      errorMsg += "• Host and port are correct\n";
      errorMsg += "• Username and password are valid\n";
      errorMsg += "• Database exists or user has CREATE privileges";

      showMessage("error", errorMsg);
    }
  });
}

function startInstallation() {
  // Save review step data
  saveCurrentStepData();

  // Move to installation progress step
  currentStep = 7;
  updateUI();

  // Hide navigation buttons during installation
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  if (prevBtn) prevBtn.style.display = "none";
  if (nextBtn) nextBtn.style.display = "none";

  // Start the actual installation process
  performInstallation();
}

function performInstallation() {
  const progressFill = document.getElementById("progressFill");
  const progressText = document.getElementById("progressText");
  const installLog = document.getElementById("installLog");

  const installSteps = [
    { text: "Preparing installation...", progress: 10 },
    { text: "Extracting files...", progress: 25 },
    { text: "Installing backend components...", progress: 40 },
    { text: "Installing frontend components...", progress: 60 },
    { text: "Creating shortcuts...", progress: 75 },
    { text: "Configuring application...", progress: 90 },
    { text: "Finalizing installation...", progress: 100 },
  ];

  let stepIndex = 0;

  function runInstallStep() {
    if (stepIndex >= installSteps.length) {
      // Installation complete
      setTimeout(() => {
        currentStep = 8;
        updateUI();

        // Auto-finish after 2 seconds instead of waiting for user
        setTimeout(() => {
          finishInstallation();
        }, 2000);
      }, 1000);
      return;
    }

    const step = installSteps[stepIndex];

    if (progressText) progressText.textContent = step.text;
    if (progressFill) progressFill.style.width = step.progress + "%";

    // Add to log
    if (installLog) {
      const logEntry = document.createElement("div");
      logEntry.style.color = "#27ae60";
      logEntry.textContent = `✓ ${step.text}`;
      installLog.appendChild(logEntry);
      installLog.scrollTop = installLog.scrollHeight;
    }

    stepIndex++;

    // Simulate installation time
    setTimeout(runInstallStep, 1500 + Math.random() * 1000);
  }

  // Clear log and start
  if (installLog) {
    installLog.innerHTML = "Starting installation process...<br>";
  }

  setTimeout(runInstallStep, 1000);
}

function updateInstallationSummary() {
  const summaryElement = document.getElementById("installationSummary");
  if (!summaryElement) return;

  // Use the configuration that was actually saved and validated
  // Don't read from form inputs as they might not reflect resolved ports
  console.log("Updating installation summary with config:", installationConfig);

  const summary = `
    <strong>Installation Path:</strong> ${installationConfig.installPath}<br>
    <strong>Frontend Port:</strong> ${installationConfig.frontendPort}<br>
    <strong>Backend Port:</strong> ${installationConfig.backendPort}<br>
    <strong>Database Type:</strong> ${installationConfig.dbType.toUpperCase()}<br>
    ${
      installationConfig.dbType === "mysql"
        ? `<strong>Database Host:</strong> ${installationConfig.dbHost}<br>
       <strong>Database Name:</strong> ${installationConfig.dbName}<br>`
        : ""
    }
    <strong>Create Shortcuts:</strong> ${
      installationConfig.createDesktopShortcut ? "Yes" : "No"
    }<br>
    <strong>Auto Start:</strong> ${installationConfig.autoStart ? "Yes" : "No"}
  `;

  summaryElement.innerHTML = summary;
}

function finishInstallation() {
  console.log("🏁 Finishing installation with config:", installationConfig);

  // Send installation complete message to main process
  if (typeof ipcRenderer !== "undefined") {
    console.log("📤 Sending installation-complete message to main process");
    ipcRenderer.send("installation-complete", installationConfig);
  } else {
    console.warn(
      "⚠️ ipcRenderer not available - installation won't complete properly"
    );
  }

  // Close installer
  setTimeout(() => {
    console.log("🚪 Closing installer window");
    if (typeof ipcRenderer !== "undefined") {
      ipcRenderer.send("close-installer");
    } else {
      window.close();
    }
  }, 1000);
}

function showMessage(type, message) {
  // Create or update message display
  let messageDiv = document.getElementById("messageDisplay");
  if (!messageDiv) {
    messageDiv = document.createElement("div");
    messageDiv.id = "messageDisplay";
    messageDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 6px;
      color: white;
      font-weight: 500;
      z-index: 1000;
      max-width: 400px;
      word-wrap: break-word;
    `;
    document.body.appendChild(messageDiv);
  }

  const colors = {
    success: "#27ae60",
    error: "#e74c3c",
    warning: "#f39c12",
    info: "#3498db",
  };

  messageDiv.style.backgroundColor = colors[type] || colors.info;
  messageDiv.textContent = message;
  messageDiv.style.display = "block";

  // Auto-hide after 3 seconds
  setTimeout(() => {
    messageDiv.style.display = "none";
  }, 3000);
}

function closeInstaller() {
  if (
    confirm(
      "Are you sure you want to close the installer? Any progress will be lost."
    )
  ) {
    if (typeof ipcRenderer !== "undefined") {
      ipcRenderer.send("close-installer");
    } else {
      window.close();
    }
  }
}

// Prevent closing during installation
window.addEventListener("beforeunload", (e) => {
  if (currentStep === 7) {
    // Installation in progress
    e.preventDefault();
    e.returnValue =
      "Installation is in progress. Closing now may corrupt the installation.";
    return "Installation is in progress. Closing now may corrupt the installation.";
  }
});
