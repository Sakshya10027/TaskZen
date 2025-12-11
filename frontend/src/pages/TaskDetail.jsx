import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import Button from "../components/ui/Button";
import { useTasks } from "../hooks/useTasks";
import { useAuth } from "../hooks/useAuth";

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setTasks } = useTasks();
  const { refreshMe } = useAuth();
  const [timeLeft, setTimeLeft] = useState("");
  const [task, setTask] = useState(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    dueDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
  });
  const [saving, setSaving] = useState(false);

  const fetchTask = async () => {
    const { data } = await axiosClient.get(`/tasks/${id}`);
    setTask(data);
    setEditForm({
      title: data.title || "",
      description: data.description || "",
      status: data.status || "todo",
      priority: data.priority || "medium",
      dueDate: data.dueDate
        ? new Date(data.dueDate).toISOString().slice(0, 10)
        : "",
      startTime: data.startDate
        ? new Date(data.startDate).toISOString().slice(11, 16)
        : "",
      endTime: data.endDate
        ? new Date(data.endDate).toISOString().slice(11, 16)
        : "",
    });
    setLoading(false);
  };

  const addComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    const { data } = await axiosClient.post(`/tasks/${id}/comments`, {
      text: comment,
    });
    setTask(data);
    setComment("");
  };

  const saveUpdates = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updates = {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        status: editForm.status,
        priority: editForm.priority,
        dueDate: editForm.dueDate
          ? new Date(`${editForm.dueDate}T00:00:00`).toISOString()
          : null,
        startDate:
          editForm.dueDate && editForm.startTime
            ? new Date(
                `${editForm.dueDate}T${editForm.startTime}`
              ).toISOString()
            : null,
        endDate:
          editForm.dueDate && editForm.endTime
            ? new Date(`${editForm.dueDate}T${editForm.endTime}`).toISOString()
            : null,
      };
      if (
        updates.startDate &&
        updates.endDate &&
        new Date(updates.endDate) <= new Date(updates.startDate)
      ) {
        setSaving(false);
        return;
      }
      const { data } = await axiosClient.put(`/tasks/${id}`, updates);
      setTask(data);
      setTasks((prev) => prev.map((t) => (t._id === data._id ? data : t)));
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const deleteTask = async () => {
    await axiosClient.delete(`/tasks/${id}`);
    setTasks((prev) => prev.filter((t) => t._id !== id));
    navigate("/");
  };

  const finishTask = async () => {
    const { data } = await axiosClient.put(`/tasks/${id}`, { status: "done" });
    setTask(data);
    setTasks((prev) => prev.map((t) => (t._id === data._id ? data : t)));
    await refreshMe();
  };

  useEffect(() => {
    fetchTask();
  }, [id]);

  useEffect(() => {
    const update = () => {
      if (!task?.endDate || task?.status === "done") {
        setTimeLeft("");
        return;
      }
      const now = Date.now();
      const end = new Date(task.endDate).getTime();
      let diff = end - now;
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
  }, [task?.endDate, task?.status]);

  if (loading) return <LoadingSkeleton className="h-64" />;
  if (!task) return <div>Task not found</div>;

  return (
    <div className="mx-auto max-w-3xl rounded-xl bg-white p-4 shadow-sm dark:bg-gray-950" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items_center gap-2">
          <Button
            onClick={() => navigate(-1)}
            className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Back
          </Button>
          <h1 className="text-xl font-semibold">{task.title}</h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setEditing((e) => !e)} className="text-xs">
            {editing ? "Cancel" : "Edit"}
          </Button>
          <Button
            onClick={deleteTask}
            className="text-xs bg-rose-600 hover:bg-rose-700"
          >
            Delete
          </Button>
          {task.status !== "done" && (
            <Button
              onClick={finishTask}
              className="text-xs bg-emerald-600 hover:bg-emerald-700"
            >
              Finish Task
            </Button>
          )}
        </div>
      </div>
      {!editing && (
        <p className="mb-3 text-sm text-gray-500">{task.description}</p>
      )}
      {editing && (
        <form onSubmit={saveUpdates} className="mb-4 grid gap-2 md:grid-cols-2">
          <input
            placeholder="Title"
            value={editForm.title}
            onChange={(e) =>
              setEditForm((f) => ({ ...f, title: e.target.value }))
            }
            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 md:col-span-2"
          />
          <textarea
            placeholder="Description"
            value={editForm.description}
            onChange={(e) =>
              setEditForm((f) => ({ ...f, description: e.target.value }))
            }
            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 md:col-span-2"
          />
          <select
            value={editForm.status}
            onChange={(e) =>
              setEditForm((f) => ({ ...f, status: e.target.value }))
            }
            className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-2 text-xs dark:border-gray-700 dark:bg-gray-900"
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <select
            value={editForm.priority}
            onChange={(e) =>
              setEditForm((f) => ({ ...f, priority: e.target.value }))
            }
            className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-2 text-xs dark:border-gray-700 dark:bg-gray-900"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editForm.dueDate}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, dueDate: e.target.value }))
              }
              placeholder="set date"
              onFocus={(e) => (e.target.type = "date")}
              onBlur={(e) => {
                if (!e.target.value) e.target.type = "text";
              }}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900"
            />
            <input
              type="text"
              value={editForm.startTime}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, startTime: e.target.value }))
              }
              placeholder="set start time"
              onFocus={(e) => (e.target.type = "time")}
              onBlur={(e) => {
                if (!e.target.value) e.target.type = "text";
              }}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editForm.endTime}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, endTime: e.target.value }))
              }
              placeholder="set end time"
              onFocus={(e) => (e.target.type = "time")}
              onBlur={(e) => {
                if (!e.target.value) e.target.type = "text";
              }}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900"
            />
          </div>
          <div className="md:col-span-2">
            <Button
              type="submit"
              disabled={saving || !editForm.title.trim()}
              className="text-xs"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      )}
      <div className="mb-4 grid grid-cols-2 gap-2 text-xs text-gray-500">
        <div>Status: {task.status}</div>
        <div>Priority: {task.priority}</div>
        <div>Assigned to: {task.assignedTo?.name || "Unassigned"}</div>
        <div>
          Due:{" "}
          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}
        </div>
        <div>
          Start:{" "}
          {task.startDate ? new Date(task.startDate).toLocaleTimeString() : "-"}
        </div>
        <div>
          End:{" "}
          {task.endDate ? new Date(task.endDate).toLocaleTimeString() : "-"}
        </div>
        {timeLeft && (
          <div
            className={
              (new Date(task.endDate) < new Date() && task.status !== "done"
                ? "text-rose-600"
                : "text-amber-700") + " col-span-2 text-xl font-bold"
            }
          >
            {timeLeft}
          </div>
        )}
      </div>
      <div className="mb-4">
        <h2 className="mb-2 text-sm font-semibold">Comments</h2>
        <div className="mb-3 space-y-2 text-xs">
          {task.comments?.length === 0 && (
            <div className="text-gray-400">No comments yet.</div>
          )}
          {task.comments?.map((c) => (
            <div
              key={c._id}
              className="rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-900"
            >
              <div className="mb-1 text-[11px] font-semibold">
                {c.author?.name || "User"}
              </div>
              <div>{c.text}</div>
              <div className="mt-1 text-[10px] text-gray-400">
                {new Date(c.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={addComment} className="flex gap-2">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900"
          />
          <Button type="submit" className="text-xs">
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
