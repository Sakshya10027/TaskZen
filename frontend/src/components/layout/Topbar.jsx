import ToggleTheme from "../ui/ToggleTheme";
import NotificationBell from "../ui/NotificationBell";
import { useAuth } from "../../hooks/useAuth";
import { Link } from "react-router-dom";

export default function Topbar() {
  const { user } = useAuth();
  const avatarSrc = user?.avatar?.startsWith("/uploads")
    ? `${import.meta.env.VITE_API_URL}${user.avatar}`
    : user?.avatar;
  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-950">
      <div className="text-lg font-semibold md:hidden">TaskZen</div>
      <div className="flex items-center gap-3">
        <NotificationBell />
        <ToggleTheme />
        {user && (
          <Link
            to="/profile"
            className="hidden items-center gap-2 text-sm text-gray-600 dark:text-gray-200 md:flex"
          >
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt="avatar"
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <span className="h-8 w-8 rounded-full bg-indigo-500 text-center leading-8 text-xs font-semibold text-white">
                {user.name?.[0]?.toUpperCase()}
              </span>
            )}
            <div>
              <div className="font-medium">{user.name}</div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>{user.role}</span>
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200">
                  XP {user.xp ?? 0}
                </span>
              </div>
            </div>
          </Link>
        )}
      </div>
    </header>
  );
}
