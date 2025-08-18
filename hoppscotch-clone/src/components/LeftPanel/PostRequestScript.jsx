import React from "react";
import useRequestStore from "../../store/store";
import ScriptEditor from "./ScriptEditor";

const PostRequestScript = () => {
  const { activeTab, updateTab } = useRequestStore();

  const handleScriptChange = (script) => {
    if (activeTab) {
      updateTab(activeTab.id, {
        postRequestScript: script,
      });
    }
  };

  return (
    <ScriptEditor
      type="post-request"
      script={activeTab?.postRequestScript || ""}
      onScriptChange={handleScriptChange}
    />
  );
};

export default PostRequestScript;
