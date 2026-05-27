const express = require("express");
const router  = express.Router();

const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addTaskToProject,
  removeTaskFromProject,
} = require("../controllers/project.controller.js");

const { protect, adminOnly } = require("../middleware/authMiddleware.js");

// ─── Routes ───────────────────────────────────────────────────────────────────
router.get("/",                         protect, getProjects);
router.get("/:id",                      protect, getProjectById);
router.post("/",                        protect, adminOnly, createProject);      // admin only
router.put("/:id",                      protect, adminOnly, updateProject);      // admin only
router.delete("/:id",                   protect, adminOnly, deleteProject);      // admin only
router.post("/:id/tasks",              protect, addTaskToProject);
router.delete("/:id/tasks/:taskId",    protect, removeTaskFromProject);

module.exports = router;