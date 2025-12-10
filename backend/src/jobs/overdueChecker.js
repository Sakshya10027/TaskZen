import { Task } from "../models/Task.js";
import { Notification } from "../models/Notification.js";
import { getIO } from "../utils/socket.js";

export const startOverdueChecker = () => {
  const check = async () => {
    const now = new Date();
    const overdue = await Task.find({
      dueDate: { $lte: now },
      status: { $ne: "done" },
      $or: [{ overdueNotifiedAt: { $exists: false } }, { overdueNotifiedAt: null }]
    });
    const io = getIO();
    for (const task of overdue) {
      task.overdueNotifiedAt = now;
      await task.save();
      if (task.assignedTo) {
        const notif = await Notification.create({
          user: task.assignedTo,
          type: "task_overdue",
          task: task._id,
          message: `Task "${task.title}" is overdue`,
          metadata: { priority: task.priority, dueDate: task.dueDate }
        });
        io.to(task.assignedTo.toString()).emit("notification:new", notif);
      }
    }
  };
  // run every minute
  setInterval(check, 60 * 1000);
};

