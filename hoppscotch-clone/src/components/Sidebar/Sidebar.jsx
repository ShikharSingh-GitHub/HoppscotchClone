import { Globe, Link2, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import useUIStore from "../../store/uiStore";
import IconButton from "../IconButton/IconButton";

// Custom GraphQL Icon Component
const GraphQLIcon = ({ size = 15 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    width={`${size}px`}
    height={`${size}px`}
    viewBox="0 0 21 24"
    className="svg-icons">
    <path
      fill="currentColor"
      d="M12.731 2.751 17.666 5.6a2.138 2.138 0 1 1 2.07 3.548l-.015.003v5.7a2.14 2.14 0 1 1-2.098 3.502l-.002-.002-4.905 2.832a2.14 2.14 0 1 1-4.079.054l-.004.015-4.941-2.844a2.14 2.14 0 1 1-2.067-3.556l.015-.003V9.15a2.14 2.14 0 1 1 1.58-3.926l-.01-.005c.184.106.342.231.479.376l.001.001 4.938-2.85a2.14 2.14 0 1 1 4.096.021l.004-.015zm-.515.877a.766.766 0 0 1-.057.057l-.001.001 6.461 11.19c.026-.009.056-.016.082-.023V9.146a2.14 2.14 0 0 1-1.555-2.603l-.003.015.019-.072zm-3.015.059-.06-.60-4.946 2.852A2.137 2.137 0 0 1 2.749 9.12l-.015.004-.076.021v5.708l.084.023 6.461-11.19zm2.076.507a2.164 2.164 0 0 1-1.207-.004l.015.004-6.46 11.189c.286.276.496.629.597 1.026l.003.015h12.911c.102-.413.313-.768.599-1.043l.001-.001L11.28 4.194zm.986 16.227 4.917-2.838a1.748 1.748 0 0 1-.038-.142H4.222l-.021.083 4.939 2.852c.39-.403.936-.653 1.54-.653.626 0 1.189.268 1.581.696l.001.002z"
    />
  </svg>
);

const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const sidebarExpanded = useUIStore((state) => state.sidebarExpanded);

  const getActiveStyle = (path) => {
    return currentPath === path
      ? "border-l-[3px] border-btn bg-search-bg-hover text-white"
      : "hover:bg-search-bg";
  };

  const navigationItems = [
    {
      path: "/rest",
      icon: <Link2 size={20} />,
      label: "REST",
      tooltip: "Rest",
    },
    {
      path: "/graphql",
      icon: <GraphQLIcon size={18} />,
      label: "GraphQL",
      tooltip: "GraphQL",
    },
    {
      path: "/realtime",
      icon: <Globe size={20} />,
      label: "Realtime",
      tooltip: "Realtime",
    },
    {
      path: "/settings",
      icon: <Settings size={20} />,
      label: "Settings",
      tooltip: "Settings",
    },
  ];

  if (sidebarExpanded) {
    return (
      <aside className="flex h-full justify-between md:flex-col bg-primary border-r border-gray-700/30 transition-all duration-300">
        <nav className="flex flex-1 flex-nowrap bg-primary md:flex-none md:flex-col">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link flex flex-col items-center justify-center px-4 py-3 text-center transition-colors min-w-[80px] ${getActiveStyle(
                item.path
              )} ${
                currentPath === item.path
                  ? "router-link-active router-link-exact-active"
                  : ""
              }`}
              tabIndex="0"
              exact={item.path === "/rest" ? "true" : "false"}
              aria-current={currentPath === item.path ? "page" : undefined}>
              <div className="flex items-center justify-center mb-1">
                {item.icon}
              </div>
              <span className="nav-title text-xs font-medium leading-tight">
                {item.label}
              </span>
            </Link>
          ))}
        </nav>
      </aside>
    );
  }

  return (
    <div className="flex flex-col h-full w-12 bg-search-bg-hover border-r border-gray-700/30 transition-all duration-300">
      {navigationItems.map((item) => (
        <Link key={item.path} to={item.path} className="block">
          <IconButton
            name={item.tooltip}
            direction="right"
            height={`flex justify-center items-center h-[46px] w-full ${getActiveStyle(
              item.path
            )}`}>
            {item.icon}
          </IconButton>
        </Link>
      ))}
    </div>
  );
};

export default Sidebar;
