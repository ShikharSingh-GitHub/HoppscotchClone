import Tippy from "@tippyjs/react";
import { BookOpen, Clock, Folder, Package } from "lucide-react";

const GraphQLSidebar = ({ activePanel, setActivePanel }) => {
  const getActiveStyle = (panel) => {
    return activePanel === panel
      ? "text-btn" // Only blue color, no background
      : "text-gray-400 hover:text-white hover:bg-search-bg-hover";
  };

  const tabs = [
    {
      id: "documentation",
      name: "Documentation",
      icon: <BookOpen size={16} />,
    },
    {
      id: "schema",
      name: "Schema",
      icon: <Package size={16} />,
    },
    {
      id: "collections",
      name: "Collections",
      icon: <Folder size={16} />,
    },
    {
      id: "history",
      name: "History",
      icon: <Clock size={16} />,
    },
  ];

  return (
    <div className="tabs relative overflow-x-auto flex-shrink-0 bg-primary z-10 h-full">
      <div className="flex flex-1">
        <div className="flex flex-1 justify-between flex-col">
          <div className="flex flex-1 flex-col space-y-1 p-2">
            {tabs.map((tab) => (
              <Tippy
                key={tab.id}
                content={
                  <span className="text-[10px] font-semibold">{tab.name}</span>
                }
                placement="left"
                theme="light"
                delay={300}>
                <button
                  onClick={() => setActivePanel(tab.id)}
                  className={`${getActiveStyle(
                    tab.id
                  )} inline-flex items-center justify-center p-3 rounded-md transition-colors`}
                  aria-label={tab.name}
                  role="button">
                  {tab.icon}
                </button>
              </Tippy>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphQLSidebar;
