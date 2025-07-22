import { useRef, useState } from "react";
import Authorization from "./Authorization";
import Body from "./Body";
import PostRequestScript from "./PostRequestScript"; // Import PostRequestScript
import PreRequestScript from "./PreRequestScript";
import QueryParameter from "./QueryParameter";
import Response from "./Response";

const tabs = [
  { id: 1, name: "Parameters" },
  { id: 2, name: "Body" },
  { id: 3, name: "Headers" },
  { id: 4, name: "Authorization" },
  { id: 5, name: "Pre-request Script" },
  { id: 6, name: "Post-request Script" },
];

const RequestSection = () => {
  const [tap, setTab] = useState("Parameters");

  const [topHeight, setTopHeight] = useState(75);
  const containerRef = useRef(null);
  const isResizing = useRef(false);

  const MIN_HEIGHT = 16;
  const MAX_HEIGHT = 73;

  const startResizing = () => {
    isResizing.current = true;
    document.addEventListener("mousemove", handleResize);
    document.addEventListener("mouseup", stopResizing);
  };

  const handleResize = (e) => {
    if (!isResizing.current || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const containerHeight = containerRect.height;
    const newTopHeight =
      ((e.clientY - containerRect.top) / containerHeight) * 100;

    // Enforce min/max height
    if (newTopHeight < MIN_HEIGHT) setTopHeight(MIN_HEIGHT);
    else if (newTopHeight > MAX_HEIGHT) setTopHeight(MAX_HEIGHT);
    else setTopHeight(newTopHeight);
  };

  const stopResizing = () => {
    isResizing.current = false;
    document.removeEventListener("mousemove", handleResize);
    document.removeEventListener("mouseup", stopResizing);
  };

  const bottomHeight = 100 - topHeight;

  const renderActiveTab = () => {
    switch (tap) {
      case "Parameters":
        return <QueryParameter />;
      case "Body":
        return <Body />;
      case "Authorization":
        return <Authorization />;
      case "Pre-request Script":
        return <PreRequestScript />;
      case "Post-request Script": // Add the PostRequestScript case
        return <PostRequestScript />;
      // Add other cases for remaining tabs as they're implemented
      default:
        return <QueryParameter />;
    }
  };

  return (
    <div>
      {/* Tabs */}
      <div className="flex justify-between overflow-scroll px-4 space-x-4 mt-6 pb-3 scrollbar-hide">
        <div className="flex space-x-4">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.name)}
              className={`lg:text-[13px] text-[12px] font-semibold hover:text-white ${
                tap === t.name
                  ? "underline underline-offset-10 decoration-btn decoration-2 text-white"
                  : "text-zinc-500"
              }`}>
              {t.name}
            </button>
          ))}
        </div>
        {/* Variables */}
        <button
          onClick={() => setTab("Variables")}
          className={`lg:text-[13px] text-[12px] font-semibold text-zinc-500 hover:text-white ${
            tap === "Variables" &&
            "underline underline-offset-8 decoration-btn decoration-2"
          }`}>
          Variables
        </button>
      </div>

      {/* Content Area */}
      <div ref={containerRef} className="w-full h-[70dvh]">
        <div
          style={{ height: `${topHeight - 0.5}%` }}
          className="overflow-y-auto pb-20">
          {renderActiveTab()}
        </div>

        <div
          className="hover:h-[10px] h-[3px] bg-zinc-800/60 cursor-row-resize hover:bg-btn-hover transition-colors"
          onMouseDown={startResizing}></div>

        <div style={{ height: `${bottomHeight}%` }} className="px-4 py-2">
          <Response />
        </div>
      </div>
    </div>
  );
};

export default RequestSection;
