const Task = require("../models/task.model");
const path = require("path");

// ─── Helpers ──────────────────────────────────────────────────────────────────

const parseArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [value];
  }
};

/**
 * Convert multer files → structured asset objects.
 * @param {Express.Multer.File[]} files
 * @param {string} userId   - ObjectId of the uploader
 * @param {"admin"|"member"} role
 */
const filesToAssets = (files = [], userId, role = "admin") =>
  files.map((f) => ({
    url:            `/uploads/${f.filename}`,
    name:           f.originalname || f.filename,
    uploadedBy:     userId,
    uploadedByRole: role,
  }));

// ─── Controllers ──────────────────────────────────────────────────────────────

const createTask = async (req, res) => {
  try {
    const { title, stage, date, priority, team } = req.body;
    const adminId = req.user?._id || req.user?.id;

    if (!title || !stage || !date || !priority) {
      return res.status(400).json({ error: "Title, stage, date, and priority are required" });
    }

    const assets  = filesToAssets(req.files, adminId, "admin");
    const teamIds = parseArray(team);

    const task = new Task({ title, stage: stage || "todo", date, priority, team: teamIds, assets });
    await task.save();
    await task.populate("team", "-password");

    if (teamIds.length > 0) {
      task.notifications = teamIds.map((userId) => ({
        forAdmin: false,
        forUser:  userId,
        message:  `You have been assigned a new task: "${title}"`,
        seen:     false,
      }));
      await task.save();
    }

    res.status(201).json({ message: "Task created successfully", task });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("team", "-password")
      .populate("activities.by", "-password")
      .populate("subTasks.assignedTo", "-password")
      .populate("notifications.forUser", "-password")
      .populate("assets.uploadedBy", "name email");          // ← NEW: populate uploader info

    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (error) {
    console.error("Error fetching task by ID:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find({})
      .populate("team", "-password")
      .populate("activities.by", "-password")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error("Error fetching all tasks:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    const { title, stage, date, priority, team, existingAssets } = req.body;
    const adminId = req.user?._id || req.user?.id;

    const VALID_PRIORITIES = ["high", "medium", "low"];
    const VALID_STAGES     = ["todo", "in progress", "completed"];

    if (priority !== undefined && !VALID_PRIORITIES.includes(priority))
      return res.status(400).json({ error: `Invalid priority "${priority}".` });
    if (stage !== undefined && !VALID_STAGES.includes(stage))
      return res.status(400).json({ error: `Invalid stage "${stage}".` });

    if (title    !== undefined) task.title    = title;
    if (stage    !== undefined) task.stage    = stage;
    if (date     !== undefined) task.date     = date;
    if (priority !== undefined) task.priority = priority;
    if (team     !== undefined) task.team     = parseArray(team);

    // ── Asset merging ─────────────────────────────────────────────────────────
    // existingAssets: JSON array of URL strings the frontend wants to keep.
    // req.files: any new files the admin is adding now.
    //
    // We filter task.assets to only keep objects whose .url is in the keep-list,
    // then append newly uploaded files as structured asset objects.

    if (existingAssets !== undefined) {
      const keepUrls = new Set(parseArray(existingAssets));
      task.assets = task.assets.filter((a) => keepUrls.has(a.url ?? a));
    }

    if (req.files && req.files.length > 0) {
      task.assets.push(...filesToAssets(req.files, adminId, "admin"));
    }
    // ── end asset merge ───────────────────────────────────────────────────────

    await task.save();
    await task.populate("team", "-password");
    res.json(task);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(400).json({ error: error.message || "Bad Request" });
  }
};

// ─── updateTaskStatus ─────────────────────────────────────────────────────────
// Called by team members to:
//   1. Change the stage (In Progress / Done)
//   2. Upload their own attachment files
//
// Both actions independently trigger an admin notification.
// If your app uses Socket.io, emit the notification from here too — see comment below.

const updateTaskStatus = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    const memberId = req.user?._id || req.user?.id;
    const { stage } = req.body;
    const oldStage  = task.stage;

    if (stage) task.stage = stage;

    // ── Member file upload ────────────────────────────────────────────────────
    if (req.files && req.files.length > 0) {
      const newAssets = filesToAssets(req.files, memberId, "member");
      task.assets.push(...newAssets);

      task.notifications.push({
        forAdmin: true,
        message:  `A team member uploaded ${req.files.length} file(s) to task "${task.title}"`,
        seen:     false,
      });

      // ── Socket.io (if you add it later) ──────────────────────────────────
      // const io = req.app.get("io");
      // if (io) io.emit("attachment_added", { taskId: task._id, count: req.files.length });
    }

    // ── Stage change ──────────────────────────────────────────────────────────
    if (stage && stage !== oldStage) {
      task.notifications.push({
        forAdmin: true,
        message:  `Task "${task.title}" stage changed from "${oldStage}" to "${stage}"`,
        seen:     false,
      });

      // ── Socket.io (if you add it later) ──────────────────────────────────
      // const io = req.app.get("io");
      // if (io) io.emit("status_updated", { taskId: task._id, stage });
    }

    await task.save();
    await task.populate("team", "-password");
    res.json({ message: "Task updated", task });
  } catch (error) {
    console.error("Error updating task status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const removeAsset = async (req, res) => {
  try {
    const { assetUrl } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    // Support both old string assets and new object assets
    task.assets = task.assets.filter((a) => (a.url ?? a) !== assetUrl);
    await task.save();

    res.json({ message: "Asset removed", assets: task.assets });
  } catch (error) {
    console.error("Error removing asset:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json({ message: "Task deleted", task });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ─── Activity ─────────────────────────────────────────────────────────────────

const addActivity = async (req, res) => {
  try {
    const { type, activity } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    task.activities.push({
      type:     type?.toLowerCase() || "commented",
      activity: activity || "",
      date:     new Date(),
      by:       req.user?._id || req.user?.id,
    });

    if (!req.user?.isAdmin) {
      task.notifications.push({
        forAdmin: true,
        message:  `Team member added a "${type}" activity on task "${task.title}": ${activity}`,
        seen:     false,
      });
    }

    await task.save();
    await task.populate("activities.by", "-password");
    res.status(201).json({ message: "Activity added successfully", activities: task.activities });
  } catch (error) {
    console.error("Error adding activity:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ─── Sub-tasks ────────────────────────────────────────────────────────────────

const addSubTask = async (req, res) => {
  try {
    const { title, date, tag, assignedTo } = req.body;
    if (!title || !date) return res.status(400).json({ error: "Title and date are required" });

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    const assignedIds = parseArray(assignedTo);
    task.subTasks.push({ title, date: new Date(date), tag: tag || "", assignedTo: assignedIds });

    if (assignedIds.length > 0) {
      assignedIds.forEach((userId) => {
        task.notifications.push({
          forAdmin: false,
          forUser:  userId,
          message:  `You have been assigned a new sub-task: "${title}" on task "${task.title}"`,
          seen:     false,
        });
      });
    }

    await task.save();
    await task.populate("subTasks.assignedTo", "-password");
    res.status(201).json({ message: "Sub-task added successfully", subTasks: task.subTasks });
  } catch (error) {
    console.error("Error adding sub-task:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

const updateSubTask = async (req, res) => {
  try {
    const { subTaskId } = req.params;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    const sub = task.subTasks.id(subTaskId);
    if (!sub) return res.status(404).json({ error: "Sub-task not found" });

    const { title, date, tag, assignedTo, completed } = req.body;
    if (title      !== undefined) sub.title      = title;
    if (date       !== undefined) sub.date       = new Date(date);
    if (tag        !== undefined) sub.tag        = tag;
    if (assignedTo !== undefined) sub.assignedTo = parseArray(assignedTo);
    if (completed  !== undefined) sub.completed  = completed;

    await task.save();
    res.json({ message: "Sub-task updated", subTasks: task.subTasks });
  } catch (error) {
    console.error("Error updating sub-task:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ─── Notifications ────────────────────────────────────────────────────────────

const getNotifications = async (req, res) => {
  try {
    const userId  = req.user?._id || req.user?.id;
    const isAdmin = req.user?.isAdmin;

    const tasks = await Task.find({ "notifications.seen": false })
      .populate("notifications.forUser", "-password");

    const notifications = [];
    tasks.forEach((task) => {
      task.notifications.forEach((n) => {
        if (n.seen) return;
        if (isAdmin && n.forAdmin) {
          notifications.push({ taskId: task._id, taskTitle: task.title, ...n.toObject() });
        } else if (!isAdmin && n.forUser && n.forUser.toString() === userId.toString()) {
          notifications.push({ taskId: task._id, taskTitle: task.title, ...n.toObject() });
        }
      });
    });

    res.json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const markNotificationsSeen = async (req, res) => {
  try {
    const userId  = req.user?._id || req.user?.id;
    const isAdmin = req.user?.isAdmin;

    const tasks = await Task.find({ "notifications.seen": false });
    for (const task of tasks) {
      let changed = false;
      task.notifications.forEach((n) => {
        if (n.seen) return;
        if (isAdmin && n.forAdmin)                                         { n.seen = true; changed = true; }
        else if (!isAdmin && n.forUser?.toString() === userId.toString())  { n.seen = true; changed = true; }
      });
      if (changed) await task.save();
    }

    res.json({ message: "Notifications marked as seen" });
  } catch (error) {
    console.error("Error marking notifications:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ─── Counts & dashboard ───────────────────────────────────────────────────────

const getTasksCount            = async (req, res) => { try { res.json({ count: await Task.countDocuments({}) });                          } catch { res.status(500).json({ error: "Internal Server Error" }); } };
const getCompletedTasksCount   = async (req, res) => { try { res.json({ count: await Task.countDocuments({ stage: "completed" }) });      } catch { res.status(500).json({ error: "Internal Server Error" }); } };
const getInProgressTasksCount  = async (req, res) => { try { res.json({ count: await Task.countDocuments({ stage: "in progress" }) });   } catch { res.status(500).json({ error: "Internal Server Error" }); } };
const getTodoTasksCount        = async (req, res) => { try { res.json({ count: await Task.countDocuments({ stage: "todo" }) });           } catch { res.status(500).json({ error: "Internal Server Error" }); } };

const getDashboardSummary = async (req, res, next) => {
  try {
    const User = require("../models/user.model");
    const [totalTasks, completedTasks, inProgressTasks, todoTasks, recentTasks, users] =
      await Promise.all([
        Task.countDocuments({}),
        Task.countDocuments({ stage: "completed" }),
        Task.countDocuments({ stage: "in progress" }),
        Task.countDocuments({ stage: "todo" }),
        Task.find({}).populate("team", "-password").sort({ createdAt: -1 }).limit(10),
        User.find({}).select("-password").limit(10),
      ]);
    res.status(200).json({ totalTasks, completedTasks, inProgressTasks, todoTasks, recentTasks, users });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask, getTaskById, getAllTasks,
  updateTask, updateTaskStatus, removeAsset, deleteTask,
  addActivity, addSubTask, updateSubTask,
  getTasksCount, getCompletedTasksCount, getInProgressTasksCount, getTodoTasksCount,
  getDashboardSummary, getNotifications, markNotificationsSeen,
};