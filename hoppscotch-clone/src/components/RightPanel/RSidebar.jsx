import { Clock3, Code, Folder, Layers, Share2 } from "lucide-react";
import IconButton from "../IconButton/IconButton";

const RSidebar = ({ activePanel, setActivePanel }) => {
  const getActiveStyle = (panel) => {
    return activePanel === panel ? "text-btn" : "";
  };

  return (
    <>
      <IconButton
        name="Collections"
        direction="left"
        height="h-10"
        onClick={() => setActivePanel("collections")}>
        <Folder size={17} className={getActiveStyle("collections")} />
      </IconButton>

      <IconButton
        name="Environments"
        direction="left"
        height="h-10"
        onClick={() => setActivePanel("environments")}>
        <Layers size={17} className={getActiveStyle("environments")} />
      </IconButton>

      <IconButton
        name="History"
        direction="left"
        height="h-10"
        onClick={() => setActivePanel("history")}>
        <Clock3 size={17} className={getActiveStyle("history")} />
      </IconButton>

      <IconButton
        name="Shared Requests"
        direction="left"
        height="h-10"
        onClick={() => setActivePanel("shared")}>
        <Share2 size={17} className={getActiveStyle("shared")} />
      </IconButton>

      <IconButton
        name="Generated Code"
        direction="left"
        height="h-10"
        onClick={() => setActivePanel("code")}>
        <Code size={17} className={getActiveStyle("code")} />
      </IconButton>
    </>
  );
};

export default RSidebar;
