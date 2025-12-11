import { Task } from "../models/Task.js";
import { Notification } from "../models/Notification.js";
import { getIO } from "../utils/socket.js";

export const startOverdueChecker = () => {
  const check = async () => {
    const now = new Date();
    const startByStart = await Task.find({
      startDate: { $lte: now },
      status: "todo",
    });
    const toStartMap = new Map();
    for (const t of startByStart) toStartMap.set(t._id.toString(), t);
    if (toStartMap.size) {
      const io = getIO();
      for (const task of toStartMap.values()) {
        task.status = "in-progress";
        await task.save();
        const createdId = task.createdBy?.toString();
        const assignedId = task.assignedTo?.toString();
        if (createdId) io.to(createdId).emit("task:updated", task);
        if (assignedId && assignedId !== createdId)
          io.to(assignedId).emit("task:updated", task);
      }
    }

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
    const overdue = await Task.find({
      endDate: { $lte: now },
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
          metadata: { priority: task.priority, endDate: task.endDate },
        });
        io.to(task.assignedTo.toString()).emit("notification:new", notif);
      }
    }
  };
  // run every minute
  setInterval(check, 60 * 1000);
};
