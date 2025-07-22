import { ChevronRight } from "lucide-react";
import { useState } from "react";
import GraphQLSidebar from "./GraphQLSidebar";

const GraphQLRightPanel = () => {
  const [activePanel, setActivePanel] = useState("documentation");

  // Documentation Panel Component
  const DocumentationPanel = () => (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col items-center justify-center p-4 flex-1">
        <div className="w-16 h-16 mb-4 flex items-center justify-center">
          <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            className="text-gray-500"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M32 16V48M16 24H48M20 32H44"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <rect
              x="12"
              y="12"
              width="40"
              height="40"
              rx="4"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>
        <span className="max-w-sm mt-2 text-center whitespace-normal text-xs text-gray-500">
          No documentation available
        </span>
        <p className="text-center text-gray-600 text-xs mt-2 max-w-sm">
          Connect to a GraphQL endpoint to view documentation
        </p>
      </div>
    </div>
  );

  // Schema Panel Component
  const SchemaPanel = () => (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col items-center justify-center p-4 flex-1">
        <div className="w-16 h-16 mb-4 flex items-center justify-center">
          <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            className="text-gray-500"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M32 8L52 20V44L32 56L12 44V20L32 8Z"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M12 20L32 32L52 20"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path d="M32 32V56" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        <span className="max-w-sm mt-2 text-center whitespace-normal text-xs text-gray-500">
          No schema available
        </span>
        <p className="text-center text-gray-600 text-xs mt-2 max-w-sm">
          Connect to a GraphQL endpoint to view schema
        </p>
      </div>
    </div>
  );

  // Collections Panel Component
  const CollectionsPanel = () => (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col items-center justify-center p-4 flex-1">
        <div className="w-16 h-16 mb-4 flex items-center justify-center">
          <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            className="text-gray-500"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M50 16H14C11.79 16 10 17.79 10 20V44C10 46.21 11.79 48 14 48H50C52.21 48 54 46.21 54 44V20C54 17.79 52.21 16 50 16Z"
              stroke="currentColor"
              strokeWidth="2"
              fill="currentColor"
              opacity="0.3"
            />
            <path
              d="M50 12H14C11.79 12 10 13.79 10 16V40C10 42.21 11.79 44 14 44H50C52.21 44 54 42.21 54 40V16C54 13.79 52.21 12 50 12Z"
              stroke="currentColor"
              strokeWidth="2"
              fill="currentColor"
              opacity="0.5"
            />
            <path
              d="M50 8H14C11.79 8 10 9.79 10 12V36C10 38.21 11.79 40 14 40H50C52.21 40 54 38.21 54 36V12C54 9.79 52.21 8 50 8Z"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
            <circle cx="20" cy="20" r="2" fill="currentColor" opacity="0.7" />
            <circle cx="32" cy="20" r="2" fill="currentColor" opacity="0.7" />
            <circle cx="44" cy="20" r="2" fill="currentColor" opacity="0.7" />
          </svg>
        </div>
        <span className="max-w-sm mt-2 text-center whitespace-normal text-xs text-gray-500">
          Collections are empty
        </span>
        <p className="text-center text-gray-600 text-xs mt-2 max-w-sm">
          Save GraphQL queries to collections
        </p>
      </div>
    </div>
  );

  // History Panel Component
  const HistoryPanel = () => (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col items-center justify-center p-4 flex-1">
        <div className="w-16 h-16 mb-4 flex items-center justify-center">
          <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            className="text-gray-500"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <circle
              cx="32"
              cy="32"
              r="24"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M32 16V32L40 40"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="32" cy="12" r="2" fill="currentColor" />
            <circle cx="52" cy="32" r="2" fill="currentColor" />
            <circle cx="32" cy="52" r="2" fill="currentColor" />
            <circle cx="12" cy="32" r="2" fill="currentColor" />
          </svg>
        </div>
        <span className="max-w-sm mt-2 text-center whitespace-normal text-xs text-gray-500">
          History is empty
        </span>
        <p className="text-center text-gray-600 text-xs mt-2 max-w-sm">
          Start making GraphQL queries to see them here
        </p>
      </div>
    </div>
  );

  // Get panel title
  const getPanelTitle = () => {
    switch (activePanel) {
      case "documentation":
        return "Documentation";
      case "schema":
        return "Schema";
      case "collections":
        return "Collections";
      case "history":
        return "History";
      default:
        return "Documentation";
    }
  };

  // Render active panel
  const renderActivePanel = () => {
    switch (activePanel) {
      case "documentation":
        return <DocumentationPanel />;
      case "schema":
        return <SchemaPanel />;
      case "collections":
        return <CollectionsPanel />;
      case "history":
        return <HistoryPanel />;
      default:
        return <DocumentationPanel />;
    }
  };

  return (
    <div className="flex h-full w-full">
      {/* Sidebar */}
      <div className="w-13 flex flex-col items-center pt-1">
        <GraphQLSidebar
          activePanel={activePanel}
          setActivePanel={setActivePanel}
        />
      </div>

      {/* Content Panel */}
      <div className="w-full flex flex-col border-l border-gray-700/30">
        <div className="flex items-center border-b border-gray-700/30 pb-2 pt-2 px-3">
          <p className="text-[11px] text-stone-500">Personal Workspace</p>
          <p>
            <ChevronRight size={14} className="text-stone-500 mx-3 mt-[1px]" />
          </p>
          <p className="text-[11px] text-stone-500">{getPanelTitle()}</p>
        </div>

        {/* Active Panel Content */}
        {renderActivePanel()}
      </div>
    </div>
  );
};

export default GraphQLRightPanel;
