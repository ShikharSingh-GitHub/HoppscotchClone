import React from "react";
import useRequestStore from "../../store/store";
import ScriptEditor from "./ScriptEditor";

const PreRequestScript = () => {
  const { activeTab, updateTab } = useRequestStore();

  const handleScriptChange = (script) => {
    if (activeTab) {
      updateTab(activeTab.id, {
        preRequestScript: script,
      });
    }
  };

  return (
    <ScriptEditor
      type="pre-request"
      script={activeTab?.preRequestScript || ""}
      onScriptChange={handleScriptChange}
    />
  );
};

export default PreRequestScript;
