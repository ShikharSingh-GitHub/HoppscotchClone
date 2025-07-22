import Tippy from "@tippyjs/react";
import { useState } from "react";
import HistoryItem from "./HistoryItem";

const HistoryGroup = ({
  groupDate,
  entries,
  onDelete,
  onToggleStar,
  onRestore,
  onDeleteGroup,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <details className="flex flex-col" open={isExpanded}>
      <summary
        className="group flex min-w-0 flex-1 cursor-pointer items-center justify-between text-xxs text-secondaryLight transition focus:outline-none"
        onClick={(e) => {
          e.preventDefault();
          setIsExpanded(!isExpanded);
        }}>
        <span className="inline-flex items-center justify-center truncate px-4 py-1.5 transition group-hover:text-white">
          <svg
            viewBox="0 0 24 24"
            width="1em"
            height="1em"
            className="mr-2 flex flex-shrink-0">
            <path
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={isExpanded ? "M19 9l-7 7-7-7" : "M9 18l6-6-6-6"}
            />
          </svg>
          <span className="capitalize-first truncate text-xxs">
            {groupDate.toLowerCase()}
          </span>
        </span>

        {/* Delete group button with tooltip - only visible on hover */}
        <Tippy
          content="Delete group"
          placement="top"
          theme="light"
          className="tooltip-small"
          arrow={false}>
          <button
            aria-label="Delete history group"
            role="button"
            exact="true"
            className="opacity-0 group-hover:opacity-100 inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-red-500 hover:text-red-600 focus-visible:text-red-600 p-1.5"
            tabIndex="0"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteGroup(groupDate);
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
      </summary>

      {entries.map((entry) => (
        <HistoryItem
          key={entry.id}
          entry={entry}
          onDelete={onDelete}
          onToggleStar={onToggleStar}
          onRestore={onRestore}
        />
      ))}
    </details>
  );
};

export default HistoryGroup;
