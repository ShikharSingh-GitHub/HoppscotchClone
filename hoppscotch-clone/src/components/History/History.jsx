import Tippy from "@tippyjs/react";
import { formatDistanceToNow, isToday, isYesterday, subDays } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import "tippy.js/dist/tippy.css";
import useHistoryStore from "../../store/historyStore";

// Group history entries by time period
const groupHistoryByDate = (historyItems) => {
  const groups = {};

  historyItems.forEach((item) => {
    const date = new Date(item.timestamp);
    let groupKey;

    if (isToday(date)) {
      const minutesAgo = Math.round((new Date() - date) / (1000 * 60));
      if (minutesAgo < 60) {
        groupKey = `${minutesAgo} minutes ago`;
      } else {
        const hoursAgo = Math.round(minutesAgo / 60);
        groupKey = `${hoursAgo} ${hoursAgo === 1 ? "hour" : "hours"} ago`;
      }
    } else if (isYesterday(date)) {
      groupKey = "Yesterday";
    } else if (date > subDays(new Date(), 7)) {
      groupKey = formatDistanceToNow(date, { addSuffix: false }) + " ago";
    } else {
      groupKey = date.toLocaleDateString();
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }

    groups[groupKey].push(item);
  });

  return Object.entries(groups).map(([date, items]) => ({
    date,
    items,
  }));
};

const History = () => {
  const {
    history,
    loading,
    error,
    fetchHistory,
    deleteHistoryEntry,
    toggleHistoryStar,
    clearAllHistory,
    restoreFromHistory,
  } = useHistoryStore();

  const [expandedGroups, setExpandedGroups] = useState({});

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Memoize the grouped history to prevent unnecessary re-renders
  const groupedHistory = useMemo(() => {
    return groupHistoryByDate(history || []);
  }, [history]);

  // Initialize all groups as expanded - use history length as dependency
  useEffect(() => {
    if (history && history.length > 0) {
      const initialExpanded = {};
      groupedHistory.forEach((group) => {
        initialExpanded[group.date] = true;
      });
      setExpandedGroups(initialExpanded);
    }
  }, [history?.length, groupedHistory]);

  const handleRestoreRequest = (entry) => {
    console.log("Restoring request from history:", entry);
    console.log("Tab info - ID:", entry.tabId, "Title:", entry.tabTitle);
    restoreFromHistory(entry);
  };

  const handleDeleteEntry = async (id) => {
    try {
      await deleteHistoryEntry(id);
    } catch (error) {
      console.error("Failed to delete entry:", error);
    }
  };

  const handleToggleStar = async (id) => {
    try {
      await toggleHistoryStar(id);
    } catch (error) {
      console.error("Failed to toggle star:", error);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm("Are you sure you want to clear all history?")) {
      try {
        await clearAllHistory();
      } catch (error) {
        console.error("Failed to clear history:", error);
      }
    }
  };

  const handleDeleteGroup = (date) => {
    if (window.confirm(`Delete all entries from "${date}"?`)) {
      const group = groupedHistory.find((group) => group.date === date);
      if (group && group.items) {
        group.items.forEach((entry) => {
          deleteHistoryEntry(entry.id);
        });
      }
    }
  };

  const toggleGroupExpansion = (date) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
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
    };
    return colors[method] || "text-gray-500";
  };

  const getMethodResponseClass = (method) => {
    // All methods get success-response class in original design
    return "success-response";
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-400">Loading history...</div>
    );
  }

  if (error) {
    return <div className="p-4 text-center text-red-400">Error: {error}</div>;
  }

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden">
      {/* Breadcrumb */}
      <div className="flex justify-between border-b border-dividerLight px-4 py-2 text-tiny text-secondaryLight">
        <div className="flex items-center overflow-x-auto whitespace-nowrap">
          <span className="truncate">Personal Workspace</span>
          <svg
            viewBox="0 0 24 24"
            width="1.2em"
            height="1.2em"
            className="mx-2">
            <path
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m9 18l6-6l-6-6"
            />
          </svg>
          <span>History</span>
        </div>
      </div>

      {/* Search and Actions Bar */}
      <div className="sticky top-0 z-10 flex flex-shrink-0 flex-col overflow-x-auto border-b border-dividerLight bg-primary">
        <div className="flex">
          <input
            type="search"
            autoComplete="off"
            className="flex w-full bg-transparent px-4 py-2 h-8 text-secondaryLight placeholder-secondaryLight focus:outline-none"
            placeholder="Search"
          />
          <div className="flex">
            {/* Help/Documentation Link */}
            <a
              aria-label="Link"
              href="https://docs.hoppscotch.io/documentation/features/history"
              role="button"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-secondary hover:text-secondaryDark focus-visible:text-secondaryDark p-2"
              tabIndex="0">
              <span className="inline-flex items-center justify-center whitespace-nowrap">
                <svg
                  viewBox="0 0 24 24"
                  width="1.2em"
                  height="1.2em"
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
                <div className="truncate max-w-[16rem]"></div>
              </span>
            </a>

            {/* Filter Button */}
            <Tippy content="Filter history" placement="bottom" theme="light">
              <span data-v-tippy="" aria-expanded="false">
                <button
                  aria-label="button"
                  role="button"
                  className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-secondary hover:text-secondaryDark focus-visible:text-secondaryDark p-2"
                  tabIndex="0">
                  <span className="inline-flex items-center justify-center whitespace-nowrap">
                    <svg
                      viewBox="0 0 24 24"
                      width="1.2em"
                      height="1.2em"
                      className="svg-icons">
                      <path
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M22 3H2l8 9.46V19l4 2v-8.54z"
                      />
                    </svg>
                    <div className="truncate max-w-[16rem]"></div>
                  </span>
                </button>
              </span>
            </Tippy>

            {/* Clear History Button */}
            <button
              aria-label="button"
              role="button"
              className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-secondary hover:text-secondaryDark focus-visible:text-secondaryDark p-2"
              tabIndex="0"
              data-testid="clear_history"
              onClick={handleClearAll}>
              <span className="inline-flex items-center justify-center whitespace-nowrap">
                <svg
                  viewBox="0 0 24 24"
                  width="1.2em"
                  height="1.2em"
                  className="svg-icons">
                  <path
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2m-6 5v6m4-6v6"
                  />
                </svg>
                <div className="truncate max-w-[16rem]"></div>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* History Content */}
      <div className="flex-1 overflow-y-auto">
        {!history || history.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-4 h-full min-h-[200px]">
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
            <span className="max-w-sm mt-2 text-center whitespace-normal text-tiny text-secondaryLight">
              History is empty
            </span>
            <p className="text-center text-secondaryLight text-tiny mt-2 max-w-sm">
              Start making requests to see them here
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {groupedHistory.map((group) => (
              <details
                key={group.date}
                className="flex flex-col"
                open={expandedGroups[group.date]}>
                <summary
                  className="group flex min-w-0 flex-1 cursor-pointer items-center justify-between text-tiny text-secondaryLight transition focus:outline-none"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleGroupExpansion(group.date);
                  }}>
                  <span className="inline-flex items-center justify-center truncate px-4 py-2 transition group-hover:text-secondary">
                    <svg
                      viewBox="0 0 24 24"
                      width="1.2em"
                      height="1.2em"
                      className="indicator mr-2 flex flex-shrink-0">
                      <path
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m9 18l6-6l-6-6"
                        style={{
                          transform: expandedGroups[group.date]
                            ? "rotate(90deg)"
                            : "rotate(0deg)",
                          transition: "transform 0.2s ease",
                        }}
                      />
                    </svg>
                    <span className="capitalize-first truncate">
                      {group.date.toLowerCase()}
                    </span>
                  </span>

                  <button
                    aria-label="button"
                    role="button"
                    className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-red-500 hover:text-red-600 focus-visible:text-red-600 p-2 hidden group-hover:inline-flex"
                    tabIndex="0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteGroup(group.date);
                    }}>
                    <span className="inline-flex items-center justify-center whitespace-nowrap">
                      <svg
                        viewBox="0 0 24 24"
                        width="1.2em"
                        height="1.2em"
                        className="svg-icons">
                        <path
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"
                        />
                      </svg>
                      <div className="truncate max-w-[16rem]"></div>
                    </span>
                  </button>
                </summary>

                {/* History Items */}
                {group.items.map((entry, index) => (
                  <div
                    key={entry.id || index}
                    className="group flex items-stretch"
                    id={entry.id || index}>
                    <span
                      className={`flex w-16 cursor-pointer items-center justify-center truncate px-2 ${getMethodResponseClass(
                        entry.method
                      )}`}
                      onClick={() => handleRestoreRequest(entry)}
                      data-testid="restore_history_entry">
                      <span
                        className={`truncate text-tiny font-semibold ${getMethodColor(
                          entry.method
                        )}`}>
                        {entry.method}
                      </span>
                    </span>

                    <span
                      className="flex min-w-0 flex-1 cursor-pointer py-2 pr-2 transition group-hover:text-secondaryDark"
                      onClick={() => handleRestoreRequest(entry)}
                      data-testid="restore_history_entry">
                      <span className="truncate text-sm">{entry.url}</span>
                    </span>

                    <span>
                      <span data-v-tippy="" aria-expanded="false"></span>
                    </span>

                    <button
                      aria-label="button"
                      role="button"
                      className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-red-500 hover:text-red-600 focus-visible:text-red-600 p-2 hidden group-hover:inline-flex"
                      tabIndex="0"
                      data-testid="delete_history_entry"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEntry(entry.id);
                      }}>
                      <span className="inline-flex items-center justify-center whitespace-nowrap">
                        <svg
                          viewBox="0 0 24 24"
                          width="1.2em"
                          height="1.2em"
                          className="svg-icons">
                          <path
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"
                          />
                        </svg>
                        <div className="truncate max-w-[16rem]"></div>
                      </span>
                    </button>

                    <button
                      aria-label="button"
                      role="button"
                      className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-yellow-500 hover:text-yellow-600 focus-visible:text-yellow-600 p-2 hidden group-hover:inline-flex"
                      tabIndex="0"
                      data-testid="star_button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStar(entry.id);
                      }}>
                      <span className="inline-flex items-center justify-center whitespace-nowrap">
                        <svg
                          viewBox="0 0 24 24"
                          width="1.2em"
                          height="1.2em"
                          className="svg-icons">
                          <path
                            fill={entry.is_starred ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="m12 2l3.09 6.26L22 9.27l-5 4.87l1.18 6.88L12 17.77l-6.18 3.25L7 14.14L2 9.27l6.91-1.01z"
                          />
                        </svg>
                        <div className="truncate max-w-[16rem]"></div>
                      </span>
                    </button>
                  </div>
                ))}
              </details>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
