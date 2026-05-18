const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/authMiddleware"); // adjust path
const {
  getNotifications,
  markAsRead,
  markAllRead,
} = require("../controllers/notification.controller");

router.get  ("/",              protect, getNotifications);
router.patch("/read-all",      protect, markAllRead);
router.patch("/:id/read",      protect, markAsRead);

module.exports = router;

// ── Wire up in your main router / server.js ──────────────────────────────────
// const notificationRoutes = require("./routes/notification.route");
// app.use("/api/notifications", notificationRoutes);
