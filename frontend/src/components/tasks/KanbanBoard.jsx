import TaskCard from "./TaskCard";

const columns = [
  { key: "todo", title: "To Do", emoji: "📝" },
  { key: "in-progress", title: "In Progress", emoji: "⏳" },
  { key: "done", title: "Done", emoji: "✅" }
];

export default function KanbanBoard({ tasks, onTaskClick }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {columns.map((col) => (
        <div key={col.key} className="flex flex-col rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <span>{col.emoji}</span>
              <span>{col.title}</span>
            </h2>
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200">
              {tasks.filter((t) => t.status === col.key).length}
            </span>
          </div>
          <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
            {tasks
              .filter((t) => t.status === col.key)
              .map((task) => (
                <TaskCard key={task._id} task={task} onClick={() => onTaskClick(task)} />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
