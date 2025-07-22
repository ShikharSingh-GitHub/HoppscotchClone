import Tippy from "@tippyjs/react";
import { format } from "date-fns";

// Get appropriate color for HTTP method
export const getMethodColor = (method) => {
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

// Format date for tooltip - using abbreviated month format (3 letters)
const formatTooltipDate = (timestamp) => {
  const date = new Date(timestamp);
  const fullDate = format(date, "MMM d, yyyy"); // Jul 1, 2023
  const time = format(date, "h:mm:ss a"); // 12:00:00 AM

  return `${fullDate}, ${time}`;
};

const HistoryItem = ({ entry, onDelete, onToggleStar, onRestore }) => {
  // Handle clicking on a history item to restore it
  const handleRestore = () => {
    // Check if we have stored tab information
    if (entry.tabId) {
      // Call restore with tab information
      onRestore(entry, { tabId: entry.tabId, tabTitle: entry.tabTitle });
    } else {
      // Otherwise just call regular restore
      onRestore(entry);
    }
  };

  return (
    <div className="group flex items-stretch" id={entry.id}>
      <span
        className="flex w-16 cursor-pointer items-center justify-center truncate px-2"
        onClick={handleRestore}
        data-testid="restore_history_entry">
        <span
          className={`truncate text-xxs font-semibold ${getMethodColor(
            entry.method
          )}`}>
          {entry.method}
        </span>
      </span>

      <Tippy
        content={formatTooltipDate(entry.timestamp)}
        placement="top"
        theme="light"
        className="tooltip-small"
        arrow={false}>
        <span
          className="flex min-w-0 flex-1 cursor-pointer py-1.5 pr-2 transition text-secondaryLight group-hover:text-white"
          onClick={handleRestore}
          data-testid="restore_history_entry">
          <span className="truncate text-xs">{entry.url}</span>
        </span>
      </Tippy>

      <span>
        <span data-v-tippy="" aria-expanded="false"></span>
      </span>

      {/* Delete button with tooltip - only visible on hover */}
      <Tippy
        content="Delete"
        placement="top"
        theme="light"
        className="tooltip-small"
        arrow={false}>
        <button
          aria-label="Delete history entry"
          role="button"
          exact="true"
          className="opacity-0 group-hover:opacity-100 inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-red-500 hover:text-red-600 focus-visible:text-red-600 p-1.5"
          tabIndex="0"
          data-testid="delete_history_entry"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(entry.id);
          }}>
          <span className="inline-flex items-center justify-center whitespace-nowrap">
            <svg
              viewBox="0 0 24 24"
              width="1em"
              height="1em"
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
      </Tippy>

      {/* Star button with tooltip - only visible on hover */}
      <Tippy
        content={entry.is_starred ? "Unstar" : "Star"}
        placement="top"
        theme="light"
        className="tooltip-small"
        arrow={false}>
        <button
          aria-label="Star history entry"
          role="button"
          exact="true"
          className={`opacity-0 group-hover:opacity-100 inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none ${
            entry.is_starred
              ? "text-yellow-400 hover:text-yellow-500"
              : "text-yellow-500 hover:text-yellow-600"
          } p-1.5`}
          tabIndex="0"
          data-testid="star_button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleStar(entry.id);
          }}>
          <span className="inline-flex items-center justify-center whitespace-nowrap">
            <svg
              viewBox="0 0 24 24"
              width="1em"
              height="1em"
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
      </Tippy>
    </div>
  );
};

export default HistoryItem;
