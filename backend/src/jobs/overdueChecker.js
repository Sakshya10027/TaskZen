import { Task } from "../models/Task.js";
import { Notification } from "../models/Notification.js";
import { getIO } from "../utils/socket.js";

export const startOverdueChecker = () => {
  const check = async () => {
    const now = new Date();
    // auto move tasks to in-progress when their scheduled time arrives
    const toStart = await Task.find({
      dueDate: { $lte: now },
      status: "todo",
    });
    if (toStart.length) {
      const io = getIO();
      for (const task of toStart) {
        task.status = "in-progress";
        await task.save();
        const createdId = task.createdBy?.toString();
        const assignedId = task.assignedTo?.toString();
        if (createdId) io.to(createdId).emit("task:updated", task);
        if (assignedId && assignedId !== createdId)
          io.to(assignedId).emit("task:updated", task);
      }
    }
    const overdue = await Task.find({
      dueDate: { $lte: now },
      status: { $ne: "done" },
      $or: [
        { overdueNotifiedAt: { $exists: false } },
        { overdueNotifiedAt: null },
      ],
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
          metadata: { priority: task.priority, dueDate: task.dueDate },
        });
        io.to(task.assignedTo.toString()).emit("notification:new", notif);
      }
    }
  };
  // run every minute
  setInterval(check, 60 * 1000);
};
