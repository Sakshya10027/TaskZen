import { useTasks } from "../hooks/useTasks";
import KanbanBoard from "../components/tasks/KanbanBoard";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import { useNavigate } from "react-router-dom";

export default function TaskBoard() {
  const { tasks, loading } = useTasks();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="grid gap-3 md:grid-cols-3">
        <LoadingSkeleton className="h-64" />
        <LoadingSkeleton className="h-64" />
        <LoadingSkeleton className="h-64" />
      </div>
    );
  }

  return (
    <KanbanBoard
      tasks={tasks}
      onTaskClick={(task) => navigate(`/tasks/${task._id}`)}
    />
  );
}
