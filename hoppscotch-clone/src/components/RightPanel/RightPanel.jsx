import Tippy from "@tippyjs/react";
import {
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Copy,
  Download,
  Edit,
  FileX,
  Filter,
  FolderDown,
  Globe,
  HelpCircle,
  MoreVertical,
  Plus,
  Search,
  Trash2,
  WrapText,
} from "lucide-react";
import { useState } from "react";
import History from "../History/History";
import IconButton from "../IconButton/IconButton";
import RSidebar from "./RSidebar";

const RightPanel = () => {
  const [activePanel, setActivePanel] = useState("collections");
  const [showEnvironmentMenu, setShowEnvironmentMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("history");

  // Collections Panel Component
  const CollectionsPanel = () => (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col">
          <div className="flex flex-col items-center justify-center p-4">
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
                <circle
                  cx="20"
                  cy="20"
                  r="2"
                  fill="currentColor"
                  opacity="0.7"
                />
                <circle
                  cx="32"
                  cy="20"
                  r="2"
                  fill="currentColor"
                  opacity="0.7"
                />
                <circle
                  cx="44"
                  cy="20"
                  r="2"
                  fill="currentColor"
                  opacity="0.7"
                />
              </svg>
            </div>
            <span className="max-w-sm mt-2 text-center whitespace-normal text-xs text-gray-500">
              Collections are empty
            </span>
            <div className="mt-4">
              <div className="flex flex-col items-center space-y-4">
                <span className="text-center text-gray-500 text-xs">
                  Import or create a collection
                </span>
                <div className="flex flex-col items-stretch gap-4">
                  <button className="relative inline-flex items-center justify-center py-2 font-semibold whitespace-nowrap transition focus:outline-none bg-btn text-white hover:bg-btn-hover px-4 py-2 rounded border border-btn hover:border-btn-hover text-xs">
                    <span className="inline-flex items-center justify-center whitespace-nowrap">
                      <Download size={16} className="mr-2" />
                      <div className="max-w-[16rem] truncate">Import</div>
                    </span>
                  </button>
                  <button className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-gray-300 hover:text-white rounded px-4 py-2 border border-gray-700 hover:border-gray-600 bg-search-bg-hover hover:bg-search-bg text-xs">
                    <span className="inline-flex items-center justify-center whitespace-nowrap">
                      <Plus size={16} className="mr-2" />
                      <div className="truncate max-w-[16rem]">Add new</div>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Environment Menu Component
  const EnvironmentMenu = () => (
    <div className="flex flex-col focus:outline-none bg-search-bg border border-gray-700 rounded-lg shadow-lg py-2">
      <button className="inline-flex items-center flex-shrink-0 px-4 py-2 rounded transition hover:bg-search-bg-hover hover:text-white focus:outline-none flex-1 text-left">
        <span className="inline-flex items-center">
          <Edit size={16} className="opacity-75 mr-4" />
        </span>
        <div className="inline-flex items-start flex-1 truncate">
          <div className="font-semibold truncate max-w-[16rem] text-sm">
            Edit
          </div>
        </div>
        <div className="ml-4 inline-flex font-medium">
          <kbd className="-mr-2 text-[10px] bg-stone-800 rounded px-2 py-1 text-gray-500">
            E
          </kbd>
        </div>
      </button>
      <button className="inline-flex items-center flex-shrink-0 px-4 py-2 rounded transition hover:bg-search-bg-hover hover:text-white focus:outline-none flex-1 text-left">
        <span className="inline-flex items-center">
          <Copy size={16} className="opacity-75 mr-4" />
        </span>
        <div className="inline-flex items-start flex-1 truncate">
          <div className="font-semibold truncate max-w-[16rem] text-sm">
            Duplicate
          </div>
        </div>
        <div className="ml-4 inline-flex font-medium">
          <kbd className="-mr-2 text-[10px] bg-stone-800 rounded px-2 py-1 text-gray-500">
            D
          </kbd>
        </div>
      </button>
      <button className="inline-flex items-center flex-shrink-0 px-4 py-2 rounded transition hover:bg-search-bg-hover hover:text-white focus:outline-none flex-1 text-left">
        <span className="inline-flex items-center">
          <Download size={16} className="opacity-75 mr-4" />
        </span>
        <div className="inline-flex items-start flex-1 truncate">
          <div className="font-semibold truncate max-w-[16rem] text-sm">
            Export as JSON
          </div>
        </div>
        <div className="ml-4 inline-flex font-medium">
          <kbd className="-mr-2 text-[10px] bg-stone-800 rounded px-2 py-1 text-gray-500">
            J
          </kbd>
        </div>
      </button>
    </div>
  );

  // Environments Panel Component
  const EnvironmentsPanel = () => (
    <div className="flex flex-1 flex-col">
      {/* Global Environment Item */}
      <div className="group flex items-stretch border-b border-gray-700/30">
        <span className="flex cursor-pointer items-center justify-center px-4">
          <Globe size={20} className="text-gray-400" />
        </span>
        <span className="flex min-w-0 flex-1 cursor-pointer py-2 pr-2 transition group-hover:text-white">
          <span className="truncate text-sm text-gray-300">Global</span>
        </span>
        <div className="flex">
          <button className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-gray-400 hover:text-white p-2 hidden group-hover:inline-flex">
            <Edit size={16} />
          </button>
          <button className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-gray-400 hover:text-white p-2 hidden group-hover:inline-flex">
            <Copy size={16} />
          </button>
        </div>
        <span>
          <Tippy
            content={<EnvironmentMenu />}
            visible={showEnvironmentMenu}
            onClickOutside={() => setShowEnvironmentMenu(false)}
            placement="bottom"
            theme="popover"
            interactive={true}
            arrow={true}
            maxWidth={350}
            trigger="manual">
            <button
              onClick={() => setShowEnvironmentMenu(!showEnvironmentMenu)}
              className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-gray-400 hover:text-white p-2">
              <MoreVertical size={16} />
            </button>
          </Tippy>
        </span>
      </div>

      {/* Empty State */}
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
              d="M32 8L44 16L32 24L20 16L32 8Z"
              fill="currentColor"
              opacity="0.8"
            />
            <path
              d="M32 28L44 36L32 44L20 36L32 28Z"
              fill="currentColor"
              opacity="0.6"
            />
            <path
              d="M32 48L44 56L32 64L20 56L32 48Z"
              fill="currentColor"
              opacity="0.4"
            />
          </svg>
        </div>
        <span className="max-w-sm mt-2 text-center whitespace-normal text-xs text-gray-500">
          Environments are empty
        </span>
        <div className="mt-4">
          <button className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-gray-300 hover:text-white rounded px-4 py-2 border border-gray-700 hover:border-gray-600 bg-search-bg-hover hover:bg-search-bg text-xs">
            <Plus size={16} className="mr-2" />
            Add new environment
          </button>
        </div>
      </div>
    </div>
  );

  // History Panel Component
  const HistoryPanel = () => (
    <div className="flex flex-1 flex-col">
      {/* Search and Actions Bar */}
      <div className="sticky top-0 z-10 flex flex-shrink-0 flex-col overflow-x-auto border-b border-gray-700/30 bg-search-bg">
        <div className="flex">
          <input
            type="search"
            autoComplete="off"
            className="flex w-full bg-transparent px-4 py-2 h-8 text-white placeholder-gray-500 focus:outline-none text-sm"
            placeholder="Search"
          />
          <div className="flex">
            {/* Help/Documentation Link */}
            <a
              href="https://docs.hoppscotch.io/documentation/features/history"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-gray-400 hover:text-white p-2">
              <HelpCircle size={18} />
            </a>

            {/* Filter Button */}
            <Tippy
              content={<span className="text-xs">Filter history</span>}
              placement="bottom"
              theme="light">
              <button className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-gray-400 hover:text-white p-2">
                <Filter size={18} />
              </button>
            </Tippy>

            {/* Clear History Button (disabled when empty) */}
            <Tippy
              content={<span className="text-xs">Clear history</span>}
              placement="bottom"
              theme="light">
              <button
                disabled
                className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-gray-400 p-2 opacity-75 cursor-not-allowed">
                <Trash2 size={18} />
              </button>
            </Tippy>
          </div>
        </div>
      </div>

      {/* Empty State */}
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
          Start making requests to see them here
        </p>
      </div>
    </div>
  );

  // Shared Requests Panel Component
  const SharedRequestsPanel = () => (
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
              cx="20"
              cy="20"
              r="8"
              stroke="currentColor"
              strokeWidth="2"
            />
            <circle
              cx="44"
              cy="20"
              r="8"
              stroke="currentColor"
              strokeWidth="2"
            />
            <circle
              cx="32"
              cy="44"
              r="8"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M28 20L36 20"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M26 28L30 36"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M38 28L34 36"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <span className="max-w-sm mt-2 text-center whitespace-normal text-xs text-gray-500">
          No shared requests
        </span>
        <p className="text-center text-gray-600 text-xs mt-2 max-w-sm">
          Share requests with your team to see them here
        </p>
      </div>
    </div>
  );

  // Generated Code Panel Component
  const GeneratedCodePanel = () => {
    const [selectedLanguage, setSelectedLanguage] = useState("Shell - cURL");
    const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

    const languages = [
      "Shell - cURL",
      "JavaScript - Fetch",
      "JavaScript - Axios",
      "Python - Requests",
      "Node.js - Native",
      "PHP - cURL",
      "Java - OkHttp",
      "Go - Native",
      "Ruby - Net::HTTP",
      "C# - HttpClient",
    ];

    return (
      <div className="flex flex-1 flex-col">
        {/* Breadcrumb */}
        <div className="flex items-center overflow-x-auto whitespace-nowrap border-b border-gray-700/30 px-4 py-2 text-xs text-gray-500">
          <span className="truncate">Request</span>
          <ChevronRight size={16} className="mx-2" />
          <span className="truncate">Code snippet</span>
        </div>

        {/* Content */}
        <div className="flex flex-col px-4 mt-4">
          {/* Language Selector */}
          <div className="mb-4">
            <Tippy
              content={
                <div className="bg-search-bg border border-gray-700 rounded-lg shadow-lg py-2 max-h-64 overflow-y-auto">
                  {languages.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setSelectedLanguage(lang);
                        setShowLanguageDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-search-bg-hover transition-colors">
                      {lang}
                    </button>
                  ))}
                </div>
              }
              visible={showLanguageDropdown}
              onClickOutside={() => setShowLanguageDropdown(false)}
              placement="bottom-start"
              theme="popover"
              interactive={true}
              arrow={true}
              trigger="manual">
              <div className="relative">
                <button
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-gray-300 hover:text-white rounded px-4 py-2 border border-gray-700 hover:border-gray-600 w-full text-left pr-8">
                  <span className="inline-flex items-center justify-center whitespace-nowrap">
                    <div className="truncate max-w-[16rem]">
                      {selectedLanguage}
                    </div>
                  </span>
                </button>
                <ChevronDown
                  size={16}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
              </div>
            </Tippy>
          </div>

          {/* Code Editor Container */}
          <div className="rounded border border-gray-700">
            {/* Header */}
            <div className="flex items-center justify-between pl-4">
              <label className="truncate font-semibold text-gray-400 text-sm py-3">
                Generated code
              </label>
              <div className="flex items-center">
                {/* Word Wrap Toggle */}
                <Tippy
                  content={<span className="text-xs">Toggle word wrap</span>}
                  placement="top"
                  theme="light">
                  <button className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-btn hover:text-btn-hover p-2">
                    <WrapText size={16} />
                  </button>
                </Tippy>

                {/* Download */}
                <Tippy
                  content={<span className="text-xs">Download</span>}
                  placement="top"
                  theme="light">
                  <button className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-gray-400 hover:text-white p-2">
                    <Download size={16} />
                  </button>
                </Tippy>

                {/* Copy */}
                <Tippy
                  content={<span className="text-xs">Copy</span>}
                  placement="top"
                  theme="light">
                  <button className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-gray-400 hover:text-white p-2">
                    <Copy size={16} />
                  </button>
                </Tippy>
              </div>
            </div>

            {/* Code Editor */}
            <div className="rounded-b border-t border-gray-700">
              <div className="bg-zinc-900 rounded-b">
                <div className="flex">
                  {/* Line Numbers */}
                  <div className="bg-zinc-800/50 px-3 py-3 text-xs text-gray-500 select-none border-r border-gray-700">
                    <div className="leading-5">1</div>
                    <div className="leading-5">2</div>
                  </div>

                  {/* Code Content */}
                  <div className="flex-1 p-3 font-mono text-sm text-white overflow-x-auto">
                    <div className="leading-5">
                      <span className="text-green-400">curl</span>{" "}
                      <span className="text-blue-400">--request</span>{" "}
                      <span className="text-yellow-400">PATCH</span>{" "}
                      <span className="text-gray-400">\</span>
                    </div>
                    <div className="leading-5">
                      {"  "}
                      <span className="text-blue-400">--url</span>{" "}
                      <span className="text-green-300">
                        https://echo.hoppscotch.io/
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Get panel title and breadcrumb
  const getPanelTitle = () => {
    switch (activePanel) {
      case "collections":
        return "Collections";
      case "environments":
        return "Environments";
      case "history":
        return "History";
      case "shared":
        return "Shared Requests";
      case "code":
        return "Generated Code";
      default:
        return "Collections";
    }
  };

  // Render active panel
  const renderActivePanel = () => {
    switch (activePanel) {
      case "collections":
        return <CollectionsPanel />;
      case "environments":
        return <EnvironmentsPanel />;
      case "history":
        return <History />; // Use the imported History component instead of HistoryPanel
      case "shared":
        return <SharedRequestsPanel />;
      case "code":
        return <GeneratedCodePanel />;
      default:
        return <CollectionsPanel />;
    }
  };

  return (
    <div className="flex h-full w-full">
      <div className="w-13 flex flex-col items-center pt-1 border-r border-gray-700/30">
        <RSidebar activePanel={activePanel} setActivePanel={setActivePanel} />
      </div>

      <div className="w-full flex flex-col">
        <div className="flex items-center border-b border-gray-700/30 pb-2 pt-2 px-3">
          <p className="text-[11px] text-stone-500">Personal Workspace</p>
          <p>
            <ChevronRight size={14} className="text-stone-500 mx-3 mt-[1px]" />
          </p>
          <p className="text-[11px] text-stone-500">{getPanelTitle()}</p>
        </div>

        {/* Conditional Search Section - only show for non-History and non-Code panels */}
        {activePanel !== "history" && activePanel !== "code" && (
          <>
            <p className="text-[12px] text-stone-500 font-semibold border-b border-gray-700/30 py-2 px-3">
              Search
            </p>

            <div className="flex justify-between px-3 py-2 border-b border-gray-700/30">
              <button className="flex space-x-3 items-center text-gray-500 hover:text-white">
                <Plus size={18} />
                <span className="text-xs font-semibold">New</span>
              </button>

              <div className="flex space-x-4">
                <IconButton name="Wiki" direction="top">
                  <CircleHelp size={18} />
                </IconButton>

                <IconButton name="Import / Export" direction="top">
                  <FolderDown size={18} />
                </IconButton>
              </div>
            </div>
          </>
        )}

        {/* Active Panel Content */}
        <div className="flex-1 overflow-hidden">{renderActivePanel()}</div>
      </div>
    </div>
  );
};

export default RightPanel;
