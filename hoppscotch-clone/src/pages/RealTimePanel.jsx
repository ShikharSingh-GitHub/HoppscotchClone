import { closeBrackets } from "@codemirror/autocomplete";
import { defaultKeymap } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { bracketMatching, foldGutter } from "@codemirror/language";
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView, keymap, lineNumbers } from "@codemirror/view";
import Tippy from "@tippyjs/react";
import { createTheme } from "@uiw/codemirror-themes";
import CodeMirror from "@uiw/react-codemirror";
import {
  ChevronDown,
  FileUp,
  Layers,
  Plus,
  Send,
  Settings,
  Trash,
} from "lucide-react";
import { useRef, useState } from "react";
import KeyboardShortcuts from "../components/KeyboardShortcuts/KeyboardShortcuts";
import useRequestStore from "../store/store";

function RealTimePanel() {
  const [activeRealTimeTab, setActiveRealTimeTab] = useState("WebSocket");
  const [activeWebSocketTab, setActiveWebSocketTab] = useState("Communication");
  const [messageType, setMessageType] = useState("JSON");
  const [clearInput, setClearInput] = useState(false);
  const [topHeight, setTopHeight] = useState(60); // Add vertical drag state
  const [realTimeUrl, setRealTimeUrl] = useState({
    WebSocket: "wss://echo.hoppscotch.io",
    SSE: "https://sse.hoppscotch.io",
    SocketIO: "https://socketio.hoppscotch.io",
    MQTT: "mqtt://broker.hoppscotch.io",
  });

  const verticalContainerRef = useRef(null); // Add ref for vertical container
  const isVerticalResizing = useRef(false); // Add vertical resizing state

  const MIN_HEIGHT = 30; // Minimum height for top section
  const MAX_HEIGHT = 80; // Maximum height for top section

  const { requested } = useRequestStore();

  // Vertical resizing functions
  const startVerticalResizing = () => {
    isVerticalResizing.current = true;
    document.addEventListener("mousemove", handleVerticalResize);
    document.addEventListener("mouseup", stopVerticalResizing);
  };

  const handleVerticalResize = (e) => {
    if (!isVerticalResizing.current || !verticalContainerRef.current) return;
    const containerRect = verticalContainerRef.current.getBoundingClientRect();
    const containerHeight = containerRect.height;
    let newTopHeight =
      ((e.clientY - containerRect.top) / containerHeight) * 100;
    if (newTopHeight < MIN_HEIGHT) newTopHeight = MIN_HEIGHT;
    if (newTopHeight > MAX_HEIGHT) newTopHeight = MAX_HEIGHT;
    setTopHeight(newTopHeight);
  };

  const stopVerticalResizing = () => {
    isVerticalResizing.current = false;
    document.removeEventListener("mousemove", handleVerticalResize);
    document.removeEventListener("mouseup", stopVerticalResizing);
  };

  const realTimeTabs = [
    {
      id: "WebSocket",
      name: "WebSocket",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="none"
          viewBox="0 0 16 16"
          className="svg-icons mr-2">
          <path
            fill="currentColor"
            d="M1 2h4.257a2.5 2.5 0 0 1 1.768.732L9.293 5 5 9.293 3.732 8.025A2.5 2.5 0 0 1 3 6.257V4H2v2.257a3.5 3.5 0 0 0 1.025 2.475L5 10.707l1.25-1.25 2.396 2.397.708-.708L6.957 8.75 8.75 6.957l2.396 2.397.708-.708L9.457 6.25 10.707 5 7.732 2.025A3.5 3.5 0 0 0 5.257 1H1v1ZM10.646 2.354l2.622 2.62A2.5 2.5 0 0 1 14 6.744V12h1V6.743a3.5 3.5 0 0 0-1.025-2.475l-2.621-2.622-.707.708ZM4.268 13.975l-2.622-2.621.708-.708 2.62 2.622A2.5 2.5 0 0 0 6.744 14H15v1H6.743a3.5 3.5 0 0 1-2.475-1.025Z"
          />
        </svg>
      ),
    },
    {
      id: "SSE",
      name: "SSE",
      icon: (
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          className="svg-icons mr-2">
          <path
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 10a7.31 7.31 0 0 0 10 10Zm5 5l3-3m5 1a6 6 0 0 0-6-6m10 6A10 10 0 0 0 11 3"
          />
        </svg>
      ),
    },
    {
      id: "SocketIO",
      name: "Socket.IO",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="none"
          viewBox="0 0 16 16"
          className="svg-icons mr-2">
          <path
            fill="currentColor"
            fillRule="evenodd"
            d="M9.277 2.084a.5.5 0 0 1 .185.607l-2.269 5.5a.5.5 0 0 1-.462.309H3.5a.5.5 0 0 1-.354-.854l5.5-5.5a.5.5 0 0 1 .631-.062ZM4.707 7.5h1.69l1.186-2.875L4.707 7.5Zm2.016 6.416a.5.5 0 0 1-.185-.607l2.269-5.5a.5.5 0 0 1 .462-.309H12.5a.5.5 0 0 1 .354.854l-5.5 5.5a.5.5 0 0 1-.631.062Zm4.57-5.416h-1.69l-1.186 2.875L11.293 8.5Z"
            clipRule="evenodd"
          />
          <path
            fill="currentColor"
            fillRule="evenodd"
            d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0Zm-1 0A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      id: "MQTT",
      name: "MQTT",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="none"
          viewBox="0 0 16 16"
          className="svg-icons mr-2">
          <path
            fill="currentColor"
            fillRule="evenodd"
            d="M10.133 1h4.409a.5.5 0 0 1 .5.5v4.422c0 .026-.035.033-.045.01l-.048-.112a9.095 9.095 0 0 0-4.825-4.776c-.023-.01-.016-.044.01-.044Zm-8.588.275h-.5v1h.5c7.027 0 12.229 5.199 12.229 12.226v.5h1v-.5c0-7.58-5.65-13.226-13.229-13.226Zm.034 4.22h-.5v1h.5c2.361 0 4.348.837 5.744 2.238 1.395 1.401 2.227 3.395 2.227 5.758v.5h1v-.5c0-2.604-.921-4.859-2.52-6.463-1.596-1.605-3.845-2.532-6.45-2.532Zm-.528 8.996v-4.423c0-.041.033-.074.074-.074a4.923 4.923 0 0 1 4.923 4.922.074.074 0 0 1-.074.074H1.551a.5.5 0 0 1-.5-.5Z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  ];

  const webSocketTabs = [
    { id: "Communication", name: "Communication" },
    { id: "Protocols", name: "Protocols" },
  ];

  const myTheme = createTheme({
    theme: "dark",
    settings: {
      background: "#181818",
      backgroundImage: "",
      foreground: "#ffffff",
      caret: "#ffffff",
      selection: "#264f78",
      selectionMatch: "#264f78",
      lineHighlight: "#2a2a2a",
      gutterBackground: "#1e1e1e",
      gutterForeground: "#858585",
      gutterBorder: "#2a2a2a",
    },
    styles: [
      { tag: "keyword", color: "#C586C0" },
      { tag: "string", color: "#CE9178" },
      { tag: "number", color: "#B5CEA8" },
      { tag: "boolean", color: "#569CD6" },
      { tag: "null", color: "#569CD6" },
      { tag: "propertyName", color: "#9CDCFE" },
      { tag: "operator", color: "#D4D4D4" },
      { tag: "punctuation", color: "#D4D4D4" },
      { tag: "bracket", color: "#FFD700" },
    ],
  });

  const extensions = [
    json(),
    lineNumbers(),
    foldGutter(),
    bracketMatching(),
    closeBrackets(),
    highlightSelectionMatches(),
    keymap.of([...defaultKeymap, ...searchKeymap]),
    EditorView.theme({
      "&": {
        fontSize: "12px",
      },
      ".cm-content": {
        padding: "12px",
        minHeight: "200px",
      },
      ".cm-editor": {
        borderRadius: "0px",
      },
      ".cm-focused": {
        outline: "none",
      },
    }),
  ];

  const messageTypes = ["JSON", "Text", "XML", "HTML"];

  return (
    <div className="w-full h-full flex flex-col" ref={verticalContainerRef}>
      {/* Top Section - Main Content */}
      <div
        style={{ height: `${topHeight}%` }}
        className="overflow-hidden flex flex-col">
        {/* 1. Protocol Tabs (WebSocket, SSE, Socket.IO, MQTT) */}
        <div className="tabs relative border-zinc-800/80 border-b sticky overflow-x-auto flex-shrink-0 bg-primary top-0 z-10">
          <div className="flex flex-1">
            <div className="flex flex-1 justify-between">
              <div className="flex flex-1">
                {realTimeTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveRealTimeTab(tab.id)}
                    className={`tab inline-flex items-center px-4 py-3 font-semibold text-xs transition-colors border-b-2 ${
                      activeRealTimeTab === tab.id
                        ? "border-btn text-white bg-zinc-800/30"
                        : "border-transparent text-zinc-400 hover:text-white hover:bg-zinc-800/20"
                    }`}
                    aria-label={tab.name}
                    role="button">
                    {tab.icon}
                    <span>{tab.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 2. URL Input + Connect Button */}
        <div className="lg:px-4 px-2 py-3">
          <div className="flex h-9 gap-x-2">
            <div className="w-[85%] grid bg-search-bg-hover rounded-sm">
              <div className="w-full">
                <input
                  type="text"
                  className="lg:h-full h-9 w-full text-xs font-medium ps-5 focus:outline-none rounded placeholder:text-[11px] placeholder:text-zinc-500"
                  placeholder="Enter URL"
                  value={realTimeUrl[activeRealTimeTab] || ""}
                  onChange={(e) =>
                    setRealTimeUrl((prev) => ({
                      ...prev,
                      [activeRealTimeTab]: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="w-[15%] flex lg:mt-0 mt-2 lg:h-full h-8 justify-between items-center">
              <button
                onClick={() => requested()}
                className="px-4 font-semibold text-center text-xs bg-btn hover:bg-btn-hover w-full h-full rounded-sm">
                Connect
              </button>
            </div>
          </div>
        </div>

        {/* 3. Sub-tabs (only for WebSocket) */}
        {activeRealTimeTab === "WebSocket" && (
          <div className="tabs relative border-zinc-800/80 border-b sticky overflow-x-auto flex-shrink-0 bg-primary z-10">
            <div className="flex flex-1">
              <div className="flex flex-1 justify-between">
                <div className="flex flex-1">
                  {webSocketTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveWebSocketTab(tab.id)}
                      className={`tab inline-flex items-center px-4 py-2 font-semibold text-xs transition-colors border-b-2 ${
                        activeWebSocketTab === tab.id
                          ? "border-btn text-white bg-zinc-800/30"
                          : "border-transparent text-zinc-400 hover:text-white hover:bg-zinc-800/20"
                      }`}
                      aria-label={tab.name}
                      role="button">
                      <span>{tab.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. Content Area */}
        <div className="flex-1 overflow-hidden">
          {activeRealTimeTab === "WebSocket" && (
            <div className="flex h-full flex-1 flex-nowrap flex-col">
              <div className="contents h-full w-full">
                <div className="flex flex-1 flex-col">
                  <div className="flex flex-1 flex-col">
                    {activeWebSocketTab === "Communication" && (
                      <>
                        {/* Message Header */}
                        <div className="sticky z-10 flex flex-shrink-0 items-center justify-between overflow-x-auto border-b border-zinc-800/80 bg-primary pl-4">
                          <span className="flex items-center">
                            <label className="truncate font-semibold text-zinc-500 text-xs">
                              Message
                            </label>

                            {/* Message Type Dropdown */}
                            <div className="relative ml-2">
                              <Tippy
                                content={
                                  <div className="flex flex-col focus:outline-none bg-zinc-800 border border-zinc-700 rounded-md shadow-xl py-1 min-w-[120px]">
                                    {messageTypes.map((type) => (
                                      <button
                                        key={type}
                                        onClick={() => setMessageType(type)}
                                        role="menuitem"
                                        className="inline-flex items-center flex-shrink-0 px-4 py-2 transition hover:bg-zinc-700 focus:outline-none focus-visible:bg-zinc-700 flex-1 text-left rounded-none">
                                        <div className="inline-flex items-start flex-1 truncate">
                                          <div className="font-semibold truncate text-zinc-300 text-xs hover:text-white">
                                            {type}
                                          </div>
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                }
                                interactive={true}
                                trigger="click"
                                placement="bottom-start"
                                animation="scale-subtle"
                                appendTo={() => document.body}>
                                <button
                                  className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-zinc-400 hover:text-white rounded px-4 py-2 ml-2 rounded-none pr-8 relative"
                                  tabIndex="0">
                                  <span className="inline-flex items-center justify-center whitespace-nowrap">
                                    <div className="truncate max-w-[8rem] text-[11px]">
                                      {messageType}
                                    </div>
                                  </span>
                                  <ChevronDown
                                    size={12}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-zinc-500 pointer-events-none"
                                  />
                                </button>
                              </Tippy>
                            </div>
                          </span>

                          {/* Message Toolbar */}
                          <div className="flex">
                            {/* Send Button */}
                            <button
                              aria-label="Send Message"
                              role="button"
                              className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none rounded px-4 py-2 opacity-75 cursor-not-allowed !hover:text-accentDark rounded-none !text-accent"
                              disabled
                              tabIndex="0">
                              <span className="inline-flex items-center justify-center whitespace-nowrap">
                                <Send size={16} className="mr-2" />
                                <div className="truncate max-w-[8rem] text-xs">
                                  Send
                                </div>
                              </span>
                            </button>

                            {/* Clear Input Checkbox */}
                            <div
                              className="group inline-flex cursor-pointer flex-nowrap items-center justify-center transition hover:text-secondaryDark px-2"
                              role="checkbox"
                              aria-checked={clearInput}>
                              <input
                                id="checkbox-564310"
                                type="checkbox"
                                name="checkbox"
                                className="checkbox"
                                checked={clearInput}
                                onChange={(e) =>
                                  setClearInput(e.target.checked)
                                }
                              />
                              <label
                                htmlFor="checkbox-564310"
                                className="cursor-pointer truncate pl-2 align-middle font-semibold text-xs">
                                Clear input
                              </label>
                            </div>

                            {/* Help Link */}
                            <a
                              href="https://docs.hoppscotch.io/documentation/features/realtime-api-testing"
                              target="_blank"
                              rel="noopener"
                              role="button"
                              className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-zinc-400 hover:text-white p-2"
                              tabIndex="0">
                              <span className="inline-flex items-center justify-center whitespace-nowrap">
                                <svg
                                  viewBox="0 0 24 24"
                                  width="16"
                                  height="16"
                                  className="svg-icons">
                                  <g
                                    fill="none"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3m.08 4h.01"></path>
                                  </g>
                                </svg>
                              </span>
                            </a>

                            {/* Clear Button */}
                            <button
                              aria-label="Clear"
                              role="button"
                              className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-zinc-400 hover:text-white p-2"
                              tabIndex="0">
                              <span className="inline-flex items-center justify-center whitespace-nowrap">
                                <Trash size={16} />
                              </span>
                            </button>

                            {/* Prettify Button */}
                            <button
                              aria-label="Prettify"
                              role="button"
                              className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-zinc-400 hover:text-white p-2 !text-accent"
                              tabIndex="0">
                              <span className="inline-flex items-center justify-center whitespace-nowrap">
                                <svg
                                  viewBox="0 0 24 24"
                                  width="16"
                                  height="16"
                                  className="svg-icons">
                                  <g
                                    fill="none"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2">
                                    <path d="M3 6h18M3 12h15a3 3 0 1 1 0 6h-4"></path>
                                    <path d="m16 16l-2 2l2 2M3 18h7"></path>
                                  </g>
                                </svg>
                              </span>
                            </button>

                            {/* Settings Button */}
                            <button
                              aria-label="Settings"
                              role="button"
                              className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-zinc-400 hover:text-white p-2"
                              tabIndex="0">
                              <span className="inline-flex items-center justify-center whitespace-nowrap">
                                <Settings size={16} />
                              </span>
                            </button>

                            {/* File Upload */}
                            <label htmlFor="payload">
                              <button
                                aria-label="Upload File"
                                role="button"
                                className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-zinc-400 hover:text-white p-2"
                                tabIndex="0">
                                <span className="inline-flex items-center justify-center whitespace-nowrap">
                                  <FileUp size={16} />
                                </span>
                              </button>
                            </label>
                            <input
                              className="hidden"
                              name="payload"
                              type="file"
                              id="payload"
                            />
                          </div>
                        </div>

                        {/* Message Editor */}
                        <div className="h-full relative overflow-auto flex flex-col flex-1">
                          <div className="absolute inset-0 ph-no-capture">
                            <CodeMirror
                              value=""
                              placeholder="Message"
                              theme={myTheme}
                              extensions={extensions}
                              className="h-full"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {activeWebSocketTab === "Protocols" && (
                      <>
                        {/* Protocols Header */}
                        <div className="sticky z-10 flex flex-shrink-0 items-center justify-between overflow-x-auto border-b border-zinc-800/80 bg-primary pl-4">
                          <label className="truncate font-semibold text-zinc-500 text-xs">
                            Protocols
                          </label>
                          <div className="flex">
                            {/* Clear Button */}
                            <button
                              aria-label="Clear All"
                              role="button"
                              className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-zinc-400 hover:text-white p-2"
                              tabIndex="0">
                              <span className="inline-flex items-center justify-center whitespace-nowrap">
                                <Trash size={16} />
                              </span>
                            </button>

                            {/* Add Button */}
                            <button
                              aria-label="Add Protocol"
                              role="button"
                              className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-zinc-400 hover:text-white p-2"
                              tabIndex="0">
                              <span className="inline-flex items-center justify-center whitespace-nowrap">
                                <Plus size={16} />
                              </span>
                            </button>
                          </div>
                        </div>

                        {/* Empty Protocols State */}
                        <div className="flex flex-col items-center justify-center p-4 flex-1">
                          <div className="w-16 h-16 mb-4 bg-zinc-700 rounded-lg flex items-center justify-center">
                            <Layers size={32} className="text-zinc-500" />
                          </div>
                          <span className="max-w-sm mt-2 text-center whitespace-normal text-xs text-zinc-400">
                            Protocols are empty
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other RealTime Tabs Content */}
          {activeRealTimeTab === "SSE" && (
            <div className="flex flex-col items-center justify-center p-8 flex-1 min-h-[300px]">
              <div className="w-16 h-16 mb-4 bg-zinc-700 rounded-lg flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  width="32"
                  height="32"
                  className="text-zinc-500">
                  <path
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 10a7.31 7.31 0 0 0 10 10Zm5 5l3-3m5 1a6 6 0 0 0-6-6m10 6A10 10 0 0 0 11 3"
                  />
                </svg>
              </div>
              <span className="max-w-sm text-center whitespace-normal text-sm font-semibold text-white mb-2">
                Server-Sent Events
              </span>
              <span className="max-w-sm text-center whitespace-normal text-xs text-zinc-400">
                Configure your SSE connection here
              </span>
            </div>
          )}

          {activeRealTimeTab === "SocketIO" && (
            <div className="flex flex-col items-center justify-center p-8 flex-1 min-h-[300px]">
              <div className="w-16 h-16 mb-4 bg-zinc-700 rounded-lg flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  fill="none"
                  viewBox="0 0 16 16"
                  className="text-zinc-500">
                  <path
                    fill="currentColor"
                    fillRule="evenodd"
                    d="M9.277 2.084a.5.5 0 0 1 .185.607l-2.269 5.5a.5.5 0 0 1-.462.309H3.5a.5.5 0 0 1-.354-.854l5.5-5.5a.5.5 0 0 1 .631-.062ZM4.707 7.5h1.69l1.186-2.875L4.707 7.5Zm2.016 6.416a.5.5 0 0 1-.185-.607l2.269-5.5a.5.5 0 0 1 .462-.309H12.5a.5.5 0 0 1 .354.854l-5.5 5.5a.5.5 0 0 1-.631.062Zm4.57-5.416h-1.69l-1.186 2.875L11.293 8.5Z"
                    clipRule="evenodd"
                  />
                  <path
                    fill="currentColor"
                    fillRule="evenodd"
                    d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0Zm-1 0A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="max-w-sm text-center whitespace-normal text-sm font-semibold text-white mb-2">
                Socket.IO
              </span>
              <span className="max-w-sm text-center whitespace-normal text-xs text-zinc-400">
                Configure your Socket.IO connection here
              </span>
            </div>
          )}

          {activeRealTimeTab === "MQTT" && (
            <div className="flex flex-col items-center justify-center p-8 flex-1 min-h-[300px]">
              <div className="w-16 h-16 mb-4 bg-zinc-700 rounded-lg flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  fill="none"
                  viewBox="0 0 16 16"
                  className="text-zinc-500">
                  <path
                    fill="currentColor"
                    fillRule="evenodd"
                    d="M10.133 1h4.409a.5.5 0 0 1 .5.5v4.422c0 .026-.035.033-.045.01l-.048-.112a9.095 9.095 0 0 0-4.825-4.776c-.023-.01-.016-.044.01-.044Zm-8.588.275h-.5v1h.5c7.027 0 12.229 5.199 12.229 12.226v.5h1v-.5c0-7.58-5.65-13.226-13.229-13.226Zm.034 4.22h-.5v1h.5c2.361 0 4.348.837 5.744 2.238 1.395 1.401 2.227 3.395 2.227 5.758v.5h1v-.5c0-2.604-.921-4.859-2.52-6.463-1.596-1.605-3.845-2.532-6.45-2.532Zm-.528 8.996v-4.423c0-.041.033-.074.074-.074a4.923 4.923 0 0 1 4.923 4.922.074.074 0 0 1-.074.074H1.551a.5.5 0 0 1-.5-.5Z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="max-w-sm text-center whitespace-normal text-sm font-semibold text-white mb-2">
                MQTT
              </span>
              <span className="max-w-sm text-center whitespace-normal text-xs text-zinc-400">
                Configure your MQTT connection here
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Vertical Drag Handle */}
      <div
        onMouseDown={startVerticalResizing}
        className="hover:h-[10px] h-[3px] bg-zinc-800/60 cursor-row-resize hover:bg-btn-hover transition-colors flex-shrink-0"
      />

      {/* Bottom Section - Keyboard Shortcuts */}
      <div
        style={{ height: `${100 - topHeight}%` }}
        className="overflow-hidden">
        <div className="h-full p-4">
          <KeyboardShortcuts docUrl="https://docs.hoppscotch.io/documentation/features/realtime-api-testing" />
        </div>
      </div>
    </div>
  );
}

export default RealTimePanel;
