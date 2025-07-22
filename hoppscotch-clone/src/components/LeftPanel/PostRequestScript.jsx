import Tippy from "@tippyjs/react";
import { useEffect, useRef, useState } from "react";

const PostRequestScript = () => {
  const [script, setScript] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const editorRef = useRef(null);
  const cursorRef = useRef(null);

  // Handle script changes
  const handleScriptChange = (e) => {
    const value = e.target.innerText || "";
    if (value !== script) {
      setScript(value);
    }
  };

  // Focus the editor when clicking
  const handleEditorClick = () => {
    if (editorRef.current) {
      editorRef.current.focus();
      setIsFocused(true);
    }
  };

  // Set up cursor blinking effect
  useEffect(() => {
    if (isFocused && cursorRef.current) {
      cursorRef.current.style.visibility = "visible";

      const blinkInterval = setInterval(() => {
        if (cursorRef.current) {
          cursorRef.current.style.visibility =
            cursorRef.current.style.visibility === "visible"
              ? "hidden"
              : "visible";
        }
      }, 600);

      return () => clearInterval(blinkInterval);
    } else if (cursorRef.current) {
      cursorRef.current.style.visibility = "hidden";
    }
  }, [isFocused]);

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 flex flex-shrink-0 items-center justify-between overflow-x-auto border-b border-zinc-700/30 bg-primary pl-4">
        <label className="truncate font-semibold text-zinc-300 text-xs">
          JavaScript Code
        </label>
        <div className="flex">
          {/* Documentation button */}
          <Tippy
            content={
              <span className="text-[10px] font-semibold">Documentation</span>
            }
            placement="top"
            theme="light">
            <a
              href="https://docs.hoppscotch.io/documentation/getting-started/rest/tests"
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

          {/* Clear button */}
          <Tippy
            content={<span className="text-[10px] font-semibold">Clear</span>}
            placement="top"
            theme="light">
            <button
              className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-zinc-400 hover:text-white p-2 text-xs"
              tabIndex="0"
              onClick={() => setScript("")}>
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

          {/* Format code button */}
          <Tippy
            content={<span className="text-[10px] font-semibold">Format</span>}
            placement="top"
            theme="light">
            <button
              className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-blue-500 hover:text-blue-600 p-2 text-xs"
              tabIndex="0">
              <span className="inline-flex items-center justify-center whitespace-nowrap">
                <svg viewBox="0 0 24 24" width="1em" height="1em">
                  <g
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2">
                    <path d="M3 6h18M3 12h15a3 3 0 1 1 0 6h-4"></path>
                    <path d="m16 16l-2 2l2 2M3 18h7"></path>
                  </g>
                </svg>
              </span>
            </button>
          </Tippy>

          {/* Magic wand button */}
          <Tippy
            content={
              <span className="text-[10px] font-semibold">Add Snippet</span>
            }
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
                    d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0zM20 3v4m2-2h-4M4 17v2m1-1H3"
                  />
                </svg>
              </span>
            </button>
          </Tippy>
        </div>
      </div>

      {/* Content area with split view */}
      <div className="flex flex-1 border-b border-zinc-700/30">
        {/* Left side: Code editor - 2/3 width */}
        <div className="w-2/3 border-r border-zinc-700/30 h-full relative">
          <div className="h-full absolute inset-0 ph-no-capture">
            {/* CodeMirror-like editor structure */}
            <div className="cm-editor ͼ1 ͼ2 ͼ4 ͼr">
              <div className="cm-announced" aria-live="polite"></div>
              <div
                tabIndex="-1"
                className="cm-scroller"
                onClick={handleEditorClick}>
                {/* Gutters - simplified and made smaller */}
                <div
                  className="cm-gutters"
                  aria-hidden="true"
                  style={{ minHeight: "24.7969px", position: "sticky" }}>
                  <div className="cm-gutter cm-lineNumbers">
                    <div
                      className="cm-gutterElement"
                      style={{
                        height: "0px",
                        visibility: "hidden",
                        pointerEvents: "none",
                      }}>
                      {/* Hidden placeholder */}
                    </div>
                    <div
                      className="cm-gutterElement cm-activeLineGutter text-zinc-500 text-[9px]"
                      style={{ height: "16.7969px", marginTop: "4px" }}>
                      {/* Small static line number */}1
                    </div>
                  </div>
                  <div className="cm-gutter cm-foldGutter">
                    <div
                      className="cm-gutterElement"
                      style={{
                        height: "0px",
                        visibility: "hidden",
                        pointerEvents: "none",
                      }}>
                      <span title="Unfold line">▸</span>
                    </div>
                    <div
                      className="cm-gutterElement cm-activeLineGutter"
                      style={{ height: "16.7969px", marginTop: "4px" }}></div>
                  </div>
                </div>

                {/* Content area - simplified placeholder */}
                <div
                  ref={editorRef}
                  spellCheck="false"
                  autoCorrect="off"
                  autoCapitalize="off"
                  translate="no"
                  contentEditable="true"
                  className="cm-content cm-lineWrapping"
                  role="textbox"
                  aria-multiline="true"
                  data-enable-grammarly="false"
                  data-language="javascript"
                  aria-autocomplete="list"
                  style={{ tabSize: 4 }}
                  onInput={handleScriptChange}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}>
                  <div className="cm-activeLine cm-line">
                    <img className="cm-widgetBuffer" aria-hidden="true" />
                    {!script && (
                      <span
                        className="cm-placeholder text-zinc-500 text-[10px]"
                        aria-label="placeholder JavaScript Code"
                        contentEditable="false"
                        style={{ pointerEvents: "none" }}>
                        Write script...
                      </span>
                    )}
                    {script && script}
                    <br />
                  </div>
                </div>

                {/* Cursor layer - exactly matching original structure */}
                <div
                  className="cm-layer cm-layer-above cm-cursorLayer"
                  aria-hidden="true"
                  style={{ zIndex: 150, animationDuration: "1200ms" }}>
                  <div
                    ref={cursorRef}
                    className="cm-cursor cm-cursor-primary"
                    style={{
                      left: "69px",
                      top: "4px",
                      height: "16px",
                    }}
                  />
                </div>

                {/* Selection layer - exactly matching original structure */}
                <div
                  className="cm-layer cm-selectionLayer"
                  aria-hidden="true"
                  style={{ zIndex: -2 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right side panel - documentation and snippets */}
        <div className="z-[9] sticky top-0 h-full min-w-[12rem] max-w-1/3 flex-shrink-0 overflow-auto overflow-x-auto bg-primary p-4">
          <div className="pb-2 text-zinc-400 text-xs">
            Post-request scripts are written in JavaScript, and are run after
            the response is received.
          </div>

          <a
            href="https://docs.hoppscotch.io/documentation/getting-started/rest/tests"
            target="_blank"
            rel="noopener"
            className="inline-flex items-center justify-center text-zinc-300 hover:text-white focus-visible:text-white text-xs"
            tabIndex="0">
            Read documentation
          </a>

          <h4 className="pt-6 font-bold text-zinc-300 text-xs">Snippets</h4>

          <div className="flex flex-col pt-4">
            {/* Snippet buttons */}
            {[
              "Environment: Set an environment variable",
              "Response: Status code is 200",
              "Response: Assert property from body",
              "Status code: Status code is 2xx",
              "Status code: Status code is 3xx",
              "Status code: Status code is 4xx",
              "Status code: Status code is 5xx",
            ].map((snippet, index) => (
              <button
                key={index}
                className="inline-flex transform items-center py-2 font-semibold transition hover:translate-x-2 focus:outline-none focus-visible:translate-x-2 px-4 text-blue-500 hover:text-blue-600 focus-visible:text-blue-600 text-xs"
                type="button">
                <div className="max-w-[16rem] truncate">{snippet}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostRequestScript;
