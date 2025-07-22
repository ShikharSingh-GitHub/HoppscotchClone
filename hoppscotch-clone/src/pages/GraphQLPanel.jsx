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
import { graphql } from "cm6-graphql";
import {
  BookOpen,
  Check,
  ChevronDown,
  Circle,
  CornerDownLeft,
  ExternalLink,
  Eye,
  Layers,
  Plus,
  Save,
  Trash,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import KeyboardShortcuts from "../components/KeyboardShortcuts/KeyboardShortcuts";
import QueryParameterComponent from "../components/LeftPanel/QueryParameter";
import GraphQLRightPanel from "../components/RightPanel/GraphQLRightPanel";
import useRequestStore from "../store/store";

function GraphQLPanel() {
  const [leftWidth, setLeftWidth] = useState(70);
  const [topHeight, setTopHeight] = useState(60);
  const containerRef = useRef(null);
  const verticalContainerRef = useRef(null);
  const isResizing = useRef(false);
  const isVerticalResizing = useRef(false);

  const MIN_WIDTH = 40;
  const MAX_WIDTH = 80;
  const MIN_HEIGHT = 30;
  const MAX_HEIGHT = 80;

  const startResizing = (e) => {
    e.preventDefault();
    e.stopPropagation();
    isResizing.current = true;
    document.addEventListener("mousemove", handleResize);
    document.addEventListener("mouseup", stopResizing);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const handleResize = (e) => {
    if (!isResizing.current || !containerRef.current) return;
    e.preventDefault();
    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    let newLeftWidth =
      ((e.clientX - containerRect.left) / containerWidth) * 100;
    if (newLeftWidth < MIN_WIDTH) newLeftWidth = MIN_WIDTH;
    if (newLeftWidth > MAX_WIDTH) newLeftWidth = MAX_WIDTH;
    setLeftWidth(newLeftWidth);
  };

  const stopResizing = () => {
    isResizing.current = false;
    document.removeEventListener("mousemove", handleResize);
    document.removeEventListener("mouseup", stopResizing);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  };

  const startVerticalResizing = (e) => {
    e.preventDefault();
    e.stopPropagation();
    isVerticalResizing.current = true;
    document.addEventListener("mousemove", handleVerticalResize);
    document.addEventListener("mouseup", stopVerticalResizing);
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
  };

  const handleVerticalResize = (e) => {
    if (!isVerticalResizing.current || !verticalContainerRef.current) return;
    e.preventDefault();
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
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  };

  const [history, setHistory] = useState([
    {
      id: 1,
      title: "Untitled",
      url: "https://echo.hoppscotch.io/graphql",
    },
  ]);

  const [activeTab, setActiveTab] = useState(1);
  const tabContainerRef = useRef(null);

  useEffect(() => {
    if (tabContainerRef.current) {
      tabContainerRef.current.scrollTo({
        left: tabContainerRef.current.scrollWidth,
        behavior: "smooth",
      });
    }
  }, [history]);

  const { requested } = useRequestStore();

  const addHistory = () => {
    const newId = history.length + 1;
    setHistory([
      ...history,
      {
        id: newId,
        title: "Untitled",
        url: "https://echo.hoppscotch.io/graphql",
      },
    ]);
    setActiveTab(newId);
  };

  const removeHistory = (id, index) => {
    setHistory(history.filter((h) => h.id !== id));
    setActiveTab(index > 1 ? index - 1 : 1);
  };

  const tabs = [
    { id: 1, name: "Query" },
    { id: 2, name: "Variables" },
    { id: 3, name: "Headers" },
    { id: 4, name: "Authorization" },
  ];

  const [tap, setTab] = useState("Query");

  const [queryContent, setQueryContent] = useState(`query Request {
  method
  url
  headers {
    key
    value
  }
}`);

  const [variablesContent, setVariablesContent] = useState(`{
  "id": "1"
}`);

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
      { tag: "name", color: "#9CDCFE" },
      { tag: "typeName", color: "#4EC9B0" },
      { tag: "fieldName", color: "#9CDCFE" },
      { tag: "argumentName", color: "#9CDCFE" },
      { tag: "variableName", color: "#4FC1FF" },
      { tag: "directiveName", color: "#DCDCAA" },
      { tag: "string", color: "#CE9178" },
      { tag: "number", color: "#B5CEA8" },
      { tag: "boolean", color: "#569CD6" },
      { tag: "null", color: "#569CD6" },
      { tag: "comment", color: "#6A9955" },
      { tag: "propertyName", color: "#9CDCFE" },
      { tag: "operator", color: "#D4D4D4" },
      { tag: "punctuation", color: "#D4D4D4" },
      { tag: "bracket", color: "#FFD700" },
      { tag: "brace", color: "#DA70D6" },
      { tag: "angleBracket", color: "#DA70D6" },
      { tag: "definition", color: "#DCDCAA" },
      { tag: "quote", color: "#CE9178" },
    ],
  });

  const graphqlExtensions = [
    graphql(),
    lineNumbers(),
    foldGutter(),
    bracketMatching(),
    closeBrackets(),
    highlightSelectionMatches(),
    keymap.of([...defaultKeymap, ...searchKeymap]),
    EditorView.theme({
      "&": { fontSize: "12px" },
      ".cm-content": { padding: "12px", minHeight: "250px" },
      ".cm-editor": { borderRadius: "0px" },
      ".cm-focused": { outline: "none" },
      ".cm-gutters": {
        backgroundColor: "#1e1e1e",
        borderRight: "1px solid #2a2a2a",
      },
      ".cm-lineNumbers": { color: "#858585", fontSize: "10px" },
      ".cm-activeLine": { backgroundColor: "#2a2a2a" },
      ".cm-selectionBackground": { backgroundColor: "#264f78 !important" },
      ".cm-keyword": { color: "#C586C0 !important", fontWeight: "bold" },
      ".cm-string": { color: "#CE9178 !important" },
      ".cm-number": { color: "#B5CEA8 !important" },
      ".cm-variableName": { color: "#4FC1FF !important" },
      ".cm-comment": { color: "#6A9955 !important", fontStyle: "italic" },
    }),
  ];

  const jsonExtensions = [
    json(),
    lineNumbers(),
    foldGutter(),
    bracketMatching(),
    closeBrackets(),
    highlightSelectionMatches(),
    keymap.of([...defaultKeymap, ...searchKeymap]),
    EditorView.theme({
      "&": { fontSize: "12px" },
      ".cm-content": { padding: "12px", minHeight: "150px" },
      ".cm-editor": { borderRadius: "0px" },
      ".cm-focused": { outline: "none" },
      ".cm-gutters": {
        backgroundColor: "#1e1e1e",
        borderRight: "1px solid #2a2a2a",
      },
      ".cm-lineNumbers": { color: "#858585", fontSize: "10px" },
      ".cm-activeLine": { backgroundColor: "#2a2a2a" },
      ".cm-selectionBackground": { backgroundColor: "#264f78 !important" },
      ".cm-property": { color: "#9CDCFE !important" },
      ".cm-string": { color: "#CE9178 !important" },
      ".cm-number": { color: "#B5CEA8 !important" },
      ".cm-keyword": { color: "#569CD6 !important" },
      ".cm-punctuation": { color: "#D4D4D4 !important" },
      ".cm-bracket": { color: "#FFD700 !important" },
    }),
  ];

  const [authType, setAuthType] = useState("Inherit");

  const authTypes = [
    { id: 1, name: "Inherit", isSelected: true },
    { id: 2, name: "None", isSelected: false },
    { id: 3, name: "Basic Auth", isSelected: false },
    { id: 4, name: "Bearer", isSelected: false },
    { id: 5, name: "OAuth 2.0", isSelected: false },
    { id: 6, name: "API Key", isSelected: false },
    { id: 7, name: "AWS Signature", isSelected: false },
  ];

  const [graphqlUrl, setGraphqlUrl] = useState(
    "https://echo.hoppscotch.io/graphql"
  );

  return (
    <div
      className="flex w-full h-full border-l border-gray-700/30"
      ref={containerRef}>
      {/* Left Panel with Vertical Split */}
      <div
        style={{ width: `${leftWidth}%` }}
        className="flex flex-col"
        ref={verticalContainerRef}>
        {/* Top Section - GraphQL Editor */}
        <div
          style={{ height: `${topHeight}%` }}
          className="overflow-hidden flex flex-col">
          {/* URL Input - Fixed height and alignment */}
          <div className="px-4 py-2">
            <div className="flex h-8 gap-x-2">
              <div className="w-[85%] grid bg-search-bg-hover rounded">
                <div className="w-full">
                  <input
                    type="text"
                    className="w-[85%] h-8 text-xs font-medium ps-4 focus:outline-none rounded placeholder:text-[11px] placeholder:text-zinc-500"
                    placeholder="Enter GraphQL endpoint URL"
                    value={graphqlUrl}
                    onChange={(e) => setGraphqlUrl(e.target.value)}
                  />
                </div>
              </div>
              <div className="w-[15%] flex items-center">
                <button
                  onClick={() => requested()}
                  className="px-3 font-semibold text-center text-xs bg-btn hover:bg-btn-hover w-full h-8 rounded">
                  Connect
                </button>
              </div>
            </div>
          </div>

          {/* Tabs - Fixed height and alignment */}
          <div className="bg-search-bg-hover h-10 px-3">
            <div className="w-full flex items-center h-10 relative">
              <div
                className="flex items-center h-full overflow-x-auto"
                ref={tabContainerRef}>
                {history.map((h, index) => (
                  <div
                    key={h.id}
                    onClick={() => setActiveTab(index + 1)}
                    className={`flex items-center justify-between px-4 space-x-3 min-w-[160px] h-full text-center cursor-pointer ${
                      activeTab === index + 1
                        ? "bg-primary border-t-2 border-btn text-white"
                        : "text-zinc-400 hover:bg-search-bg"
                    } group`}>
                    <p className="font-semibold text-[11px] truncate flex-1">
                      {h.title}
                    </p>
                    {history.length > 1 ? (
                      <Tippy
                        content={
                          <span className="text-[10px] font-semibold">
                            Close
                          </span>
                        }
                        placement="top"
                        theme="light">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeHistory(h.id, index + 1);
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
              <Tippy
                content={<span className="text-[10px] font-semibold">Add</span>}
                placement="top"
                theme="light"
                delay={300}>
                <button onClick={addHistory} className="ml-2 p-1">
                  <Plus size={14} />
                </button>
              </Tippy>
            </div>
          </div>

          {/* Sub Tabs - Fixed sizing and spacing */}
          <div className="flex px-4 space-x-6 py-2 border-b border-zinc-800/30">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.name)}
                className={`text-xs font-semibold hover:text-white transition-colors ${
                  tap === t.name
                    ? "text-white border-b-2 border-btn pb-2"
                    : "text-zinc-500 pb-2"
                }`}>
                {t.name}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {/* Query Tab */}
            {tap === "Query" && (
              <>
                <div className="flex items-center justify-between border-b border-zinc-800/80 bg-primary h-10 px-4">
                  <label className="text-xs font-semibold text-zinc-500">
                    Query
                  </label>

                  <div className="flex items-center">
                    {/* Request Button - Blue accent */}
                    <button
                      onClick={() => {
                        console.log("Executing GraphQL Query:", queryContent);
                        console.log("With Variables:", variablesContent);
                      }}
                      className="flex items-center px-3 py-1 text-xs font-semibold text-btn hover:text-btn-hover transition-colors">
                      <svg
                        viewBox="0 0 24 24"
                        width="15"
                        height="15"
                        className="mr-1">
                        <path
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="m6 3l14 9l-14 9z"></path>
                      </svg>
                      Request
                    </button>

                    {/* Save Button */}
                    <button
                      onClick={() => {
                        const queryData = {
                          query: queryContent,
                          variables: variablesContent,
                          timestamp: new Date().toISOString(),
                        };
                        localStorage.setItem(
                          "graphql_query",
                          JSON.stringify(queryData)
                        );
                        console.log("Query saved:", queryData);
                      }}
                      className="flex items-center px-3 py-1 text-xs font-semibold text-zinc-400 hover:text-white transition-colors">
                      <svg
                        viewBox="0 0 24 24"
                        width="15"
                        height="15"
                        className="mr-1">
                        <g
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2">
                          <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"></path>
                          <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7M7 3v4a1 1 0 0 0 1 1h7"></path>
                        </g>
                      </svg>
                      Save
                    </button>

                    {/* Help/Documentation Button */}
                    <a
                      href="https://docs.hoppscotch.io/documentation/features/graphql-api-testing"
                      target="_blank"
                      rel="noopener"
                      className="p-1 text-zinc-400 hover:text-white transition-colors">
                      <svg viewBox="0 0 24 24" width="15" height="15">
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
                    </a>

                    {/* Delete/Trash Button */}
                    <button
                      onClick={() => setQueryContent("")}
                      className="p-1 text-zinc-400 hover:text-white transition-colors">
                      <svg viewBox="0 0 24 24" width="15" height="15">
                        <path
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2m-6 5v6m4-6v6"></path>
                      </svg>
                    </button>

                    {/* Prettify/Format Button - Blue accent */}
                    <button
                      onClick={() => {
                        try {
                          // Simple GraphQL prettify - add proper spacing
                          const formatted = queryContent
                            .replace(/\{/g, " {\n  ")
                            .replace(/\}/g, "\n}")
                            .replace(/,/g, ",\n  ")
                            .replace(/\n\s*\n/g, "\n");
                          setQueryContent(formatted);
                        } catch (error) {
                          console.error("Failed to format:", error);
                        }
                      }}
                      className="p-1 text-btn hover:text-btn-hover transition-colors">
                      <svg viewBox="0 0 24 24" width="15" height="15">
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
                    </button>

                    {/* Wand/Magic Button */}
                    <button
                      onClick={() => {
                        console.log("Magic wand action");
                      }}
                      className="p-1 text-zinc-400 hover:text-white transition-colors">
                      <svg viewBox="0 0 24 24" width="15" height="15">
                        <path
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 4V2m0 14v-2M8 9h2m10 0h2m-4.2 2.8L19 13m-4-4h.01m2.79-2.8L19 5M3 21l9-9m.2-5.8L11 5"></path>
                      </svg>
                    </button>

                    {/* Copy Button */}
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(queryContent);
                          console.log("Query copied to clipboard");
                        } catch (error) {
                          console.error("Failed to copy:", error);
                        }
                      }}
                      className="p-1 text-zinc-400 hover:text-white transition-colors">
                      <svg viewBox="0 0 24 24" width="15" height="15">
                        <g
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2">
                          <rect
                            width="15"
                            height="15"
                            x="8"
                            y="8"
                            rx="2"
                            ry="2"></rect>
                          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                        </g>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="h-full overflow-y-auto">
                  <CodeMirror
                    value={queryContent}
                    onChange={(value) => setQueryContent(value)}
                    theme={myTheme}
                    extensions={graphqlExtensions}
                    placeholder="Enter your GraphQL query here..."
                  />
                </div>
              </>
            )}

            {tap === "Variables" && (
              <>
                <div className="flex items-center justify-between border-b border-zinc-800/80 bg-primary h-10 px-4">
                  <label className="text-xs font-semibold text-zinc-500">
                    Variables
                  </label>

                  <div className="flex items-center">
                    {/* Help/Documentation Button */}
                    <a
                      href="https://docs.hoppscotch.io/documentation/features/graphql-api-testing"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-zinc-400 hover:text-white transition-colors">
                      <svg viewBox="0 0 24 24" width="15" height="15">
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
                    </a>

                    {/* Delete/Clear Variables Button */}
                    <button
                      onClick={() => setVariablesContent("{}")}
                      className="p-1 text-zinc-400 hover:text-white transition-colors">
                      <svg viewBox="0 0 24 24" width="15" height="15">
                        <path
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2m-6 5v6m4-6v6"></path>
                      </svg>
                    </button>

                    {/* Prettify Variables Button - Blue accent */}
                    <button
                      onClick={() => {
                        try {
                          const parsed = JSON.parse(variablesContent);
                          const formatted = JSON.stringify(parsed, null, 2);
                          setVariablesContent(formatted);
                        } catch (error) {
                          console.error("Invalid JSON:", error);
                        }
                      }}
                      className="p-1 text-btn hover:text-btn-hover transition-colors">
                      <svg viewBox="0 0 24 24" width="15" height="15">
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
                    </button>

                    {/* Magic Wand Button */}
                    <button
                      onClick={() => {
                        console.log("Variables magic wand action");
                      }}
                      className="p-1 text-zinc-400 hover:text-white transition-colors">
                      <svg viewBox="0 0 24 24" width="15" height="15">
                        <path
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 4V2m0 14v-2M8 9h2m10 0h2m-4.2 2.8L19 13m-4-4h.01m2.79-2.8L19 5M3 21l9-9m.2-5.8L11 5"></path>
                      </svg>
                    </button>

                    {/* Copy Variables Button */}
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(variablesContent);
                          console.log("Variables copied to clipboard");
                        } catch (error) {
                          console.error("Failed to copy:", error);
                        }
                      }}
                      className="p-1 text-zinc-400 hover:text-white transition-colors">
                      <svg viewBox="0 0 24 24" width="15" height="15">
                        <g
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2">
                          <rect
                            width="15"
                            height="15"
                            x="8"
                            y="8"
                            rx="2"
                            ry="2"></rect>
                          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                        </g>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="h-full overflow-y-auto">
                  <CodeMirror
                    value={variablesContent}
                    onChange={(value) => setVariablesContent(value)}
                    theme={myTheme}
                    extensions={jsonExtensions}
                    placeholder="Enter your GraphQL variables as JSON..."
                  />
                </div>
              </>
            )}

            {tap === "Headers" && <QueryParameterComponent />}

            {tap === "Authorization" && (
              <>
                <div className="flex items-center justify-between border-b border-zinc-800/80 bg-primary h-10 px-4">
                  <div className="flex items-center">
                    <label className="text-xs font-semibold text-zinc-500 mr-3">
                      Authorization Type
                    </label>

                    <Tippy
                      content={
                        <div className="flex flex-col bg-zinc-800 border border-zinc-700 rounded-md shadow-xl py-1 min-w-[180px]">
                          {authTypes.map((type) => (
                            <button
                              key={type.id}
                              onClick={() => setAuthType(type.name)}
                              className="flex items-center px-3 py-2 text-xs hover:bg-zinc-700 transition-colors">
                              {type.name === authType ? (
                                <div className="w-3 h-3 mr-3 text-btn">
                                  <svg
                                    viewBox="0 0 24 24"
                                    width="15"
                                    height="15">
                                    <circle
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                    />
                                    <circle
                                      cx="12"
                                      cy="12"
                                      r="1"
                                      fill="currentColor"
                                    />
                                  </svg>
                                </div>
                              ) : (
                                <Circle
                                  size={15}
                                  className="mr-3 text-zinc-500"
                                />
                              )}
                              <span className="text-zinc-300">{type.name}</span>
                            </button>
                          ))}
                        </div>
                      }
                      interactive={true}
                      trigger="click"
                      placement="bottom-start">
                      <button className="flex items-center px-3 py-1 text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-800 rounded border border-zinc-600">
                        <span className="mr-2">{authType}</span>
                        <ChevronDown size={15} />
                      </button>
                    </Tippy>
                  </div>

                  <div className="flex items-center">
                    {/* Enabled Checkbox - Smaller */}
                    <div className="flex items-center mr-3">
                      <input
                        id="auth-enabled"
                        type="checkbox"
                        defaultChecked
                        className="w-3 h-3 text-btn bg-transparent border-zinc-600 rounded focus:ring-btn focus:ring-1"
                      />
                      <label
                        htmlFor="auth-enabled"
                        className="ml-2 text-xs font-semibold text-zinc-300">
                        Enabled
                      </label>
                    </div>

                    <button className="p-1 text-zinc-400 hover:text-white transition-colors">
                      <Trash size={15} />
                    </button>

                    <a
                      href="https://docs.hoppscotch.io/documentation/features/authorization"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-zinc-400 hover:text-white transition-colors">
                      <svg viewBox="0 0 24 24" width="15" height="15">
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
                    </a>
                  </div>
                </div>

                {/* Authorization Content - Improved layout */}
                <div className="flex flex-1">
                  <div className="w-2/3 border-r border-zinc-800/80 p-4">
                    {authType === "Inherit" ? (
                      <span className="text-zinc-400 text-xs">
                        Please save this request in any collection to inherit
                        the authorization
                      </span>
                    ) : authType === "None" ? (
                      <span className="text-zinc-400 text-xs">
                        No authorization will be sent with this request
                      </span>
                    ) : authType === "Basic Auth" ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-zinc-500 mb-1">
                            Username
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 bg-transparent border border-zinc-600 rounded text-xs text-zinc-300 focus:outline-none focus:border-btn"
                            placeholder="Enter username"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-zinc-500 mb-1">
                            Password
                          </label>
                          <input
                            type="password"
                            className="w-full px-3 py-2 bg-transparent border border-zinc-600 rounded text-xs text-zinc-300 focus:outline-none focus:border-btn"
                            placeholder="Enter password"
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-zinc-400 text-xs">
                        {authType} configuration will be available here
                      </span>
                    )}
                  </div>

                  <div className="w-1/3 bg-primary p-4">
                    <div className="text-zinc-500 text-xs mb-3">
                      The authorization header will be automatically generated
                      when you send the request.
                    </div>
                    <a
                      href="https://docs.hoppscotch.io/documentation/features/authorization"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-btn hover:text-btn-hover text-xs font-medium">
                      Learn how
                      <ExternalLink size={12} className="ml-1" />
                    </a>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Vertical Drag Handle */}
        <div
          onMouseDown={startVerticalResizing}
          className="h-[2px] bg-zinc-700/50 cursor-row-resize hover:bg-btn transition-all duration-200 hover:h-[4px] flex-shrink-0"
        />

        {/* Bottom Section */}
        <div
          style={{ height: `${100 - topHeight}%` }}
          className="overflow-hidden">
          <div className="h-full p-4">
            <KeyboardShortcuts docUrl="https://docs.hoppscotch.io/documentation/features/graphql-api-testing" />
          </div>
        </div>
      </div>

      {/* Horizontal Drag Handle */}
      <div
        onMouseDown={startResizing}
        className="w-[2px] cursor-col-resize bg-zinc-700/50 hover:bg-btn transition-all duration-200 hover:w-[4px] flex-shrink-0 relative z-50"
      />

      {/* Right Panel */}
      <div style={{ width: `${100 - leftWidth}%` }}>
        <GraphQLRightPanel />
      </div>
    </div>
  );
}

export default GraphQLPanel;
