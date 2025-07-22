import Tippy from "@tippyjs/react";
import {
  ChevronRight,
  CircleHelp,
  Columns2,
  PanelLeftOpen,
  PanelRight,
  Search,
  Share2,
  ShieldCheck,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import useUIStore from "../../store/uiStore";
import IconButton from "../IconButton/IconButton";

const FeedBackModal = () => (
  <div className="">
    <div className="flex flex-col focus:outline-none w-full h-full bg-[#1b1b1b]">
      <a
        aria-label="Link"
        href="https://docs.hoppscotch.io"
        target="_blank"
        rel="noopener"
        className="inline-flex items-center flex-shrink-0 px-2 py-2 rounded transition text-[#a3a3a3] hover:text-white flex-1">
        <span className="inline-flex items-center">
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            className="opacity-75 svg-icons mr-4">
            <path
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"></path>
          </svg>
        </span>
        <div className="inline-flex items-start flex-1 truncate">
          <div className="truncate text-[12px]">Documentation</div>
        </div>
      </a>

      <button
        aria-label="button"
        className="inline-flex items-center flex-shrink-0 px-2 py-2 rounded transition text-[#a3a3a3] hover:text-white flex-1">
        <span className="inline-flex items-center">
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            className="opacity-75 svg-icons mr-4">
            <path
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>
          </svg>
        </span>
        <div className="inline-flex items-start flex-1 truncate">
          <div className="truncate text-[12px]">Keyboard shortcuts</div>
        </div>
      </button>

      <button
        aria-label="button"
        className="inline-flex items-center flex-shrink-0 px-2 py-2 rounded transition text-[#a3a3a3] hover:text-white flex-1">
        <span className="inline-flex items-center">
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            className="opacity-75 svg-icons mr-4">
            <path
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>
          </svg>
        </span>
        <div className="inline-flex items-start flex-1 truncate">
          <div className="truncate text-[12px]">Chat with us</div>
        </div>
      </button>

      <a
        href="https://docs.hoppscotch.io/documentation/changelog"
        target="_blank"
        rel="noopener"
        className="inline-flex items-center flex-shrink-0 px-2 py-2 rounded transition text-[#a3a3a3] hover:text-white flex-1">
        <span className="inline-flex items-center">
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            className="opacity-75 svg-icons mr-4">
            <g
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2">
              <rect width="18" height="4" x="3" y="8" rx="1"></rect>
              <path d="M12 8v13m7-9v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7m2.5-4a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5a2.5 2.5 0 0 1 0 5"></path>
            </g>
          </svg>
        </span>
        <div className="inline-flex items-start flex-1 truncate">
          <div className="truncate text-[12px]">What's new?</div>
        </div>
      </a>

      <a
        href="https://status.hoppscotch.io"
        target="_blank"
        rel="noopener"
        className="inline-flex items-center flex-shrink-0 px-2 py-2 rounded transition text-[#a3a3a3] hover:text-white flex-1">
        <span className="inline-flex items-center">
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            className="opacity-75 svg-icons mr-4">
            <path
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"></path>
          </svg>
        </span>
        <div className="inline-flex items-start flex-1 truncate">
          <div className="truncate text-[12px]">Status</div>
        </div>
      </a>

      <a
        href="https://github.com/hoppscotch/hoppscotch"
        target="_blank"
        rel="noopener"
        className="inline-flex items-center flex-shrink-0 px-2 py-2 rounded transition text-[#a3a3a3] hover:text-white flex-1">
        <span className="inline-flex items-center">
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            className="opacity-75 svg-icons mr-4">
            <g
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5c.08-1.25-.27-2.48-1-3.5c.28-1.15.28-2.35 0-3.5c0 0-1 0-3 1.5c-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5c-.39.49-.68 1.05-.85 1.65S8.93 17.38 9 18v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </g>
          </svg>
        </span>
        <div className="inline-flex items-start flex-1 truncate">
          <div className="truncate text-[12px]">GitHub</div>
        </div>
      </a>

      <a
        href="https://hoppscotch.io/twitter"
        target="_blank"
        rel="noopener"
        className="inline-flex items-center flex-shrink-0 px-2 py-2 rounded transition text-[#a3a3a3] hover:text-white flex-1">
        <span className="inline-flex items-center">
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            className="opacity-75 svg-icons mr-4">
            <path
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6c2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4c-.9-4.2 4-6.6 7-3.8c1.1 0 3-1.2 3-1.2"></path>
          </svg>
        </span>
        <div className="inline-flex items-start flex-1 truncate">
          <div className="truncate text-[12px]">Twitter</div>
        </div>
      </a>

      <button
        aria-label="button"
        className="inline-flex items-center flex-shrink-0 px-2 py-2 rounded transition text-[#a3a3a3] hover:text-white flex-1">
        <span className="inline-flex items-center">
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            className="opacity-75 svg-icons mr-4">
            <g
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M19 8v6m3-3h-6"></path>
            </g>
          </svg>
        </span>
        <div className="inline-flex items-start flex-1 truncate">
          <div className="truncate text-[12px]">Invite</div>
        </div>
      </button>

      <a
        href="https://docs.hoppscotch.io/support/privacy"
        target="_blank"
        rel="noopener"
        className="inline-flex items-center flex-shrink-0 px-2 py-2 rounded transition text-[#a3a3a3] hover:text-white flex-1">
        <span className="inline-flex items-center">
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            className="opacity-75 svg-icons mr-4">
            <g
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </g>
          </svg>
        </span>
        <div className="inline-flex items-start flex-1 truncate">
          <div className="truncate text-[12px]">Terms and privacy</div>
        </div>
      </a>

      <div className="flex px-4 py-2 opacity-50 text-[12px]">
        Hoppscotch v2025.6.0
      </div>
    </div>
  </div>
);

// Keyboard Shortcuts Modal Component
const KeyboardShortcutsModal = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [openSections, setOpenSections] = useState({
    general: true,
    request: true,
    response: true,
    navigation: true,
    miscellaneous: true,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const shortcutSections = [
    {
      id: "general",
      title: "General",
      shortcuts: [
        { action: "Help menu", keys: ["?"] },
        { action: "Search & command menu", keys: ["⌘", "K"] },
        { action: "Keyboard shortcuts", keys: ["⌘", "/"] },
        { action: "Close current menu", keys: ["ESC"] },
      ],
    },
    {
      id: "request",
      title: "Request",
      shortcuts: [
        { action: "Send Request", keys: ["⌘", "↩"] },
        { action: "Save to Collections", keys: ["⌘", "S"] },
        { action: "Share Request", keys: ["⌘", "U"] },
        { action: "Reset Request", keys: ["⌘", "I"] },
        { action: "Select Next method", keys: ["⌥", "↑"] },
        { action: "Select Previous method", keys: ["⌥", "↓"] },
        { action: "Select GET method", keys: ["⌥", "G"] },
        { action: "Select HEAD method", keys: ["⌥", "H"] },
        { action: "Select POST method", keys: ["⌥", "P"] },
        { action: "Select PUT method", keys: ["⌥", "U"] },
        { action: "Select DELETE method", keys: ["⌥", "X"] },
      ],
    },
    {
      id: "response",
      title: "Response",
      shortcuts: [
        { action: "Download response as file", keys: ["⌘", "J"] },
        { action: "Copy response to clipboard", keys: ["⌘", "."] },
      ],
    },
    {
      id: "navigation",
      title: "Navigation",
      shortcuts: [
        { action: "Go back to previous page", keys: ["⌘", "←"] },
        { action: "Go forward to next page", keys: ["⌘", "→"] },
        { action: "Go to REST page", keys: ["⌥", "R"] },
        { action: "Go to GraphQL page", keys: ["⌥", "Q"] },
        { action: "Go to Realtime page", keys: ["⌥", "W"] },
        { action: "Go to Settings page", keys: ["⌥", "S"] },
        { action: "Go to Profile page", keys: ["⌥", "M"] },
      ],
    },
    {
      id: "miscellaneous",
      title: "Miscellaneous",
      shortcuts: [{ action: "Invite people to Hoppscotch", keys: ["⌘", "M"] }],
    },
  ];

  const filteredSections = shortcutSections
    .map((section) => ({
      ...section,
      shortcuts: section.shortcuts.filter((shortcut) =>
        shortcut.action.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((section) => section.shortcuts.length > 0);

  if (!isOpen) return null;

  return (
    <aside className="fixed top-0 right-0 z-30 flex flex-col h-full max-w-full overflow-auto border-l shadow-xl border-zinc-800 bg-primary w-96">
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b border-zinc-700">
        <h3 className="ml-4 text-lg font-semibold text-white">Shortcuts</h3>
        <button
          onClick={onClose}
          className="inline-flex items-center justify-center p-2 text-zinc-400 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Search */}
      <div className="sticky top-0 z-10 flex flex-shrink-0 flex-col overflow-x-auto bg-primary">
        <div className="relative flex px-6 py-4 border-b border-zinc-700">
          <div className="relative w-full">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400"
              size={16}
            />
            <input
              type="search"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-600 rounded text-white text-sm placeholder-zinc-400 focus:outline-none focus:border-btn"
            />
          </div>
        </div>
      </div>

      {/* Shortcuts List */}
      <div className="flex flex-col divide-y divide-zinc-700">
        {filteredSections.map((section) => (
          <details
            key={section.id}
            className="flex flex-col"
            open={openSections[section.id]}>
            <summary
              className="flex min-w-0 flex-1 cursor-pointer items-center px-6 py-4 font-semibold text-zinc-300 transition hover:text-white focus:outline-none"
              onClick={(e) => {
                e.preventDefault();
                toggleSection(section.id);
              }}>
              <ChevronRight
                size={20}
                className={`mr-2 transition-transform ${
                  openSections[section.id] ? "rotate-90" : ""
                }`}
              />
              <span className="capitalize-first truncate font-semibold text-zinc-200">
                {section.title}
              </span>
            </summary>

            {openSections[section.id] && (
              <div className="flex flex-col space-y-2 px-6 pb-4">
                {section.shortcuts.map((shortcut, index) => (
                  <div key={index} className="flex items-center py-1">
                    <span className="mr-4 flex flex-1 text-sm text-zinc-300">
                      {shortcut.action}
                    </span>
                    <div className="flex space-x-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <kbd
                          key={keyIndex}
                          className="px-2 py-1 text-xs font-semibold text-zinc-300 bg-zinc-700 border border-zinc-600 rounded">
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </details>
        ))}
      </div>
    </aside>
  );
};

const Footer = () => {
  // Using Zustand store - the import is now correct
  const {
    sidebarExpanded,
    toggleSidebar,
    showFeedbackModal,
    showShortcutsModal,
    setShowFeedbackModal,
    setShowShortcutsModal,
    layoutMode,
    toggleLayoutMode,
  } = useUIStore();

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Command/Ctrl + / to open shortcuts modal
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        setShowShortcutsModal(true);
      }
      // Escape to close shortcuts modal
      if (e.key === "Escape" && showShortcutsModal) {
        setShowShortcutsModal(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showShortcutsModal, setShowShortcutsModal]);

  return (
    <>
      <div className="flex justify-between items-center py-2 px-3 border-t border-zinc-800/80 w-full">
        <div className="flex items-center space-x-4">
          <Tippy
            content={
              <span className="text-[10px] font-semibold">
                {sidebarExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
              </span>
            }
            placement="top"
            theme="light">
            <button
              onClick={toggleSidebar}
              className="text-zinc-400 hover:text-white transition-colors">
              {sidebarExpanded ? (
                <PanelLeftOpen size={16} />
              ) : (
                <PanelRight size={16} />
              )}
            </button>
          </Tippy>

          <IconButton name="Interceptor" direction="top">
            <ShieldCheck size={16} />
          </IconButton>
        </div>

        <div className="flex items-center space-x-4">
          <Tippy
            content={<FeedBackModal />}
            visible={showFeedbackModal}
            onClickOutside={() => setShowFeedbackModal(false)}
            placement="top"
            theme="popover"
            interactive={true}
            arrow={true}
            maxWidth={350}
            className="!bg-[#1b1b1b] rounded-xl border border-zinc-800 mb-[6px] w-[240px]">
            <button
              onClick={() => setShowFeedbackModal(!showFeedbackModal)}
              className="flex items-center space-x-2 text-xs font-semibold text-zinc-400 hover:text-white transition me-10">
              <CircleHelp size={16} />
              <span>Help & feedback</span>
            </button>
          </Tippy>

          <Tippy
            content={
              <span className="text-[10px] font-semibold">
                Shortcuts
                <span className="bg-gray-400 rounded-[2px] mx-1 px-1">⌘</span>
                <span className="bg-gray-400 rounded-[2px] px-1">/</span>
              </span>
            }
            placement="top"
            theme="light">
            <button
              onClick={() => setShowShortcutsModal(true)}
              className="text-gray-400 hover:text-white transition-colors">
              <Zap size={17} />
            </button>
          </Tippy>

          <IconButton name="Share" direction="top">
            <Share2 size={17} />
          </IconButton>

          <Tippy
            content={
              <span className="text-[10px] font-semibold">
                {layoutMode === "horizontal"
                  ? "Switch to Vertical Layout"
                  : "Switch to Horizontal Layout"}
              </span>
            }
            placement="top"
            theme="light">
            <button
              onClick={toggleLayoutMode}
              className="text-zinc-400 hover:text-white transition-colors">
              <Columns2 size={17} />
            </button>
          </Tippy>

          <IconButton name="Collapse Sidebar" direction="top">
            <PanelLeftOpen size={17} />
          </IconButton>
        </div>
      </div>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />
    </>
  );
};

export default Footer;
