import Tippy from "@tippyjs/react";
import { useState } from "react";

const Authorization = () => {
  const [authType, setAuthType] = useState("Inherit");
  const [isEnabled, setIsEnabled] = useState(true);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col">
        {/* Authorization Type Header */}
        <div className="sticky top-0 z-10 flex flex-shrink-0 items-center justify-between overflow-x-auto border-b border-zinc-700/30 bg-primary pl-4">
          <span className="flex items-center">
            <label className="truncate font-semibold text-zinc-300 text-xs">
              Authorization Type
            </label>
            <div className="relative">
              <button
                className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-zinc-400 hover:text-white rounded px-3 py-1.5 ml-2 text-xs"
                tabIndex="0">
                <span className="inline-flex items-center justify-center whitespace-nowrap">
                  <div className="truncate max-w-[14rem]">{authType}</div>
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
          </span>

          <div className="flex">
            {/* Enabled checkbox */}
            <div
              className="group inline-flex cursor-pointer flex-nowrap items-center justify-center transition hover:text-white px-2"
              role="checkbox"
              aria-checked={isEnabled}
              onClick={() => setIsEnabled(!isEnabled)}>
              <input
                id="auth-enabled-checkbox"
                type="checkbox"
                name="checkbox"
                className="checkbox"
                checked={isEnabled}
                onChange={() => {}}
              />
              <label
                htmlFor="auth-enabled-checkbox"
                className="cursor-pointer truncate pl-0 align-middle font-semibold text-xs ml-1">
                Enabled
              </label>
            </div>

            {/* Help button */}
            <Tippy
              content={
                <span className="text-[10px] font-semibold">Documentation</span>
              }
              placement="top"
              theme="light">
              <a
                href="https://docs.hoppscotch.io/documentation/features/authorization"
                target="_blank"
                rel="noopener"
                className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-zinc-400 hover:text-white p-2 text-xs"
                tabIndex="0">
                <span className="inline-flex items-center justify-center whitespace-nowrap">
                  <svg viewBox="0 0 24 24" width="1em" height="1em">
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
                </span>
              </a>
            </Tippy>

            {/* Delete button */}
            <Tippy
              content={<span className="text-[10px] font-semibold">Clear</span>}
              placement="top"
              theme="light">
              <button
                className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-zinc-400 hover:text-white p-2 text-xs"
                tabIndex="0">
                <span className="inline-flex items-center justify-center whitespace-nowrap">
                  <svg viewBox="0 0 24 24" width="1em" height="1em">
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2m-6 5v6m4-6v6"
                    />
                  </svg>
                </span>
              </button>
            </Tippy>
          </div>
        </div>

        {/* Content section with left and right panels */}
        <div className="flex flex-1 border-b border-zinc-700/30">
          {/* Left panel - 2/3 width */}
          <div className="w-2/3 border-r border-zinc-700/30">
            <div className="p-4">
              <span className="text-xs text-zinc-400">
                Please save this request in any collection to inherit the
                authorization
              </span>
            </div>
          </div>

          {/* Right panel - 1/3 width */}
          <div className="z-[9] sticky top-upperTertiaryStickyFold h-full min-w-[12rem] max-w-1/3 flex-shrink-0 overflow-auto overflow-x-auto bg-primary p-4">
            <div className="pb-2 text-zinc-400 text-xs">
              The authorization header will be automatically generated when you
              send the request.
            </div>
            <a
              href="https://docs.hoppscotch.io/documentation/features/authorization"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center justify-center text-zinc-300 focus:outline-none hover:text-white focus-visible:text-white flex-row-reverse text-xs"
              tabIndex="0">
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
              Learn how
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Authorization;
