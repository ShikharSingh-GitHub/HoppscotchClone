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

function App() {
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
