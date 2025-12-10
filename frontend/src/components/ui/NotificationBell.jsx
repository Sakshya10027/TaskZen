import { useContext, useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { SocketContext } from "../../context/SocketContext";
import LoadingSkeleton from "./LoadingSkeleton";

export default function NotificationBell() {
  const socket = useContext(SocketContext);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = 880;
      o.connect(g);
      g.connect(ctx.destination);
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.1, ctx.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
      o.start();
      o.stop(ctx.currentTime + 0.2);
    } catch {}
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get("/notifications");
      setNotifications(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const onNew = (notif) => {
      setNotifications((prev) => [notif, ...prev]);
      playBeep();
    };
    socket.on("notification:new", onNew);
    return () => socket.off("notification:new", onNew);
  }, [socket]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = async () => {
    await axiosClient.post("/notifications/read");
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const toggleOpen = () => {
    const next = !open;
    setOpen(next);
    if (next && unreadCount) markRead();
  };

  return (
    <div className="relative">
      <button
        onClick={toggleOpen}
        className="relative rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl border border-gray-200 bg-white p-2 text-xs shadow-lg dark:border-gray-800 dark:bg-gray-950">
          <div className="mb-1 flex items-center justify-between">
            <span className="font-semibold">Notifications</span>
            <span className="text-[10px] text-gray-400">
              {unreadCount ? `${unreadCount} new` : "All caught up"}
            </span>
          </div>
          <div className="max-h-64 space-y-1 overflow-y-auto">
            {loading && (
              <>
                <LoadingSkeleton className="h-8" />
                <LoadingSkeleton className="h-8" />
              </>
            )}
            {!loading && notifications.length === 0 && (
              <div className="py-4 text-center text-gray-400">
                No notifications yet.
              </div>
            )}
            {notifications.map((n) => (
              <div
                key={n._id}
                className={`rounded-lg px-2 py-1 ${
                  n.read
                    ? "bg-gray-50 dark:bg-gray-900"
                    : "bg-indigo-50 dark:bg-indigo-900/20"
                }`}
              >
                <div className="font-medium">{n.message}</div>
                <div className="text-[10px] text-gray-400">
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
