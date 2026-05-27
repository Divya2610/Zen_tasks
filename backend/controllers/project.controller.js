const Project = require("../models/project.model.js");
const Task = require("../models/task.model.js");

// GET all projects (admin sees all, user sees assigned)
const getProjects = async (req, res) => {
  try {
    const { id: userId, role } = req.user; // ← fixed
    const query = role === "admin" ? {} : { team: userId };

    const projects = await Project.find(query)
      .populate("team", "username email profilePicture")
      .populate("createdBy", "username email")
      .sort({ createdAt: -1 });

    res.status(200).json({ status: true, projects });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
};

// GET single project with full task + subtask tree
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id)
      .populate("team", "username email profilePicture")
      .populate("createdBy", "username email")
      .populate({
        path: "tasks",
        populate: [
          { path: "team", select: "username email profilePicture" },
          {
            path: "subTasks",
            populate: { path: "team", select: "username email profilePicture" },
          },
        ],
      });

    if (!project)
      return res.status(404).json({ status: false, message: "Project not found" });

    res.status(200).json({ status: true, project });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
};

// POST create project (admin only)
const createProject = async (req, res) => {
  try {
    const { id: userId } = req.user; // ← fixed: was userId, now id
    const { name, description, color, status, tasks, team } = req.body;

    const project = await Project.create({
      name,
      description,
      color,
      status: status || "active",
      tasks: tasks || [],
      team: team || [],
      createdBy: userId,
    });

    res.status(201).json({ status: true, project });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
};

// PUT update project (admin only)
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const project = await Project.findByIdAndUpdate(id, updates, { new: true })
      .populate("team", "username email profilePicture")
      .populate("createdBy", "username email");

    if (!project)
      return res.status(404).json({ status: false, message: "Project not found" });

    res.status(200).json({ status: true, project });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
};

// DELETE project (admin only)
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByIdAndDelete(id);

    if (!project)
      return res.status(404).json({ status: false, message: "Project not found" });

    res.status(200).json({ status: true, message: "Project deleted" });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
};

// POST add task to project
const addTaskToProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { taskId } = req.body;

    const project = await Project.findByIdAndUpdate(
      id,
      { $addToSet: { tasks: taskId } },
      { new: true }
    );

    res.status(200).json({ status: true, project });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
};

// DELETE remove task from project
const removeTaskFromProject = async (req, res) => {
  try {
    const { id, taskId } = req.params;

    const project = await Project.findByIdAndUpdate(
      id,
      { $pull: { tasks: taskId } },
      { new: true }
    );

    res.status(200).json({ status: true, project });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addTaskToProject,
  removeTaskFromProject,
};