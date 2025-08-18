import { Copy, Download, Ellipsis, Filter, Save, WrapText } from "lucide-react";
import { useState } from "react";
import useRequestStore from "../../store/store";
import IconButton from "../IconButton/IconButton";
import KeyboardShortcuts from "../KeyboardShortcuts/KeyboardShortcuts";

const Response = () => {
  const responseHeader = [
    { id: 1, name: "JSON" },
    { id: 2, name: "Raw" },
    { id: 3, name: "Headers" },
    { id: 4, name: "Test Results" },
  ];

  const [responseH, setResponseH] = useState("JSON");

  const { isRequested, responseData } = useRequestStore();

  // Use dynamic response data or fallback to static data for demo
  const getDisplayData = () => {
    if (responseData && responseData.data) {
      // Our API returns data in the format: { success: true, data: {...} }
      // So responseData.data contains the actual API response
      return responseData.data;
    }

    // If no response data, show empty state
    return null;
  };

  const displayData = getDisplayData();

  const formatJsonLines = (obj, indent = 2) => {
    const lines = [];
    const pad = " ".repeat(indent);

    lines.push(`${pad}{`);

    const entries = Object.entries(obj);
    entries.forEach(([key, value], index) => {
      const comma = index < entries.length - 1 ? "," : "";
      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        lines.push(`${pad}  "${key}": {`);
        const subEntries = Object.entries(value);
        subEntries.forEach(([subKey, subValue], subIndex) => {
          const subComma = subIndex < subEntries.length - 1 ? "," : "";
          lines.push(`${pad}    "${subKey}": "${subValue}"${subComma}`);
        });
        lines.push(`${pad}  }${comma}`);
      } else if (typeof value === "string") {
        lines.push(`${pad}  "${key}": "${value}"${comma}`);
      } else {
        lines.push(`${pad}  "${key}": ${value}${comma}`);
      }
    });

    lines.push(`${pad}}`);
    return lines;
  };

  // Only format JSON if we have data
  const lines = displayData ? formatJsonLines(displayData) : [];

  // Function to render response content based on selected tab
  const renderResponseContent = () => {
    if (!responseData) {
      return (
        <div className="text-gray-400 text-center py-8">
          Send a request to see the response here
        </div>
      );
    }

    switch (responseH) {
      case "JSON":
        return (
          <div className="border border-search-bg pt-3 h-96 pb-24 overflow-y-scroll">
            {lines.map((line, index) => (
              <div key={index} className="flex items-start">
                <div className="w-10 text-gray-500 text-xs text-center">
                  {index + 1}
                </div>
                <div className="pl-3 border-l border-search-bg leading-5">
                  {line.split(/("[^"]*":)/g).map((part, idx) =>
                    part.match(/^"/) ? (
                      <span
                        key={idx}
                        className="text-blue-400 text-[13px] font-semibold pl-4">
                        {part}
                      </span>
                    ) : part.match(/".*"/) ? (
                      <span
                        key={idx}
                        className="text-purple-400 text-[13px] font-semibold pl-4">
                        {part}
                      </span>
                    ) : (
                      <span key={idx} className="text-white text-[13px] pl-4">
                        {part}
                      </span>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        );

      case "Raw":
        return (
          <div className="border border-search-bg p-4 h-96 overflow-y-scroll">
            <pre className="text-[13px] text-white whitespace-pre-wrap">
              {typeof responseData.data === "string"
                ? responseData.data
                : JSON.stringify(responseData.data, null, 2)}
            </pre>
          </div>
        );

      case "Headers":
        return (
          <div className="border border-search-bg p-4 h-96 overflow-y-scroll">
            {responseData.headers &&
              Object.entries(responseData.headers).map(([key, value]) => (
                <div key={key} className="flex text-[13px] mb-2">
                  <span className="text-blue-400 font-semibold mr-2">
                    {key}:
                  </span>
                  <span className="text-white">{value}</span>
                </div>
              ))}
          </div>
        );

      case "Test Results":
        return (
          <div className="border border-search-bg p-4 h-96 overflow-y-scroll">
            <div className="text-gray-400 text-center py-8">
              Test results will appear here when implemented
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {isRequested ? (
        <div className="mt-0">
          <div className="flex space-x-4">
            {responseHeader.map((r) => (
              <button
                key={r.id}
                onClick={() => setResponseH(r.name)}
                className={`text-[13px] font-semibold hover:text-white ${
                  responseH === r.name
                    ? "underline underline-offset-10 decoration-btn decoration-2 text-white"
                    : "text-zinc-500"
                }`}>
                {r.name}
              </button>
            ))}
          </div>

          <div className="flex justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="mt-4 mb-3 font-semibold text-xs text-zinc-500">
                Response Body
              </h2>
              {responseData && (
                <div className="flex items-center space-x-2 mt-4 mb-3">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      responseData.status >= 200 && responseData.status < 300
                        ? "bg-green-600 text-green-100"
                        : responseData.status >= 400
                        ? "bg-red-600 text-red-100"
                        : "bg-yellow-600 text-yellow-100"
                    }`}>
                    {responseData.status} {responseData.statusText}
                  </span>
                </div>
              )}
            </div>

            <div className="flex space-x-5">
              <IconButton
                name="Wrap Lines"
                direction="top"
                className="text-blue-500 hover:text-white">
                <WrapText size={16} />
              </IconButton>
              <IconButton
                name="Filter"
                direction="top"
                className="text-zinc-500 hover:text-white">
                <Filter size={16} />
              </IconButton>
              <IconButton
                name="Download File"
                direction="top"
                className="text-zinc-500 hover:text-white">
                <Download size={16} />
              </IconButton>
              <IconButton
                name="Save"
                direction="top"
                className="text-zinc-500 hover:text-white">
                <Save size={16} />
              </IconButton>
              <IconButton
                name="Copy"
                direction="top"
                className="text-zinc-500 hover:text-white">
                <Copy size={16} />
              </IconButton>
              <IconButton
                name="Copy Link"
                direction="top"
                className="text-zinc-500 hover:text-white">
                <Ellipsis size={16} />
              </IconButton>
            </div>
          </div>

          {/* Dynamic Response Content */}
          {renderResponseContent()}
        </div>
      ) : (
        <KeyboardShortcuts docUrl="https://docs.hoppscotch.io/documentation/features/rest-api-testing#response" />
      )}
    </>
  );
};

export default Response;
