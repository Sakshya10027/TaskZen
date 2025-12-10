import { formatDate } from "../../utils/formatDate";
import { useEffect, useMemo, useState } from "react";

const statusColors = {
  todo: "bg-gray-100 text-gray-700",
  "in-progress": "bg-amber-100 text-amber-800",
  done: "bg-emerald-100 text-emerald-800",
};

const priorityColors = {
  low: "bg-emerald-100 text-emerald-700",
  medium: "bg-indigo-100 text-indigo-700",
  high: "bg-rose-100 text-rose-700",
};

export default function TaskCard({ task, onClick }) {
  const overdue =
    task.dueDate &&
    task.status !== "done" &&
    new Date(task.dueDate) < new Date();
  const [timeLeft, setTimeLeft] = useState("");
  const statusEmoji = useMemo(() => {
    if (task.status === "done") return "✅";
    if (task.status === "in-progress") return "⏳";
    return "📝";
  }, [task.status]);
  const accentBorder = useMemo(() => {
    if (task.priority === "high") return "border-l-4 border-rose-500";
    if (task.priority === "medium") return "border-l-4 border-indigo-500";
    return "border-l-4 border-emerald-500";
  }, [task.priority]);

  const progressPercent = useMemo(() => {
    if (!task.createdAt || !task.dueDate || task.status === "done") return 0;
    const start = new Date(task.createdAt).getTime();
    const end = new Date(task.dueDate).getTime();
    const now = Date.now();
    if (end <= start) return 100;
    const p = ((now - start) / (end - start)) * 100;
    return Math.max(0, Math.min(100, Math.round(p)));
  }, [task.createdAt, task.dueDate, task.status]);

  useEffect(() => {
    const update = () => {
      if (!task.dueDate || task.status === "done") {
        setTimeLeft("");
        return;
      }
      const now = Date.now();
      const due = new Date(task.dueDate).getTime();
      let diff = due - now;
      const sign = diff >= 0 ? 1 : -1;
      diff = Math.abs(diff);
      const d = Math.floor(diff / (24 * 60 * 60 * 1000));
      const h = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
      const m = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
      const s = Math.floor((diff % (60 * 1000)) / 1000);
      let str = "";
      if (d > 0) str = `${d}d ${h}h`;
      else if (h > 0) str = `${h}h ${m}m`;
      else str = `${m}m ${s}s`;
      setTimeLeft(sign >= 0 ? `Time left ${str}` : `Overdue by ${str}`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [task.dueDate, task.status]);
  return (
    <div
      className={`group flex cursor-pointer flex-col rounded-xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-950 ${accentBorder} ${
        overdue ? "ring-1 ring-rose-300 dark:ring-rose-500" : ""
      }`}
      onClick={onClick}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-base">{statusEmoji}</span>
          <h3 className="text-sm font-semibold">{task.title}</h3>
        </div>
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
            statusColors[task.status]
          }`}
        >
          {task.status.replace("-", " ")}
        </span>
      </div>
      {task.description && (
        <p className="mb-3 line-clamp-2 text-xs text-gray-600 dark:text-gray-300">
          {task.description}
        </p>
      )}
      <div className="mb-2 h-1 w-full overflow-hidden rounded bg-gray-100 dark:bg-gray-800">
        <div
          className={`h-1 ${overdue ? "bg-rose-500" : "bg-indigo-500"}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <div className="mt-auto flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
        <div
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
            priorityColors[task.priority]
          }`}
        >
          <span>{task.priority}</span>
        </div>
        <div className="flex items-center gap-2">
          {task.dueDate && <span>Due {formatDate(task.dueDate)}</span>}
          {timeLeft && (
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] ${
                overdue
                  ? "bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-200"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200"
              }`}
            >
              {timeLeft}
            </span>
          )}
          {task.assignedTo && (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white">
              {task.assignedTo.name?.[0]?.toUpperCase()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
