import { Task } from "../models/Task.js";
import { getIO } from "../utils/socket.js";
import { createNotificationForTaskEvent } from "./notificationService.js";
import { User } from "../models/User.js";

export const listTasks = async ({ status, priority, q, dueFrom, dueTo }, currentUser) => {
  const userId = currentUser?._id?.toString();
  const clauses = [];
  if (status) clauses.push({ status });
  if (priority) clauses.push({ priority });
  if (q) clauses.push({ title: { $regex: q, $options: "i" } });
  if (dueFrom || dueTo) {
    const due = {};
    if (dueFrom) due.$gte = new Date(dueFrom);
    if (dueTo) due.$lte = new Date(dueTo);
    clauses.push({ dueDate: due });
  }
  const userScope = {
    $or: [{ createdBy: userId }, { assignedTo: userId }]
  };
  const filter = clauses.length ? { $and: [userScope, ...clauses] } : userScope;
  return Task.find(filter)
    .populate("assignedTo", "name email")
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 });
};

export const getTaskById = async (id, currentUser) =>
  Task.findOne({
    _id: id,
    $or: [{ createdBy: currentUser?._id }, { assignedTo: currentUser?._id }]
  })
    .populate("assignedTo", "name email")
    .populate("createdBy", "name email")
    .populate("comments.author", "name email");

export const createTask = async (data, currentUser) => {
  const payload = { ...data, createdBy: currentUser._id };
  if (!payload.startDate) payload.startDate = new Date();
  const task = await Task.create(payload);
  const io = getIO();

  const createdId = task.createdBy?.toString();
  const assignedId = task.assignedTo?.toString();
  if (createdId) io.to(createdId).emit("task:created", task);
  if (assignedId && assignedId !== createdId) io.to(assignedId).emit("task:created", task);

  if (task.assignedTo) {
    await createNotificationForTaskEvent({
      userId: task.assignedTo,
      type: "task_assigned",
      task,
      message: `You have been assigned to task "${task.title}"`,
    });
  }
  return getTaskById(task._id, currentUser);
};

export const updateTask = async (id, updates, currentUser) => {
  const prev = await Task.findById(id);
  if (!prev) {
    const err = new Error("Task not found");
    err.statusCode = 404;
    throw err;
  }
  const canAccess =
    prev.createdBy?.toString() === currentUser._id?.toString() ||
    prev.assignedTo?.toString() === currentUser._id?.toString();
  if (!canAccess) {
    const err = new Error("Forbidden");
    err.statusCode = 403;
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
  const createdId = task.createdBy?.toString();
  const assignedId = task.assignedTo?.toString();
  if (createdId) io.to(createdId).emit("task:updated", task);
  if (assignedId && assignedId !== createdId) io.to(assignedId).emit("task:updated", task);

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
  const task = await Task.findById(id);
  if (!task) return null;
  await Task.findByIdAndDelete(id);
  const io = getIO();
  const createdId = task.createdBy?.toString();
  const assignedId = task.assignedTo?.toString();
  if (createdId) io.to(createdId).emit("task:deleted", { id });
  if (assignedId && assignedId !== createdId) io.to(assignedId).emit("task:deleted", { id });
  return task;
};

export const addCommentToTask = async (id, { text }, currentUser) => {
  const task = await Task.findById(id);
  if (!task) {
    const err = new Error("Task not found");
    err.statusCode = 404;
    throw err;
  }
  const canAccess =
    task.createdBy?.toString() === currentUser._id?.toString() ||
    task.assignedTo?.toString() === currentUser._id?.toString();
  if (!canAccess) {
    const err = new Error("Forbidden");
    err.statusCode = 403;
    throw err;
  }
  task.comments.push({ text, author: currentUser._id });
  await task.save();
  const populated = await getTaskById(task._id, currentUser);

  const io = getIO();
  const createdId = populated.createdBy?.toString();
  const assignedId = populated.assignedTo?.toString();
  if (createdId) io.to(createdId).emit("task:comment_added", populated);
  if (assignedId && assignedId !== createdId) io.to(assignedId).emit("task:comment_added", populated);

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
