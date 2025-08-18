import Tippy from "@tippyjs/react";
import { Code, Copy, ExternalLink, Info, Play, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import useRequestStore from "../../store/store";

const ScriptEditor = ({
  type = "pre-request", // 'pre-request' or 'post-request'
  script,
  onScriptChange,
  documentation = {},
}) => {
  const { activeTab } = useRequestStore();
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);
  const contentRef = useRef(null);

  // Default documentation based on type
  const defaultDocs = {
    "pre-request": {
      title: "Pre-request scripts",
      description:
        "Pre-request scripts are written in JavaScript, and are run before the request is sent.",
      docsUrl:
        "https://docs.hoppscotch.io/documentation/getting-started/rest/pre-request-scripts",
    },
    "post-request": {
      title: "Post-request scripts",
      description:
        "Post-request scripts are written in JavaScript, and are run after the response is received.",
      docsUrl:
        "https://docs.hoppscotch.io/documentation/getting-started/rest/tests",
    },
  };

  const docs = { ...defaultDocs[type], ...documentation };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [script]);

  const handleEditorClick = () => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const sampleScripts = [
    {
      title: "Set environment variable",
      code: `pw.env.set("variable_name", "variable_value");`,
    },
    {
      title: "Get environment variable",
      code: `const value = pw.env.get("variable_name");`,
    },
    {
      title: "Log to console",
      code: `console.log("Debug message:", value);`,
    },
    ...(type === "post-request"
      ? [
          {
            title: "Test status code",
            code: `pw.test("Status code is 200", () => {
  pw.expect(pw.response.status).toBe(200);
});`,
          },
          {
            title: "Test response time",
            code: `pw.test("Response time < 500ms", () => {
  pw.expect(pw.response.responseTime).toBeLessThan(500);
});`,
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col h-full bg-primary">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700/30">
        <div className="flex items-center space-x-2">
          <Code size={16} className="text-blue-400" />
          <h3 className="text-sm font-medium text-white capitalize">
            {docs.title}
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <Tippy content="Documentation">
            <button className="p-1.5 text-zinc-400 hover:text-white transition-colors">
              <a
                href={docs.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center">
                <ExternalLink size={14} />
              </a>
            </button>
          </Tippy>

          <Tippy content="Clear script">
            <button
              onClick={() => onScriptChange("")}
              className="p-1.5 text-zinc-400 hover:text-white transition-colors">
              <RotateCcw size={14} />
            </button>
          </Tippy>

          <Tippy content="Run script">
            <button className="p-1.5 text-zinc-400 hover:text-white transition-colors">
              <Play size={14} />
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
                    {script.split("\n").map((_, index) => (
                      <div
                        key={index}
                        className="cm-gutterElement"
                        style={{ height: "1.4em" }}>
                        {index + 1}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div
                  className="cm-content"
                  role="textbox"
                  style={{ position: "relative" }}>
                  <textarea
                    ref={textareaRef}
                    value={script}
                    onChange={(e) => onScriptChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={`// Write your ${type.replace(
                      "-",
                      " "
                    )} script here...
// Available objects: pw.env, pw.request${
                      type === "post-request" ? ", pw.response" : ""
                    }
// Example: pw.env.set("token", "value");`}
                    className="w-full h-full bg-transparent text-white font-mono text-sm resize-none border-none outline-none"
                    style={{
                      minHeight: "300px",
                      padding: "12px",
                      lineHeight: "1.4em",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side panel - 1/3 width */}
        <div className="w-1/3 bg-zinc-900/50 flex flex-col">
          {/* Documentation Section */}
          <div className="p-4 border-b border-zinc-700/30">
            <div className="flex items-start space-x-2 mb-3">
              <Info size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-white mb-1">About</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {docs.description}
                </p>
              </div>
            </div>

            <a
              href={docs.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs text-blue-400 hover:text-blue-300 transition-colors">
              <ExternalLink size={12} className="mr-1" />
              Learn more
            </a>
          </div>

          {/* Code Snippets */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <h4 className="text-sm font-medium text-white mb-3">
                Code snippets
              </h4>
              <div className="space-y-3">
                {sampleScripts.map((snippet, index) => (
                  <div key={index} className="group">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-zinc-300">
                        {snippet.title}
                      </span>
                      <Tippy content="Copy snippet">
                        <button
                          onClick={() => {
                            const currentScript = script || "";
                            const newScript =
                              currentScript +
                              (currentScript ? "\n\n" : "") +
                              snippet.code;
                            onScriptChange(newScript);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-white transition-all">
                          <Copy size={12} />
                        </button>
                      </Tippy>
                    </div>
                    <div className="bg-zinc-800/50 rounded p-2 border border-zinc-700/50">
                      <pre className="text-xs text-zinc-300 font-mono whitespace-pre-wrap break-all">
                        {snippet.code}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScriptEditor;
