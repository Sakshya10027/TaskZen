import { Task } from "../models/Task.js";
import { getIO } from "../utils/socket.js";
import { createNotificationForTaskEvent } from "./notificationService.js";
import { User } from "../models/User.js";

export const listTasks = async ({ status, priority, q, dueFrom, dueTo }) => {
  const filter = {};
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (q) filter.title = { $regex: q, $options: "i" };
  if (dueFrom || dueTo) {
    filter.dueDate = {};
    if (dueFrom) filter.dueDate.$gte = new Date(dueFrom);
    if (dueTo) filter.dueDate.$lte = new Date(dueTo);
  }
  return Task.find(filter)
    .populate("assignedTo", "name email")
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 });
};

export const getTaskById = async (id) =>
  Task.findById(id)
    .populate("assignedTo", "name email")
    .populate("createdBy", "name email")
    .populate("comments.author", "name email");

export const createTask = async (data, currentUser) => {
  const task = await Task.create({ ...data, createdBy: currentUser._id });
  const io = getIO();

  io.emit("task:created", task);

  if (task.assignedTo) {
    await createNotificationForTaskEvent({
      userId: task.assignedTo,
      type: "task_assigned",
      task,
      message: `You have been assigned to task "${task.title}"`,
    });
  }
  return getTaskById(task._id);
};

export const updateTask = async (id, updates, currentUser) => {
  const prev = await Task.findById(id);
  if (!prev) {
    const err = new Error("Task not found");
    err.statusCode = 404;
    throw err;
  }

  // handle completion
  let completedNow = false;
  if (updates.status === "done" && prev.status !== "done") {
    updates.completedAt = new Date();
    completedNow = true;
  }

  const task = await Task.findByIdAndUpdate(id, updates, { new: true })
    .populate("assignedTo", "name email")
    .populate("createdBy", "name email")
    .populate("comments.author", "name email");

  if (completedNow) {
    // award XP to the user performing completion
    const xpByPriority = { low: 10, medium: 25, high: 50 };
    const xpGain = xpByPriority[task.priority] || 10;
    const user = await User.findById(currentUser._id);
    if (user) {
      user.xp = (user.xp || 0) + xpGain;
      await user.save();
    }
  }

  const io = getIO();
  io.emit("task:updated", task);

  if (task.assignedTo) {
    await createNotificationForTaskEvent({
      userId: task.assignedTo,
      type: "task_updated",
      task,
      message: `Task "${task.title}" has been updated`,
    });
  }
  return task;
};

export const deleteTask = async (id) => {
  const task = await Task.findByIdAndDelete(id);
  const io = getIO();
  io.emit("task:deleted", { id });
  return task;
};

export const addCommentToTask = async (id, { text }, currentUser) => {
  const task = await Task.findById(id);
  if (!task) {
    const err = new Error("Task not found");
    err.statusCode = 404;
    throw err;
  }
  task.comments.push({ text, author: currentUser._id });
  await task.save();
  const populated = await getTaskById(task._id);

  const io = getIO();
  io.emit("task:comment_added", populated);

  if (task.assignedTo) {
    await createNotificationForTaskEvent({
      userId: task.assignedTo,
      type: "comment_added",
      task,
      message: `New comment on task "${task.title}"`,
    });
  }

  return populated;
};
