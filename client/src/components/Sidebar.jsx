import { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import MyTasksSidebar from "./MyTasksSidebar";
import ProjectSidebar from "./ProjectsSidebar";
import WorkspaceDropdown from "./WorkspaceDropdown";
import {
  FolderOpenIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  UsersIcon,
  Layers
} from "lucide-react";
import { useClerk } from "@clerk/clerk-react";

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const { openUserProfile } = useClerk();
  const menuItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboardIcon },
    { name: "Portfolios", href: "/portfolios", icon: Layers },
    { name: "Projects", href: "/projects", icon: FolderOpenIcon },
    { name: "Team", href: "/team", icon: UsersIcon },
  ];

  const sidebarRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsSidebarOpen]);

  return (
    <div
      ref={sidebarRef}
      className={`z-10 bg-white dark:bg-zinc-900 min-w-68 flex flex-col h-screen border-r border-gray-200 dark:border-zinc-800 max-sm:absolute transition-all ${
        isSidebarOpen ? "left-0" : "-left-full"
      } `}
    >
      <div className="px-6 py-4 flex items-center justify-between">
        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">ProjectHub</h2>
        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">V2</span>
      </div>
      <WorkspaceDropdown />
      <hr className="border-gray-200 dark:border-zinc-800" />
      <div className="flex-1 overflow-y-scroll no-scrollbar flex flex-col">
        <div>
          <div className="p-4">
            {menuItems.map((item) => (
              <NavLink
                to={item.href}
                key={item.name}
                className={({ isActive }) =>
                  `flex items-center gap-3 py-2 px-4 text-gray-800 dark:text-zinc-100 cursor-pointer rounded transition-all  ${
                    isActive
                      ? "bg-gray-100 dark:bg-zinc-900 dark:bg-gradient-to-br dark:from-zinc-800 dark:to-zinc-800/50  dark:ring-zinc-800"
                      : "hover:bg-gray-50 dark:hover:bg-zinc-800/60"
                  }`
                }
              >
                <item.icon size={16} />
                <p className="text-sm truncate">{item.name}</p>
              </NavLink>
            ))}
            <button
              onClick={openUserProfile}
              className="flex w-full items-center gap-3 py-2 px-4 text-gray-800 dark:text-zinc-100 cursor-pointer rounded hover:bg-gray-50 dark:hover:bg-zinc-800/60 transition-all"
            >
              <SettingsIcon size={16} />
              <p className="text-sm truncate">Settings</p>
            </button>
          </div>
          <MyTasksSidebar />
          <ProjectSidebar />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
