import Tippy from "@tippyjs/react";
import { useState } from "react";

const Body = () => {
  const [contentType, setContentType] = useState("none");

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col">
        {/* Content Type Selector Header */}
        <div className="sticky top-0 z-10 flex flex-shrink-0 items-center justify-between overflow-x-auto border-b border-zinc-700/30 bg-primary pl-4">
          <span className="flex items-center">
            <label className="truncate font-semibold text-zinc-300 text-xs">
              Content Type
            </label>
            <div className="relative">
              <button
                className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-zinc-400 hover:text-white rounded px-3 py-1.5 ml-2 text-xs"
                tabIndex="0">
                <span className="inline-flex items-center justify-center whitespace-nowrap">
                  <div className="truncate max-w-[14rem]">None</div>
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
            </div>

            {/* Override button */}
            <Tippy
              content={
                <span className="text-[10px] font-semibold">Override</span>
              }
              placement="top"
              theme="light">
              <button
                className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-zinc-400 hover:text-white rounded px-2 py-1 border border-zinc-700 hover:border-zinc-600 bg-search-bg hover:bg-search-bg-hover text-xs"
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
                  <div className="truncate max-w-[14rem]">Override</div>
                </span>
              </button>
            </Tippy>
          </span>
        </div>

        {/* Empty state - with custom SVG instead of image */}
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
            <a
              href="https://docs.hoppscotch.io/documentation/getting-started/rest/uploading-data"
              target="_blank"
              rel="noopener"
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
                    d="M15 3h6v6m-11 5L21 3m-3 10v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
                  />
                </svg>
                <div className="truncate max-w-[14rem]">Documentation</div>
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Body;
