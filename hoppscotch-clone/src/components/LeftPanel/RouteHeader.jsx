import Tippy from "@tippyjs/react";
import {
  Check,
  ChevronDown,
  Eye,
  Layers,
  Plus,
  Save,
  Search,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTabContext } from "../../contexts/TabContext";
import { makeApiRequest } from "../../services/requestService";
import useHistoryStore from "../../store/historyStore";
import useRequestStore from "../../store/store";
import { useAuthGuard } from "../Auth/AuthGuard";
import IconButton from "../IconButton/IconButton";
import RequestSection from "./RequestSection";

const methods = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
  "OPTIONS",
  "CONNECT",
  "TRACE",
  "CUSTOM",
];

const RouteHeader = ({ onRequestComplete }) => {
  const {
    tabs,
    activeTabId,
    activeTab,
    addTab,
    removeTab,
    updateTab,
    restoreTab,
    setActiveTabId,
  } = useTabContext();

  const [isRequestInProgress, setIsRequestInProgress] = useState(false);
  const [seeAllMethods, setSeeAllMethod] = useState(false);
  const [selectedEnvironment, setSelectedEnvironment] =
    useState("No environment");
  const [showEnvironmentModal, setShowEnvironmentModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { addHistoryEntry } = useHistoryStore();
  const { requested, setResponseData } = useRequestStore();
  const { requireAuth, isAuthenticated } = useAuthGuard();

  // Register tab restoration function
  useEffect(() => {
    console.log("Registering tab restoration function");
    window.restoreTab = restoreTab;

    return () => {
      delete window.restoreTab;
    };
  }, [restoreTab]);

  const handleSendRequest = async () => {
    if (isRequestInProgress) return;

    // Check authentication before sending request
    const authSuccess = requireAuth(() => {
      console.log("🔐 Authentication successful, proceeding with request");
    });

    if (!authSuccess) {
      console.log("🚫 Authentication required, blocking request");
      alert("Please authenticate first to send requests");
      return;
    }

    try {
      setIsRequestInProgress(true);

      const requestData = {
        method: activeTab.method,
        url: activeTab.url,
        headers: activeTab.headers || {},
        body: activeTab.body || null,
        auth: activeTab.auth || { authType: "none", authActive: true }, // Include auth data
      };

      console.log("🚀 Sending request:", requestData);
      console.log("📝 Request details:");
      console.log("  - Method:", requestData.method);
      console.log("  - URL:", requestData.url);
      console.log("  - Headers:", requestData.headers);
      console.log("  - Body:", requestData.body);
      console.log("  - Body type:", typeof requestData.body);
      console.log("  - Auth:", requestData.auth);

      const startTime = Date.now();
      const response = await makeApiRequest(requestData);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      console.log("✅ Request completed:", response);

      if (!response || response.error) {
        console.error(
          "❌ Request failed:",
          response?.statusText || "Unknown error"
        );
        return;
      }

      // Store response data in the store for the Response component
      setResponseData(response);

      requested();

      // Ensure headers are properly formatted before adding to history
      const historyData = {
        method: requestData.method,
        url: requestData.url,
        headers: requestData.headers || {}, // Ensure it's an object
        body: requestData.body || null,
        auth: requestData.auth || { authType: "none", authActive: true }, // Include auth in history
        responseStatus: response?.status || 0,
        responseBody:
          typeof response?.data === "string"
            ? response.data
            : JSON.stringify(response?.data || ""),
        responseHeaders: response?.headers || {}, // Ensure it's an object
        responseTime: responseTime,
        requestType: "REST",
        tabId: activeTab.id,
        tabTitle: activeTab.title,
      };

      console.log("Adding to history with proper headers:", historyData);

      // Add to history with tab info - ONLY ONCE
      await addHistoryEntry(historyData);

      console.log("Added to history successfully");

      // Don't call onRequestComplete since we're handling history in the request itself
      // This prevents duplicate history entries
    } catch (error) {
      console.error("Error sending request:", error);
    } finally {
      setIsRequestInProgress(false);
    }
  };

  const updateMethod = (method) => {
    updateTab(activeTabId, { method });
    setSeeAllMethod(false);
  };

  const updateURL = (url) => {
    updateTab(activeTabId, { url });
  };

  const getMethodColor = (method) => {
    const colors = {
      GET: "text-green-500",
      POST: "text-orange-500",
      PUT: "text-blue-500",
      PATCH: "text-yellow-500",
      DELETE: "text-red-500",
      HEAD: "text-purple-500",
      OPTIONS: "text-pink-500",
      CONNECT: "text-indigo-500",
      TRACE: "text-teal-500",
      CUSTOM: "text-gray-500",
    };
    return colors[method] || "text-gray-500";
  };

  const EnvironmentModal = () => (
    <div className="w-full max-w-sm bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl">
      <div className="p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={14} className="text-zinc-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-600 rounded text-sm text-white placeholder-zinc-400 focus:outline-none focus:border-btn"
            placeholder="Search environments"
          />
        </div>
      </div>

      <div className="px-4 py-3 border-b border-zinc-700">
        <button
          onClick={() => {
            setSelectedEnvironment("No environment");
            setShowEnvironmentModal(false);
          }}
          className="w-full flex items-center justify-between px-4 py-3 rounded hover:bg-search-bg-hover transition-colors">
          <div className="flex items-center">
            <span className="text-sm font-semibold text-white">
              No environment
            </span>
          </div>
          {selectedEnvironment === "No environment" && (
            <Check size={14} className="text-btn" />
          )}
        </button>
      </div>

      <div className="border-t border-zinc-700">
        <div className="flex">
          <button className="flex-1 px-4 py-3 text-sm font-semibold text-white border-b-2 border-btn bg-zinc-900">
            My environments
          </button>
          <button className="flex-1 px-4 py-3 text-sm font-semibold text-zinc-400 hover:text-white">
            Team environments
          </button>
        </div>
      </div>

      <div className="flex-1 p-4">
        <div className="text-center text-zinc-400 text-sm">
          No environments found
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* TABS SECTION */}
      <div className="bg-search-bg-hover h-[46px] pe-3">
        <div className="grid grid-cols-12">
          <div className="flex items-center h-[46px] relative lg:col-span-7 col-span-8">
            <div className="flex items-center h-full overflow-x-auto">
              {tabs.map((tab) => (
                <div
                  key={tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  className={`flex items-center justify-between px-4 space-x-3 w-44 h-full text-center cursor-pointer ${
                    activeTabId === tab.id
                      ? "bg-primary border-t-[3px] border-btn text-white"
                      : "text-zinc-400 hover:bg-search-bg"
                  } group`}>
                  <p
                    className={`text-[10px] font-semibold ${getMethodColor(
                      tab.method
                    )}`}>
                    {tab.method}
                  </p>
                  <p className="font-semibold text-[11px] flex-1 truncate">
                    {tab.title}
                  </p>

                  {tabs.length > 1 ? (
                    <Tippy
                      content={
                        <span className="text-[10px] font-semibold">Close</span>
                      }
                      placement="top"
                      theme="light">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTab(tab.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <X size={12} />
                      </button>
                    </Tippy>
                  ) : (
                    <div className="w-3"></div>
                  )}
                </div>
              ))}
            </div>

            <button onClick={addTab} className="ms-3 p-1">
              <Plus size={14} />
            </button>
          </div>

          <div className="col-span-5 flex justify-end lg:space-x-2 space-x-1 items-center h-[46px] pr-2">
            <Tippy
              content={<EnvironmentModal />}
              visible={showEnvironmentModal}
              onClickOutside={() => setShowEnvironmentModal(false)}
              placement="bottom"
              theme="popover"
              interactive={true}
              arrow={true}
              maxWidth={350}>
              <button
                onClick={() => setShowEnvironmentModal(!showEnvironmentModal)}
                className="flex items-center space-x-2 px-3 py-2 rounded hover:bg-search-bg transition-colors">
                <div className="flex space-x-2 items-center">
                  <Layers size={13} className="text-zinc-400" />
                  <span className="text-[12px] font-semibold lg:flex hidden text-zinc-300">
                    {selectedEnvironment}
                  </span>
                </div>
                <ChevronDown
                  size={12}
                  className={`text-zinc-400 transition-transform ${
                    showEnvironmentModal ? "rotate-180" : ""
                  }`}
                />
              </button>
            </Tippy>

            <IconButton name="Environment Quick Peek" direction="top">
              <Eye size={13} />
            </IconButton>
          </div>
        </div>
      </div>

      {/* METHODS and URL SECTION */}
      <div className="lg:px-4 px-2 py-3">
        <div className="grid lg:grid-cols-9 grid-cols-2 h-9 gap-x-2">
          <div className="lg:col-span-7 col-span-3 grid grid-cols-7 bg-search-bg-hover rounded">
            <div className="relative lg:col-span-1 col-span-2 lg:ps-4 ps-2">
              <div
                onClick={() => setSeeAllMethod(!seeAllMethods)}
                className="cursor-pointer flex h-9 items-center justify-between">
                <button
                  className={`lg:text-xs text-[10px] font-semibold ${getMethodColor(
                    activeTab?.method || "GET"
                  )}`}>
                  {activeTab?.method || "GET"}
                </button>
                <ChevronDown size={12} />
              </div>

              {seeAllMethods && (
                <div className="absolute top-10 left-0 bg-search-bg-hover w-full rounded p-2 border border-search-bg z-30">
                  {methods.map((method) => (
                    <button
                      onClick={() => updateMethod(method)}
                      key={method}
                      className={`flex text-[10px] mb-1 px-3 py-[5px] rounded font-semibold hover:bg-search-bg w-full ${getMethodColor(
                        method
                      )}`}>
                      {method}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-6 col-span-5">
              <input
                type="text"
                className="lg:h-9 h-9 w-full text-xs font-medium ps-4 focus:outline-none rounded placeholder:text-[11px] placeholder:text-zinc-500"
                placeholder="Enter a URL or paste a cURL command"
                value={activeTab?.url || ""}
                onChange={(e) => updateURL(e.target.value)}
              />
            </div>
          </div>

          <div className="lg:col-span-1 col-span-2 flex lg:mt-0 mt-2 lg:h-9 h-8 justify-between items-center">
            <Tippy
              content={
                <span className="text-[10px] font-semibold">
                  {!isAuthenticated ? "Login Required" : "Send"}{" "}
                  <span className="bg-zinc-500 text-gray-300 px-1 rounded py[2px]">
                    ctrl
                  </span>
                </span>
              }
              placement="top"
              theme="light"
              delay={300}>
              <button
                onClick={handleSendRequest}
                disabled={isRequestInProgress}
                className={`px-3 font-semibold text-center text-xs w-full h-full rounded-l transition-colors ${
                  isRequestInProgress
                    ? "bg-gray-600 cursor-not-allowed"
                    : !isAuthenticated
                    ? "bg-orange-600 hover:bg-orange-700"
                    : "bg-btn hover:bg-btn-hover"
                }`}>
                {isRequestInProgress
                  ? "Sending..."
                  : !isAuthenticated
                  ? "Login Required"
                  : "Send"}
              </button>
            </Tippy>

            <Tippy
              content={
                <span className="text-[10px] font-semibold">Options</span>
              }
              placement="top"
              theme="light">
              <button
                className={`px-2 h-full rounded-r transition-colors ${
                  isRequestInProgress
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-btn hover:bg-btn-hover"
                }`}
                disabled={isRequestInProgress}>
                <ChevronDown size={14} />
              </button>
            </Tippy>
          </div>

          <div className="col-span-1 flex lg:mt-0 mt-2 lg:h-9 h-8 items-center justify-between bg-search-bg-hover rounded">
            <Tippy
              content={
                <span className="text-[10px] font-semibold">
                  Save{" "}
                  <span className="bg-zinc-500 text-gray-300 px-1 rounded py[2px]">
                    ctrl
                  </span>{" "}
                  <span className="bg-zinc-500 text-gray-300 px-1 rounded py[2px]">
                    s
                  </span>
                </span>
              }
              placement="top"
              theme="light"
              delay={300}>
              <button className="flex h-full items-center justify-between px-3 rounded-l text-xs font-semibold text-zinc-400 hover:text-white hover:bg-search-bg">
                <Save size={14} />
                <span className="mx-1"></span>
                Save
              </button>
            </Tippy>

            <Tippy
              content={
                <span className="text-[10px] font-semibold">Options</span>
              }
              placement="top"
              theme="light">
              <button className="flex justify-center items-center text-zinc-400 hover:text-white hover:bg-search-bg rounded-r h-full w-full">
                <ChevronDown size={14} />
              </button>
            </Tippy>
          </div>
        </div>
      </div>

      {/* Request Section */}
      <div className="py-3">
        <RequestSection />
      </div>
    </>
  );
};

export default RouteHeader;
