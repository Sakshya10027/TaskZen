import { useTasks } from "../hooks/useTasks";
import FiltersBar from "../components/tasks/FiltersBar";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import TaskCard from "../components/tasks/TaskCard";
import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
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
    dueDate: "",
    startTime: "",
    endTime: "",
  });
  const [creating, setCreating] = useState(false);
  const startTimeRef = useRef(null);
  const endTimeRef = useRef(null);

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
        dueDate: form.dueDate
          ? new Date(`${form.dueDate}T00:00:00`).toISOString()
          : undefined,
        startDate:
          form.dueDate && form.startTime
            ? new Date(`${form.dueDate}T${form.startTime}`).toISOString()
            : undefined,
        endDate:
          form.dueDate && form.endTime
            ? new Date(`${form.dueDate}T${form.endTime}`).toISOString()
            : undefined,
      };
      if (
        payload.startDate &&
        payload.endDate &&
        new Date(payload.endDate) <= new Date(payload.startDate)
      ) {
        setCreating(false);
        return;
      }
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
        dueDate: "",
        startTime: "",
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
          <div className="flex items_center gap-2">
            <input
              type="text"
              value={form.dueDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, dueDate: e.target.value }))
              }
              placeholder="set date"
              onFocus={(e) => (e.target.type = "date")}
              onBlur={(e) => {
                if (!e.target.value) e.target.type = "text";
              }}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={startTimeRef}
              type="text"
              value={form.startTime}
              onChange={(e) =>
                setForm((f) => ({ ...f, startTime: e.target.value }))
              }
              placeholder="set start time"
              onFocus={(e) => (e.target.type = "time")}
              onBlur={(e) => {
                if (!e.target.value) e.target.type = "text";
              }}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900"
            />
            <Button
              type="button"
              onClick={() => {
                if (startTimeRef.current) {
                  startTimeRef.current.blur();
                  startTimeRef.current.type = "text";
                }
              }}
              className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Apply
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={endTimeRef}
              type="text"
              value={form.endTime}
              onChange={(e) =>
                setForm((f) => ({ ...f, endTime: e.target.value }))
              }
              placeholder="set end time"
              onFocus={(e) => (e.target.type = "time")}
              onBlur={(e) => {
                if (!e.target.value) e.target.type = "text";
              }}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900"
            />
            <Button
              type="button"
              onClick={() => {
                if (endTimeRef.current) {
                  endTimeRef.current.blur();
                  endTimeRef.current.type = "text";
                }
              }}
              className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Apply
            </Button>
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
