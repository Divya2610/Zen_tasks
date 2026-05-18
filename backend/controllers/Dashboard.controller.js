// ─── controllers/dashboard.controller.js ────────────────────────────────────
//
// Single endpoint that returns everything the Dashboard page needs.
// Add to your task router: router.get("/dashboard", protect, getDashboardData);
//
const Task = require("../models/task.model");   // adjust path to your Task model
const User = require("../models/user.model");   // adjust path to your User model

const getDashboardData = async (req, res, next) => {
  try {
    // ── Task counts by stage ──────────────────────────────────────────────
    const [totalTasks, completedTasks, inProgressTasks, todoTasks] =
      await Promise.all([
        Task.countDocuments({ isTrashed: false }),
        Task.countDocuments({ stage: "completed", isTrashed: false }),
        Task.countDocuments({ stage: "in progress", isTrashed: false }),
        Task.countDocuments({ stage: "todo", isTrashed: false }),
      ]);

    // ── tasksByStage — used by the Chart component ────────────────────────
    // Keys must match exactly what the frontend expects.
    const tasksByStage = {
      todo: todoTasks,
      "in progress": inProgressTasks,
      completed: completedTasks,
    };

    // ── Recent tasks (last 10, newest first) ─────────────────────────────
    const recentTasks = await Task.find({ isTrashed: false })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("team", "username email");   // adjust fields as needed

    // ── Users ─────────────────────────────────────────────────────────────
    const users = await User.find({})
      .sort({ createdAt: -1 })
      .select("username email role isActive createdAt");

    res.status(200).json({
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      tasksByStage,   // ✅ consumed by Chart
      recentTasks,
      users,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardData };


// ─── How to wire it up in task.route.js ──────────────────────────────────────
//
// const { getDashboardData } = require("../controllers/dashboard.controller");
// const { protect } = require("../middleware/authMiddleware");
//
// router.get("/dashboard", protect, getDashboardData);
//
// This makes the endpoint available at GET /api/dashboard
// (because app.use("/api", taskRouter) in server.js)
