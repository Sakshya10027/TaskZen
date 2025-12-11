import { Task } from "../models/Task.js";
import { Notification } from "../models/Notification.js";
import { getIO } from "../utils/socket.js";

export const startOverdueChecker = () => {
  const checkStart = async () => {
    const now = new Date();
    const toStart = await Task.find({
      startDate: { $lte: now },
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
  };

  const checkEnd = async () => {
    const now = new Date();
    const toComplete = await Task.find({
      endDate: { $lte: now },
      status: { $ne: "done" },
    });
    if (toComplete.length) {
      const io = getIO();
      for (const task of toComplete) {
        task.status = "done";
        task.completedAt = now;
        await task.save();
        const createdId = task.createdBy?.toString();
        const assignedId = task.assignedTo?.toString();
        if (createdId) io.to(createdId).emit("task:updated", task);
        if (assignedId && assignedId !== createdId)
          io.to(assignedId).emit("task:updated", task);
      }
    }
  };

  const checkOverdue = async () => {
    const now = new Date();
    const overdue = await Task.find({
      endDate: { $lte: now },
      status: { $ne: "done" },
      $or: [
        { overdueNotifiedAt: { $exists: false } },
        { overdueNotifiedAt: null },
      ],
    });
    if (overdue.length) {
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
            metadata: { priority: task.priority, endDate: task.endDate },
          });
          io.to(task.assignedTo.toString()).emit("notification:new", notif);
        }
      }
    }
  };

  setInterval(checkStart, 5 * 1000);
  setInterval(checkEnd, 10 * 1000);
  setInterval(checkOverdue, 60 * 1000);
};
