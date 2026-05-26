// import Notice from "../models/notification.model.js";
// import Task from "../models/task.model.js";
// import User from "../models/user.model.js";

// // ─── Helpers ────────────────────────────────────────────────────────────────
// const isAdmin = (user) => user.isAdmin;

// // ─── Create Task (Admin only) ────────────────────────────────────────────────
// export const createTask = async (req, res) => {
//   try {
//     if (!isAdmin(req.user)) {
//       return res
//         .status(403)
//         .json({ status: false, message: "Access denied. Admins only." });
//     }

//     const { title, team, stage, date, priority, assets, description } =
//       req.body;

//     let text = "New task has been assigned to you";
//     if (team?.length > 1) {
//       text += ` and ${team.length - 1} others.`;
//     }
//     text += ` The task priority is set to ${priority} priority, so check and act accordingly. The task date is ${new Date(
//       date
//     ).toDateString()}. Thank you!!!`;

//     const activity = {
//       type: "assigned",
//       activity: text,
//       by: req.user.userId,
//     };

//     const task = await Task.create({
//       title,
//       team,
//       stage: stage.toLowerCase(),
//       date,
//       priority: priority.toLowerCase(),
//       assets,
//       description,
//       activities: [activity],
//     });

//     await Notice.create({
//       team,
//       text,
//       task: task._id,
//     });

//     res
//       .status(200)
//       .json({ status: true, task, message: "Task created successfully." });
//   } catch (error) {
//     console.log(error);
//     return res.status(400).json({ status: false, message: error.message });
//   }
// };

// // ─── Duplicate Task (Admin only) ─────────────────────────────────────────────
// export const duplicateTask = async (req, res) => {
//   try {
//     if (!isAdmin(req.user)) {
//       return res
//         .status(403)
//         .json({ status: false, message: "Access denied. Admins only." });
//     }

//     const { id } = req.params;
//     const task = await Task.findById(id);

//     const newTask = await Task.create({
//       ...task.toObject(),
//       title: "Copy of " + task.title,
//       _id: undefined,
//       createdAt: undefined,
//       updatedAt: undefined,
//     });

//     newTask.team = task.team;
//     newTask.subTasks = task.subTasks;
//     newTask.assets = task.assets;
//     newTask.priority = task.priority;
//     newTask.stage = task.stage;

//     await newTask.save();

//     const text = "New task has been assigned to you";
//     const activity = {
//       type: "assigned",
//       activity: text,
//       by: req.user.userId,
//     };

//     await Notice.create({
//       team: newTask.team,
//       text,
//       task: newTask._id,
//     });

//     res
//       .status(200)
//       .json({ status: true, message: "Task duplicated successfully." });
//   } catch (error) {
//     console.log(error);
//     return res.status(400).json({ status: false, message: error.message });
//   }
// };

// // ─── Post Activity / Upload Doc ──────────────────────────────────────────────
// // Team members can add activity (comment) and upload a document.
// // Status change is also handled here.
// export const postTaskActivity = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { userId } = req.user;
//     const { type, activity, docUrl } = req.body;

//     const task = await Task.findById(id);
//     if (!task) {
//       return res
//         .status(404)
//         .json({ status: false, message: "Task not found." });
//     }

//     // Team members can only interact with tasks assigned to them
//     if (!isAdmin(req.user)) {
//       const isAssigned = task.team.some(
//         (member) => member.toString() === userId
//       );
//       if (!isAssigned) {
//         return res.status(403).json({
//           status: false,
//           message: "Access denied. You are not assigned to this task.",
//         });
//       }
//     }

//     const activityData = {
//       type,
//       activity,
//       by: userId,
//     };

//     // If a doc was uploaded, attach URL
//     if (docUrl) {
//       activityData.docUrl = docUrl;
//     }

//     task.activities.push(activityData);
//     await task.save();

//     res
//       .status(200)
//       .json({ status: true, message: "Activity posted successfully." });
//   } catch (error) {
//     console.log(error);
//     return res.status(400).json({ status: false, message: error.message });
//   }
// };

// // ─── Update Task Status (Team member: only their assigned tasks) ──────────────
// export const updateTaskStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { userId } = req.user;
//     const { stage } = req.body;

//     const task = await Task.findById(id);
//     if (!task) {
//       return res
//         .status(404)
//         .json({ status: false, message: "Task not found." });
//     }

//     if (!isAdmin(req.user)) {
//       const isAssigned = task.team.some(
//         (member) => member.toString() === userId
//       );
//       if (!isAssigned) {
//         return res.status(403).json({
//           status: false,
//           message: "Access denied. You are not assigned to this task.",
//         });
//       }
//     }

//     task.stage = stage.toLowerCase();
//     task.activities.push({
//       type: "in progress",
//       activity: `Task status updated to "${stage}" by ${req.user.name}`,
//       by: userId,
//     });

//     await task.save();

//     res
//       .status(200)
//       .json({ status: true, message: "Task status updated successfully." });
//   } catch (error) {
//     console.log(error);
//     return res.status(400).json({ status: false, message: error.message });
//   }
// };

// // ─── Get Dashboard Stats ──────────────────────────────────────────────────────
// export const getDashboardStats = async (req, res) => {
//   try {
//     const { userId, isAdmin: admin } = req.user;

//     const taskQuery = admin ? {} : { team: userId };

//     const allTasks = await Task.find(taskQuery)
//       .populate("team", "name role title email")
//       .sort({ _id: -1 });

//     const users = admin
//       ? await User.find({ isActive: true })
//           .select("name title role isAdmin createdAt")
//           .limit(10)
//           .sort({ _id: -1 })
//       : [];

//     const groupedTasks = allTasks.reduce((result, task) => {
//       const stage = task.stage;
//       if (!result[stage]) {
//         result[stage] = 1;
//       } else {
//         result[stage] += 1;
//       }
//       return result;
//     }, {});

//     const graphData = Object.keys(groupedTasks).map((label) => ({
//       name: label,
//       total: groupedTasks[label],
//     }));

//     const totalTasks = allTasks.length;
//     const last10Task = allTasks.slice(0, 10);

//     const summary = {
//       totalTasks,
//       last10Task,
//       users,
//       tasks: groupedTasks,
//       graphData,
//     };

//     res.status(200).json({
//       status: true,
//       ...summary,
//       message: "Successfully fetched dashboard stats.",
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(400).json({ status: false, message: error.message });
//   }
// };

// // ─── Get All Tasks ────────────────────────────────────────────────────────────
// // Admin: sees all tasks. Team member: sees only their assigned tasks.
// export const getTasks = async (req, res) => {
//   try {
//     const { userId, isAdmin: admin } = req.user;
//     const { stage, isTrashed } = req.query;

//     let query = { isTrashed: isTrashed === "true" };

//     if (!admin) {
//       // Team member only sees tasks assigned to them
//       query.team = userId;
//     }

//     if (stage) {
//       query.stage = stage;
//     }

//     let queryResult = Task.find(query)
//       .populate({
//         path: "team",
//         select: "name title email",
//       })
//       .sort({ _id: -1 });

//     const tasks = await queryResult;

//     res.status(200).json({
//       status: true,
//       tasks,
//       message: "Tasks fetched successfully.",
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(400).json({ status: false, message: error.message });
//   }
// };

// // ─── Get Single Task ──────────────────────────────────────────────────────────
// export const getTask = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { userId, isAdmin: admin } = req.user;

//     const task = await Task.findById(id)
//       .populate({
//         path: "team",
//         select: "name title role email",
//       })
//       .populate({
//         path: "activities.by",
//         select: "name",
//       });

//     if (!task) {
//       return res
//         .status(404)
//         .json({ status: false, message: "Task not found." });
//     }

//     if (!admin) {
//       const isAssigned = task.team.some(
//         (member) => member._id.toString() === userId
//       );
//       if (!isAssigned) {
//         return res.status(403).json({
//           status: false,
//           message: "Access denied. You are not assigned to this task.",
//         });
//       }
//     }

//     res.status(200).json({ status: true, task });
//   } catch (error) {
//     console.log(error);
//     return res.status(400).json({ status: false, message: error.message });
//   }
// };

// // ─── Create Sub-Task (Admin only) ────────────────────────────────────────────
// export const createSubTask = async (req, res) => {
//   try {
//     if (!isAdmin(req.user)) {
//       return res
//         .status(403)
//         .json({ status: false, message: "Access denied. Admins only." });
//     }

//     const { title, tag, date } = req.body;
//     const { id } = req.params;

//     const newSubTask = { title, date, tag };

//     const task = await Task.findById(id);
//     task.subTasks.push(newSubTask);
//     await task.save();

//     res
//       .status(200)
//       .json({ status: true, message: "SubTask added successfully." });
//   } catch (error) {
//     console.log(error);
//     return res.status(400).json({ status: false, message: error.message });
//   }
// };

// // ─── Update Task (Admin only) ─────────────────────────────────────────────────
// export const updateTask = async (req, res) => {
//   try {
//     if (!isAdmin(req.user)) {
//       return res
//         .status(403)
//         .json({ status: false, message: "Access denied. Admins only." });
//     }

//     const { id } = req.params;
//     const { title, date, team, stage, priority, assets, description } =
//       req.body;

//     const task = await Task.findById(id);

//     task.title = title;
//     task.date = date;
//     task.priority = priority.toLowerCase();
//     task.assets = assets;
//     task.stage = stage.toLowerCase();
//     task.team = team;
//     task.description = description;

//     await task.save();

//     res
//       .status(200)
//       .json({ status: true, message: "Task updated successfully." });
//   } catch (error) {
//     console.log(error);
//     return res.status(400).json({ status: false, message: error.message });
//   }
// };

// // ─── Trash / Restore / Delete Task (Admin only) ──────────────────────────────
// export const trashTask = async (req, res) => {
//   try {
//     if (!isAdmin(req.user)) {
//       return res
//         .status(403)
//         .json({ status: false, message: "Access denied. Admins only." });
//     }

//     const { id } = req.params;
//     const task = await Task.findById(id);
//     task.isTrashed = true;
//     await task.save();

//     res
//       .status(200)
//       .json({ status: true, message: `Task trashed successfully.` });
//   } catch (error) {
//     console.log(error);
//     return res.status(400).json({ status: false, message: error.message });
//   }
// };

// export const deleteRestoreTask = async (req, res) => {
//   try {
//     if (!isAdmin(req.user)) {
//       return res
//         .status(403)
//         .json({ status: false, message: "Access denied. Admins only." });
//     }

//     const { id } = req.params;
//     const { actionType } = req.query;

//     if (actionType === "delete") {
//       await Task.findByIdAndDelete(id);
//     } else if (actionType === "deleteAll") {
//       await Task.deleteMany({ isTrashed: true });
//     } else if (actionType === "restore") {
//       const resp = await Task.findById(id);
//       resp.isTrashed = false;
//       resp.save();
//     } else if (actionType === "restoreAll") {
//       await Task.updateMany(
//         { isTrashed: true },
//         { $set: { isTrashed: false } }
//       );
//     }

//     res.status(200).json({ status: true, message: "Operation performed successfully." });
//   } catch (error) {
//     console.log(error);
//     return res.status(400).json({ status: false, message: error.message });
//   }
// };

// // ─── Upload Document for Task (Team member: only assigned tasks) ──────────────
// export const uploadTaskDocument = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { userId } = req.user;

//     const task = await Task.findById(id);
//     if (!task) {
//       return res
//         .status(404)
//         .json({ status: false, message: "Task not found." });
//     }

//     if (!isAdmin(req.user)) {
//       const isAssigned = task.team.some(
//         (member) => member.toString() === userId
//       );
//       if (!isAssigned) {
//         return res.status(403).json({
//           status: false,
//           message: "Access denied. You are not assigned to this task.",
//         });
//       }
//     }

//     if (!req.file) {
//       return res
//         .status(400)
//         .json({ status: false, message: "No file uploaded." });
//     }

//     const fileUrl = `/uploads/${req.file.filename}`;

//     task.assets.push(fileUrl);
//     task.activities.push({
//       type: "commented",
//       activity: `Document uploaded: ${req.file.originalname}`,
//       by: userId,
//       docUrl: fileUrl,
//     });

//     await task.save();

//     res.status(200).json({
//       status: true,
//       message: "Document uploaded successfully.",
//       fileUrl,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(400).json({ status: false, message: error.message });
//   }
// };

const Task = require("../models/task.model");
const path = require("path");

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isAdmin = (user) => user?.role === "admin";

const getUserId = (user) => user?._id || user?.id;

const getTaskScope = (user) => (isAdmin(user) ? {} : { team: getUserId(user) });

const assertAdmin = (req, res) => {
  if (!isAdmin(req.user)) {
    res.status(403).json({ error: "Admin access required" });
    return false;
  }
  return true;
};

const isTaskAssignedToUser = (task, userId) => {
  if (!task?.team?.length) return false;
  const uid = userId?.toString?.() ?? String(userId);
  return task.team.some((t) => t?.toString?.() === uid);
};

const assertTaskAssigned = (task, req, res) => {
  const memberId = getUserId(req.user);
  if (!isTaskAssignedToUser(task, memberId)) {
    res.status(403).json({ error: "Access denied. You are not assigned to this task." });
    return false;
  }
  return true;
};


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
    if (!assertAdmin(req, res)) return;

    const { title, date, priority, team } = req.body;
    const adminId = getUserId(req.user);

    if (!title || !date || !priority) {

      return res.status(400).json({ error: "Title, date, and priority are required" });
    }

    const assets  = filesToAssets(req.files, adminId, "admin");
    const teamIds = parseArray(team);

    const task = new Task({ title, stage: "todo", date, priority, team: teamIds, assets });
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

    if (!isAdmin(req.user) && !assertTaskAssigned(task, req, res)) return;

    res.json(task);

  } catch (error) {
    console.error("Error fetching task by ID:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAllTasks = async (req, res) => {
  try {
    const tasksQuery = isAdmin(req.user) ? {} : { team: getUserId(req.user) };

    const tasks = await Task.find(tasksQuery)

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
    if (!assertAdmin(req, res)) return;
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ error: "Task not found" });

    const { title, stage, date, priority, team, existingAssets } = req.body;
    const adminId = getUserId(req.user);


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
    if (!assertTaskAssigned(task, req, res)) return;

    const memberId = getUserId(req.user);

    const { stage } = req.body;
    const oldStage  = task.stage;
    const VALID_STAGES = ["todo", "in progress", "completed"];

    if (stage) {
      if (!VALID_STAGES.includes(stage)) {
        return res.status(400).json({ error: `Invalid stage "${stage}".` });
      }
      task.stage = stage;
    }

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

    if (!isAdmin(req.user) && !assertTaskAssigned(task, req, res)) return;

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
    if (!assertAdmin(req, res)) return;
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

    if (!isAdmin(req.user) && !assertTaskAssigned(task, req, res)) return;



    task.activities.push({
      type:     type?.toLowerCase() || "commented",
      activity: activity || "",
      date:     new Date(),
      by:       req.user?._id || req.user?.id,
    });

    if (!isAdmin(req.user)) {
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
    if (!assertAdmin(req, res)) return;

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
    if (!assertAdmin(req, res)) return;
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
    const userId  = getUserId(req.user);

    const adminView = isAdmin(req.user);

    const tasks = await Task.find({ "notifications.seen": false })
      .populate("notifications.forUser", "-password");

    const notifications = [];
    tasks.forEach((task) => {
      task.notifications.forEach((n) => {
        if (n.seen) return;
        if (adminView && n.forAdmin) {
          notifications.push({ taskId: task._id, taskTitle: task.title, ...n.toObject() });
        } else if (!adminView && n.forUser && n.forUser.toString() === userId.toString()) {
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
    const userId  = getUserId(req.user);
    const adminView = isAdmin(req.user);



    const tasks = await Task.find({ "notifications.seen": false });
    for (const task of tasks) {
      let changed = false;
      task.notifications.forEach((n) => {
        if (n.seen) return;
        if (adminView && n.forAdmin)                                       { n.seen = true; changed = true; }
        else if (!adminView && n.forUser?.toString() === userId.toString()) { n.seen = true; changed = true; }
      })
      if (changed) await task.save();
    }

    res.json({ message: "Notifications marked as seen" });
  } catch (error) {
    console.error("Error marking notifications:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ─── Counts & dashboard ───────────────────────────────────────────────────────

const getTasksCount            = async (req, res) => { try { res.json({ count: await Task.countDocuments(getTaskScope(req.user)) }); } catch { res.status(500).json({ error: "Internal Server Error" }); } };
const getCompletedTasksCount   = async (req, res) => { try { res.json({ count: await Task.countDocuments({ ...getTaskScope(req.user), stage: "completed" }) }); } catch { res.status(500).json({ error: "Internal Server Error" }); } };
const getInProgressTasksCount  = async (req, res) => { try { res.json({ count: await Task.countDocuments({ ...getTaskScope(req.user), stage: "in progress" }) }); } catch { res.status(500).json({ error: "Internal Server Error" }); } };
const getTodoTasksCount        = async (req, res) => { try { res.json({ count: await Task.countDocuments({ ...getTaskScope(req.user), stage: "todo" }) }); } catch { res.status(500).json({ error: "Internal Server Error" }); } };

const getDashboardSummary = async (req, res, next) => {
  try {
    const User = require("../models/user.model");
    const taskScope = getTaskScope(req.user);
    const [totalTasks, completedTasks, inProgressTasks, todoTasks, recentTasks, users] =
      await Promise.all([
        Task.countDocuments(taskScope),
        Task.countDocuments({ ...taskScope, stage: "completed" }),
        Task.countDocuments({ ...taskScope, stage: "in progress" }),
        Task.countDocuments({ ...taskScope, stage: "todo" }),
        Task.find(taskScope).populate("team", "-password").sort({ createdAt: -1 }).limit(10),
        isAdmin(req.user) ? User.find({}).select("-password").limit(10) : [],
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
