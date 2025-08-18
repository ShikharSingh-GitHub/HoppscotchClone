import Tippy from "@tippyjs/react";
import { useEffect, useRef, useState } from "react";
import { useTabContext } from "../../contexts/TabContext";

const Body = () => {
  const { activeTab, updateTab } = useTabContext();
  const [contentType, setContentType] = useState("none");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Initialize content type based on existing headers or body
  useEffect(() => {
    if (activeTab) {
      const existingContentType =
        activeTab.headers?.["Content-Type"] ||
        activeTab.headers?.["content-type"];

      if (existingContentType) {
        setContentType(existingContentType);
      } else if (activeTab.body && activeTab.body.trim()) {
        // If there's a body but no content type, default to JSON
        setContentType("application/json");
        const updatedHeaders = {
          ...activeTab.headers,
          "Content-Type": "application/json",
        };
        updateTab(activeTab.id, { headers: updatedHeaders });
      } else {
        setContentType("none");
      }
    }
  }, [activeTab?.id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const contentTypes = [
    { value: "none", label: "None" },
    { value: "application/json", label: "JSON" },
    { value: "application/x-www-form-urlencoded", label: "Form URL Encoded" },
    { value: "multipart/form-data", label: "Form Data" },
    { value: "text/plain", label: "Raw Text" },
    { value: "application/xml", label: "XML" },
  ];

  const handleContentTypeChange = (newType) => {
    setContentType(newType);
    setIsDropdownOpen(false);

    // Update the tab headers with appropriate Content-Type
    const updatedHeaders = { ...activeTab.headers };

    if (newType === "none") {
      // Remove Content-Type header and clear body
      delete updatedHeaders["Content-Type"];
      updateTab(activeTab.id, {
        body: "",
        headers: updatedHeaders,
      });
    } else {
      // Set appropriate Content-Type header
      updatedHeaders["Content-Type"] = newType;
      updateTab(activeTab.id, {
        headers: updatedHeaders,
      });
    }
  };

  const handleBodyChange = (value) => {
    updateTab(activeTab.id, { body: value });
  };

  const formatJSON = () => {
    try {
      const parsed = JSON.parse(activeTab.body || "");
      const formatted = JSON.stringify(parsed, null, 2);
      handleBodyChange(formatted);
    } catch (error) {
      // If parsing fails, just keep the current value
      console.error("Invalid JSON format");
    }
  };

  const getContentTypeLabel = () => {
    const type = contentTypes.find((ct) => ct.value === contentType);
    return type ? type.label : "None";
  };

  function getPlaceholderText() {
    switch (contentType) {
      case "application/json":
        return `{
  "name": "Demo User",
  "email": "demo@example.com",
  "age": 28
}`;
      case "application/x-www-form-urlencoded":
        return "key1=value1&key2=value2";
      case "text/plain":
        return "Enter raw text here...";
      case "application/xml":
        return `<?xml version="1.0" encoding="UTF-8"?>
<root>
  <name>Demo User</name>
  <email>demo@example.com</email>
</root>`;
      default:
        return "Enter request body...";
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col">
        {/* Content Type Selector Header */}
        <div className="sticky top-0 z-0 flex flex-shrink-0 items-center justify-between overflow-x-auto border-b border-zinc-700/30 bg-primary pl-4">
          <span className="flex items-center">
            <label className="truncate font-semibold text-zinc-300 text-xs">
              Content Type
            </label>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-zinc-400 hover:text-white rounded px-3 py-1.5 ml-2 text-xs"
                tabIndex="0">
                <span className="inline-flex items-center justify-center whitespace-nowrap">
                  <div className="truncate max-w-[14rem]">
                    {getContentTypeLabel()}
                  </div>
                </span>
                <span className="text-xs ml-2">
                  <svg viewBox="0 0 24 24" width="1em" height="1em">
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m6 9l6 6l6-6"
                    />
                  </svg>
                </span>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg z-50 min-w-[200px]">
                  {contentTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => handleContentTypeChange(type.value)}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-zinc-700 transition-colors ${
                        contentType === type.value
                          ? "bg-zinc-700 text-white"
                          : "text-zinc-300"
                      }`}>
                      {type.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Format JSON button - only show for JSON content type */}
            {contentType === "application/json" && (
              <Tippy
                content={
                  <span className="text-[10px] font-semibold">Format JSON</span>
                }
                placement="top"
                theme="light">
                <button
                  onClick={formatJSON}
                  className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-zinc-400 hover:text-white rounded px-2 py-1 border border-zinc-700 hover:border-zinc-600 bg-search-bg hover:bg-search-bg-hover text-xs ml-2"
                  tabIndex="0">
                  <span className="inline-flex items-center justify-center whitespace-nowrap">
                    <svg
                      viewBox="0 0 24 24"
                      width="1em"
                      height="1em"
                      className="mr-1.5">
                      <g
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2">
                        <path d="M3 12a9 9 0 0 1 9-9a9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                        <path d="M21 3v5h-5m5 4a9 9 0 0 1-9 9a9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                        <path d="M8 16H3v5"></path>
                      </g>
                    </svg>
                    <div className="truncate max-w-[14rem]">Format</div>
                  </span>
                </button>
              </Tippy>
            )}
          </span>
        </div>

        {/* Body Content */}
        {contentType === "none" ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center p-4">
            {/* Upload file icon SVG replacement */}
            <svg
              viewBox="0 0 24 24"
              width="64"
              height="64"
              className="text-zinc-500 mb-1">
              <g
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5">
                <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" />
                <path d="M12 11v6" />
                <path d="M9.5 13.5L12 11l2.5 2.5" />
              </g>
            </svg>

            <span className="max-w-sm mt-2 text-center whitespace-normal text-xs text-zinc-400">
              This request does not have a body
            </span>
            <div className="mt-3">
              <button
                onClick={() => handleContentTypeChange("application/json")}
                className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-zinc-300 hover:text-white rounded px-3 py-1.5 flex-row-reverse border border-zinc-700 hover:border-zinc-600 bg-search-bg hover:bg-search-bg-hover text-xs"
                tabIndex="0">
                <span className="inline-flex items-center justify-center whitespace-nowrap flex-row-reverse">
                  <svg
                    viewBox="0 0 24 24"
                    width="1em"
                    height="1em"
                    className="ml-1.5">
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 3h6v6m-11 5L21 3m-3 10v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1-2-2h6"
                    />
                  </svg>
                  <div className="truncate max-w-[14rem]">Add JSON Body</div>
                </span>
              </button>
            </div>
          </div>
        ) : (
          /* Body Input Area */
          <div className="flex flex-1 flex-col p-4">
            <div className="flex flex-1">
              <textarea
                value={activeTab?.body || ""}
                onChange={(e) => handleBodyChange(e.target.value)}
                placeholder={getPlaceholderText()}
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded-md p-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 resize-none font-mono"
                rows={15}
                style={{ minHeight: "300px" }}
              />
            </div>

            {/* Body Info */}
            <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
              <span>Content-Type: {contentType}</span>
              <span>Size: {new Blob([activeTab?.body || ""]).size} bytes</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Body;
