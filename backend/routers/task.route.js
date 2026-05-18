const express  = require("express");
const router   = new express.Router();
const multer   = require("multer");
const path     = require("path");
const fs       = require("fs");
const taskController = require("../controllers/task.controller");
const { protect }    = require("../middleware/authMiddleware");

// ─── Ensure uploads directory exists ─────────────────────────────────────────
// FIX: The ENOENT 500 was caused by multer trying to write to a folder that
// didn't exist on this machine. mkdirSync with { recursive: true } creates
// every missing directory segment without throwing if it already exists.
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("[uploads] Created uploads directory:", uploadsDir);
}

// ─── Multer setup ─────────────────────────────────────────────────────────────

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp|pdf|doc|docx|xls|xlsx|ppt|pptx|zip|txt/;
  const ext = path.extname(file.originalname).toLowerCase().replace(".", "");
  if (allowed.test(ext)) {
    cb(null, true);
  } else {
    // Pass error to multer — smartUpload catches it and returns 400 (not 500)
    cb(new Error(`File type .${ext} is not allowed`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB per file
});

/**
 * Smart multer middleware:
 * - If multipart → run multer (populates req.body + req.files)
 * - If JSON      → skip multer (express.json() already parsed req.body)
 *
 * FIX: multer errors (bad file type, size limit) now return 400 instead of
 * propagating as an unhandled 500. The callback form of upload.array() lets
 * us intercept the multer error object before it reaches Express error handler.
 */
const smartUpload = (req, res, next) => {
  const ct = req.headers["content-type"] || "";
  if (ct.includes("multipart/form-data")) {
    return upload.array("assets", 10)(req, res, (err) => {
      if (err) {
        // Multer-specific errors (MulterError) or our custom fileFilter errors
        const status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
        return res.status(status).json({ error: err.message });
      }
      next();
    });
  }
  next();
};

// ─── Routes ──────────────────────────────────────────────────────────────────

// Dashboard
router.get("/dashboard", protect, taskController.getDashboardSummary);

// ── Notifications (BEFORE /tasks/:id to avoid param collision) ──
router.get("/tasks/notifications",             protect, taskController.getNotifications);
router.patch("/tasks/notifications/mark-seen", protect, taskController.markNotificationsSeen);

// ── Task CRUD ──
router.post("/tasks",      protect, smartUpload, taskController.createTask);
router.patch("/tasks/:id", protect, smartUpload, taskController.updateTask);

// Static count routes — BEFORE /:id to prevent param swallowing
router.get("/tasks/count",            protect, taskController.getTasksCount);
router.get("/tasks/completed/count",  protect, taskController.getCompletedTasksCount);
router.get("/tasks/inprogress/count", protect, taskController.getInProgressTasksCount);
router.get("/tasks/todos/count",      protect, taskController.getTodoTasksCount);
router.get("/tasks",                  protect, taskController.getAllTasks);

// Parameterised task routes
router.get("/tasks/:id", protect, taskController.getTaskById);

// Team member: update status + upload assets only
router.patch("/tasks/:id/status", protect, smartUpload, taskController.updateTaskStatus);

// Remove a single asset from a task
router.patch("/tasks/:id/remove-asset", protect, taskController.removeAsset);

router.delete("/tasks/:id", protect, taskController.deleteTask);

// Activity
router.post("/tasks/:id/activity", protect, taskController.addActivity);

// Sub-tasks — plain JSON, no file uploads
router.post("/tasks/:id/subtasks",             protect, taskController.addSubTask);
router.patch("/tasks/:id/subtasks/:subTaskId", protect, taskController.updateSubTask);

module.exports = router;
