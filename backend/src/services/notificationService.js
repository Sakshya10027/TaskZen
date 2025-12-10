import { Notification } from "../models/Notification.js";
import { getIO } from "../utils/socket.js";

export const createNotificationForTaskEvent = async ({
  userId,
  type,
  task,
  message
}) => {
  const notification = await Notification.create({
    user: userId,
    type,
    task: task._id,
    message,
    metadata: {
      taskTitle: task.title,
      status: task.status,
      priority: task.priority
    }
  });
  const io = getIO();
  io.to(userId.toString()).emit("notification:new", notification);
  return notification;
};

export const getNotificationsForUser = async (userId) =>
  Notification.find({ user: userId }).sort({ createdAt: -1 });

export const markNotificationsRead = async (userId) =>
  Notification.updateMany({ user: userId, read: false }, { $set: { read: true } });
