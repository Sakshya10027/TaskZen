import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { NavLink } from "react-router-dom";

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
          <div className="mx-auto flex max-w-md items-center justify-around px-4 py-2 text-xs">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 rounded-md px-3 py-1 ${
                  isActive
                    ? "text-indigo-600"
                    : "text-gray-600 dark:text-gray-300"
                }`
              }
            >
              <span>Dashboard</span>
            </NavLink>
            <NavLink
              to="/board"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 rounded-md px-3 py-1 ${
                  isActive
                    ? "text-indigo-600"
                    : "text-gray-600 dark:text-gray-300"
                }`
              }
            >
              <span>Kanban</span>
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 rounded-md px-3 py-1 ${
                  isActive
                    ? "text-indigo-600"
                    : "text-gray-600 dark:text-gray-300"
                }`
              }
            >
              <span>Profile</span>
            </NavLink>
          </div>
        </nav>
      </div>
    </div>
  );
}
