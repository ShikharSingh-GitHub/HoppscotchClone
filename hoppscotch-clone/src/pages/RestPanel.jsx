import { useEffect, useRef, useState } from "react";
import Response from "../components/LeftPanel/Response";
import RouteHeader from "../components/LeftPanel/RouteHeader";
import RightPanel from "../components/RightPanel/RightPanel";
import { TabProvider } from "../contexts/TabContext";

function RestPanel() {
  const [leftWidth, setLeftWidth] = useState(55);
  const [topHeight, setTopHeight] = useState(60);
  const [isResizing, setIsResizing] = useState(false);
  const [isVerticalResizing, setIsVerticalResizing] = useState(false);
  const containerRef = useRef(null);
  const verticalContainerRef = useRef(null);

  // Horizontal resizing logic
  const startResizing = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const stopResizing = () => {
    setIsResizing(false);
  };

  const resize = (e) => {
    if (isResizing && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const newLeftWidth =
        ((e.clientX - containerRect.left) / containerWidth) * 100;

      if (newLeftWidth > 30 && newLeftWidth < 80) {
        setLeftWidth(newLeftWidth);
      }
    }
  };

  // Vertical resizing logic
  const startVerticalResizing = (e) => {
    setIsVerticalResizing(true);
    e.preventDefault();
  };

  const stopVerticalResizing = () => {
    setIsVerticalResizing(false);
  };

  const resizeVertical = (e) => {
    if (isVerticalResizing && verticalContainerRef.current) {
      const containerRect =
        verticalContainerRef.current.getBoundingClientRect();
      const containerHeight = containerRect.height;
      const newTopHeight =
        ((e.clientY - containerRect.top) / containerHeight) * 100;

      if (newTopHeight > 30 && newTopHeight < 80) {
        setTopHeight(newTopHeight);
      }
    }
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", resize);
      document.addEventListener("mouseup", stopResizing);
    } else {
      document.removeEventListener("mousemove", resize);
      document.removeEventListener("mouseup", stopResizing);
    }

    return () => {
      document.removeEventListener("mousemove", resize);
      document.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing]);

  useEffect(() => {
    if (isVerticalResizing) {
      document.addEventListener("mousemove", resizeVertical);
      document.addEventListener("mouseup", stopVerticalResizing);
    } else {
      document.removeEventListener("mousemove", resizeVertical);
      document.removeEventListener("mouseup", stopVerticalResizing);
    }

    return () => {
      document.removeEventListener("mousemove", resizeVertical);
      document.removeEventListener("mouseup", stopVerticalResizing);
    };
  }, [isVerticalResizing]);

  return (
    <TabProvider>
      <div
        className="flex w-full h-full border-l border-gray-700/30"
        ref={containerRef}>
        {/* Left Panel with Vertical Split */}
        <div
          style={{ width: `${leftWidth}%` }}
          className="flex flex-col"
          ref={verticalContainerRef}>
          {/* Top Section - RouteHeader */}
          <div style={{ height: `${topHeight}%` }} className="overflow-hidden">
            {/* Remove onRequestComplete prop to prevent duplicate history entries */}
            <RouteHeader />
          </div>

          {/* Vertical Drag Handle */}
          <div
            onMouseDown={startVerticalResizing}
            className="h-[2px] bg-zinc-700/50 cursor-row-resize hover:bg-btn transition-all duration-200 hover:h-[4px] flex-shrink-0"
          />

          {/* Bottom Section - Response */}
          <div
            style={{ height: `${100 - topHeight}%` }}
            className="overflow-hidden">
            <div className="h-full p-4">
              <Response />
            </div>
          </div>
        </div>

        {/* Horizontal Drag Handle */}
        <div
          onMouseDown={startResizing}
          className="w-[2px] cursor-col-resize bg-zinc-700/50 hover:bg-btn transition-all duration-200 hover:w-[4px] flex-shrink-0 relative z-50"
          style={{
            minWidth: "2px",
            maxWidth: "4px",
          }}
        />

        {/* Right Panel */}
        <div style={{ width: `${100 - leftWidth}%` }}>
          <RightPanel />
        </div>
      </div>
    </TabProvider>
  );
}

export default RestPanel;
