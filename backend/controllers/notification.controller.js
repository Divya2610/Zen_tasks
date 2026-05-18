const Notification = require("../models/notification.model");

// GET /notifications  — returns all notifications for the logged-in user
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ to: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30)
      .populate("from", "username")
      .populate("task", "title");

    const unreadCount = await Notification.countDocuments({
      to: req.user._id,
      isRead: false,
    });

    res.status(200).json({ notifications, unreadCount });
  } catch (error) {
    next(error);
  }
};

// PATCH /notifications/:id/read  — mark one as read
const markAsRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, to: req.user._id },
      { isRead: true }
    );
    res.status(200).json({ message: "Marked as read" });
  } catch (error) {
    next(error);
  }
};

// PATCH /notifications/read-all  — mark all as read
const markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ to: req.user._id, isRead: false }, { isRead: true });
    res.status(200).json({ message: "All marked as read" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotifications, markAsRead, markAllRead };
