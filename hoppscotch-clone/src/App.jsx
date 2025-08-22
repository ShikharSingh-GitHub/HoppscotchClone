import { useEffect } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import "./App.css";
import Footer from "./components/Footer/Footer";
import AuthModal from "./components/Modal/AuthModal";
import Navbar from "./components/Navbar/Navbar";
import Sidebar from "./components/Sidebar/Sidebar";
import GraphQLPanel from "./pages/GraphQLPanel";
import RealTimePanel from "./pages/RealTimePanel";
import RestPanel from "./pages/RestPanel";
import SettingsPanel from "./pages/SettingsPanel";
import useHistoryStore from "./store/historyStore";
import useStorageConfigStore from "./store/storageConfigStore";
import { demonstrateAuthMethods } from "./utils/authTesting";

function App() {
  const { initializeStorage } = useHistoryStore();
  const { checkAvailability, initialize: initializeStorageConfig } =
    useStorageConfigStore();

  // Expose stores to window for debugging
  useEffect(() => {
    window.useStorageConfigStore = useStorageConfigStore;

    // Add helper function to enable JSON-only mode
    window.enableJSONOnlyMode = () => {
      const storageConfig = useStorageConfigStore.getState();
      storageConfig.enableJSONOnlyMode();
      console.log("🎉 JSON-only mode enabled via window helper!");
    };

    console.log("🔧 Storage config store exposed to window for debugging");
    console.log(
      "💡 To enable JSON-only mode, run: window.enableJSONOnlyMode()"
    );
  }, []);

  // Initialize storage and authentication on app load
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log("🚀 Initializing Hoppscotch Clone...");

        // Small delay to ensure Electron API is fully loaded
        if (window.electronAPI) {
          console.log(
            "🔌 Electron API detected, waiting for full initialization..."
          );
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        // Check storage availability first
        await checkAvailability();

        // Initialize storage configuration (includes auth listener setup)
        initializeStorageConfig();

        // Initialize storage system
        await initializeStorage();

        console.log("✅ App initialization complete!");
      } catch (error) {
        console.error("❌ App initialization failed:", error);
      }
    };

    initializeApp();

    // Demonstrate auth methods when app loads (for development/testing)
    setTimeout(() => {
      console.log("🎯 Hoppscotch Clone - Authentication System Loaded!");
      console.log("📚 Available authentication methods:");
      console.log("   - Basic Auth");
      console.log(
        "   - OAuth 2.0 (Authorization Code, Client Credentials, Password, Implicit)"
      );
      console.log("🔧 To test auth methods, open Developer Console and run:");
      console.log("   window.authTesting.demonstrateAuthMethods()");

      // Optionally run the demonstration automatically
      // demonstrateAuthMethods();
    }, 1000);
  }, [initializeStorage, checkAvailability, initializeStorageConfig]);

  return (
    <Router>
      <div className="flex flex-col h-screen bg-primary text-white overflow-hidden">
        {/* Navbar takes full width at the top */}
        <Navbar />

        {/* Main content area with sidebar and content */}
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />

          {/* Main content panel */}
          <div className="flex-1 overflow-hidden">
            <Routes>
              <Route path="/" element={<RestPanel />} />
              <Route path="/rest" element={<Navigate to="/" />} />
              <Route path="/graphql" element={<GraphQLPanel />} />
              <Route path="/realtime" element={<RealTimePanel />} />
              <Route path="/settings" element={<SettingsPanel />} />
            </Routes>
          </div>
        </div>

        {/* Footer takes full width at the bottom */}
        <Footer />

        {/* Global Authentication Modal */}
        <AuthModal />
      </div>
    </Router>
  );
}

export default App;
