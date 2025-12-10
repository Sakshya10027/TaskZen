import { useRef, useState } from "react";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/ui/Button";
import { useTasks } from "../hooks/useTasks";

export default function Profile() {
  const { user, logout, refreshMe } = useAuth();
  const { tasks } = useTasks();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [progress, setProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const onFile = (f) => {
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const upload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setSaving(true);
    setError("");
    try {
      const form = new FormData();
      form.append("avatar", file);
      await axiosClient.put("/auth/profile/avatar", form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) => {
          if (evt.total)
            setProgress(Math.round((evt.loaded / evt.total) * 100));
        },
      });
      await refreshMe();
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setSaving(false);
      setProgress(0);
      setPreview(null);
      setFile(null);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="relative mb-4 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="h-24 w-24 overflow-hidden rounded-full ring-4 ring-white/50">
            {preview ? (
              <img
                src={preview}
                alt="preview"
                className="h-full w-full object-cover"
              />
            ) : user?.avatar ? (
              <img
                src={
                  user.avatar?.startsWith("/uploads")
                    ? `${import.meta.env.VITE_API_URL}${user.avatar}`
                    : user.avatar
                }
                alt="avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-white/20 text-3xl font-bold">
                {user?.name?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <div className="text-xl font-semibold">{user?.name}</div>
            <div className="text-sm opacity-80">{user?.email}</div>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="inline-flex rounded-full bg-white/20 px-2 py-0.5">
                {user?.role}
              </span>
              <span className="inline-flex rounded-full bg-white/20 px-2 py-0.5">
                XP {user?.xp ?? 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-950">
          <div className="mb-2 text-sm font-semibold">Avatar</div>
          <p className="mb-3 text-xs text-gray-500">PNG or JPG, up to ~5MB.</p>
          <form onSubmit={upload} className="space-y-3">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onFile(e.target.files[0])}
            />
            <div
              role="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files?.[0];
                if (f) onFile(f);
              }}
              className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition hover:border-indigo-500 dark:border-gray-700"
            >
              {preview ? (
                <img
                  src={preview}
                  alt="preview"
                  className="mb-3 h-28 w-28 rounded-lg object-cover"
                />
              ) : (
                <div className="mb-2 text-3xl">📁</div>
              )}
              <div className="text-xs text-gray-600 dark:text-gray-300">
                Click to choose a file or drag and drop
              </div>
              {file && (
                <div className="mt-2 text-[11px] text-gray-400">
                  {file.name} • {(file.size / 1024).toFixed(0)} KB
                </div>
              )}
            </div>
            {progress > 0 && (
              <div className="h-2 w-full rounded bg-gray-100">
                <div
                  className="h-2 rounded bg-indigo-600"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
            <div className="flex items-center gap-2">
              <Button
                type="submit"
                disabled={saving || !file}
                className="text-xs"
              >
                {saving ? "Uploading..." : "Save Avatar"}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                  setError("");
                }}
                className="text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Clear
              </Button>
            </div>
            {error && <div className="text-xs text-rose-500">{error}</div>}
          </form>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-950">
          <div className="mb-2 text-sm font-semibold">Account</div>
          <p className="text-xs text-gray-500">
            Manage your account settings (more coming soon).
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
              <div className="text-gray-400">Active Tasks</div>
              <div className="text-lg font-semibold">
                {tasks.filter((t) => t.status !== "done").length}
              </div>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
              <div className="text-gray-400">Comments</div>
              <div className="text-lg font-semibold">—</div>
            </div>
          </div>
          <div className="mt-4">
            <Button
              onClick={logout}
              className="w-full bg-rose-600 hover:bg-rose-700"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
