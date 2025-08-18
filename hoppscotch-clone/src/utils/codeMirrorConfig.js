import { closeBrackets } from "@codemirror/autocomplete";
import { defaultKeymap } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { bracketMatching, foldGutter } from "@codemirror/language";
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView, keymap, lineNumbers } from "@codemirror/view";
import { createTheme } from "@uiw/codemirror-themes";

// Shared CodeMirror theme configuration
export const hoppscotchTheme = createTheme({
  theme: "dark",
  settings: {
    background: "#1e1e1e",
    foreground: "#d4d4d4",
    caret: "#f0f0f0",
    selection: "#264f78",
    selectionMatch: "#264f78",
    lineHighlight: "#2a2a2a",
    gutterBackground: "#1e1e1e",
    gutterForeground: "#858585",
  },
  styles: [
    { tag: "comment", color: "#6A9955", fontStyle: "italic" },
    { tag: "keyword", color: "#569CD6" },
    { tag: "string", color: "#CE9178" },
    { tag: "number", color: "#B5CEA8" },
    { tag: "boolean", color: "#569CD6" },
    { tag: "null", color: "#569CD6" },
    { tag: "propertyName", color: "#9CDCFE" },
    { tag: "operator", color: "#D4D4D4" },
    { tag: "punctuation", color: "#D4D4D4" },
    { tag: "bracket", color: "#FFD700" },
  ],
});

// Common extensions for JSON editors
export const jsonExtensions = [
  json(),
  lineNumbers(),
  foldGutter(),
  bracketMatching(),
  closeBrackets(),
  highlightSelectionMatches(),
  keymap.of([...defaultKeymap, ...searchKeymap]),
  EditorView.theme({
    "&": { fontSize: "12px" },
    ".cm-content": { padding: "12px", minHeight: "200px" },
    ".cm-editor": { borderRadius: "0px" },
    ".cm-focused": { outline: "none" },
    ".cm-gutters": {
      backgroundColor: "#1e1e1e",
      borderRight: "1px solid #2a2a2a",
    },
    ".cm-lineNumbers": { color: "#858585", fontSize: "10px" },
    ".cm-activeLine": { backgroundColor: "#2a2a2a" },
  }),
];

// Common extensions for JavaScript editors
export const javascriptExtensions = [
  javascript(),
  lineNumbers(),
  foldGutter(),
  bracketMatching(),
  closeBrackets(),
  highlightSelectionMatches(),
  keymap.of([...defaultKeymap, ...searchKeymap]),
  EditorView.theme({
    "&": { fontSize: "12px" },
    ".cm-content": { padding: "12px", minHeight: "200px" },
    ".cm-editor": { borderRadius: "0px" },
    ".cm-focused": { outline: "none" },
    ".cm-gutters": {
      backgroundColor: "#1e1e1e",
      borderRight: "1px solid #2a2a2a",
    },
    ".cm-lineNumbers": { color: "#858585", fontSize: "10px" },
    ".cm-activeLine": { backgroundColor: "#2a2a2a" },
  }),
];

// Export individual imports for backward compatibility
export {
  bracketMatching,
  closeBrackets,
  createTheme,
  defaultKeymap,
  EditorView,
  foldGutter,
  highlightSelectionMatches,
  javascript,
  json,
  keymap,
  lineNumbers,
  oneDark,
  searchKeymap,
};
