import {
  getNotificationsForUser,
  markNotificationsRead
} from "../services/notificationService.js";

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await getNotificationsForUser(req.user._id);
    res.json(notifications);
  } catch (err) {
    next(err);
  }
};

export const markRead = async (req, res, next) => {
  try {
    await markNotificationsRead(req.user._id);
    res.json({ message: "Notifications marked as read" });
  } catch (err) {
    next(err);
  }
};
