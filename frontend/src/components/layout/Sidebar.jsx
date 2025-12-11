import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Sidebar() {
  const { logout } = useAuth();
  return (
    <aside className="hidden w-64 flex-col border-r border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950 md:flex">
      <div className="mb-6 text-xl font-bold">TaskZen</div>
      <nav className="flex flex-1 flex-col gap-2 text-sm">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `rounded-lg px-3 py-2 ${
              isActive
                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            }`
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/board"
          className={({ isActive }) =>
            `rounded-lg px-3 py-2 ${
              isActive
                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            }`
          }
        >
          Kanban Board
        </NavLink>
        <NavLink
          to="/analytics"
          className={({ isActive }) =>
            `rounded-lg px-3 py-2 ${
              isActive
                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            }`
          }
        >
          Analytics
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `rounded-lg px-3 py-2 ${
              isActive
                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            }`
          }
        >
          Profile
        </NavLink>
      </nav>
      <button
        onClick={logout}
        className="mt-4 rounded-lg bg-gray-100 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
      >
        Logout
      </button>
    </aside>
  );
}
