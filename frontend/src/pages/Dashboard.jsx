import { useTasks } from "../hooks/useTasks";
import FiltersBar from "../components/tasks/FiltersBar";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import TaskCard from "../components/tasks/TaskCard";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Button from "../components/ui/Button";
import axiosClient from "../api/axiosClient";

export default function Dashboard() {
  const { tasks, fetchTasks, loading, setTasks } = useTasks();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    startDate: "",
    startTime: "",
    dueDate: "",
    dueTime: "",
    endDate: "",
    endTime: "",
  });
  const [creating, setCreating] = useState(false);

  const handleFilterChange = (filters) => {
    fetchTasks(filters);
  };

  const createTask = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setCreating(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        priority: form.priority,
        startDate: form.startDate
          ? new Date(`${form.startDate}T${form.startTime || "00:00"}`).toISOString()
          : undefined,
        dueDate: form.dueDate
          ? new Date(`${form.dueDate}T${form.dueTime || "23:59"}`).toISOString()
          : undefined,
        endDate: form.endDate
          ? new Date(`${form.endDate}T${form.endTime || "23:59"}`).toISOString()
          : undefined,
      };
      const { data } = await axiosClient.post("/tasks", payload);
      setTasks((prev) => {
        const exists = prev.some((t) => t._id === data._id);
        return exists
          ? prev.map((t) => (t._id === data._id ? data : t))
          : [data, ...prev];
      });
      setShowCreate(false);
      setForm({
        title: "",
        description: "",
        priority: "medium",
        startDate: "",
        startTime: "",
        dueDate: "",
        dueTime: "",
        endDate: "",
        endTime: "",
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Tasks</h2>
        <Button onClick={() => setShowCreate((s) => !s)} className="text-xs">
          {showCreate ? "Close" : "Add Task"}
        </Button>
      </div>
      {showCreate && (
        <form
          onSubmit={createTask}
          className="grid gap-2 rounded-xl bg-white p-4 shadow-sm dark:bg-gray-950 md:grid-cols-4"
        >
          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 md:col-span-2"
          />
          <input
            placeholder="Description"
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 md:col-span-2"
          />
          <select
            value={form.priority}
            onChange={(e) =>
              setForm((f) => ({ ...f, priority: e.target.value }))
            }
            className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-2 text-xs dark:border-gray-700 dark:bg-gray-900"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={form.startDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, startDate: e.target.value }))
              }
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900"
            />
            <input
              type="time"
              value={form.startTime}
              onChange={(e) =>
                setForm((f) => ({ ...f, startTime: e.target.value }))
              }
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, dueDate: e.target.value }))
              }
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900"
            />
            <input
              type="time"
              value={form.dueTime}
              onChange={(e) =>
                setForm((f) => ({ ...f, dueTime: e.target.value }))
              }
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={form.endDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, endDate: e.target.value }))
              }
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900"
            />
            <input
              type="time"
              value={form.endTime}
              onChange={(e) =>
                setForm((f) => ({ ...f, endTime: e.target.value }))
              }
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900"
            />
          </div>
          <div className="md:col-span-4">
            <Button
              type="submit"
              disabled={creating || !form.title.trim()}
              className="text-xs"
            >
              {creating ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      )}
      <FiltersBar onFilterChange={handleFilterChange} loading={loading} />
      <div className="grid gap-3 md:grid-cols-3">
        {loading &&
          Array.from({ length: 6 }).map((_, i) => (
            <LoadingSkeleton key={i} className="h-24" />
          ))}
        {!loading &&
          tasks
            .filter((t) => t.status !== "done")
            .map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onClick={() => navigate(`/tasks/${task._id}`)}
              />
            ))}
      </div>
    </div>
  );
}
