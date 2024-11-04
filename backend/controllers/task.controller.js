const Task = require("../models/task.model");

const createTask = async (req, res) => {
  try {
    const { title, stage, date, priority } = req.body;

    if (!title || !stage || !date || !priority) {
      return res
        .status(400)
        .json({ error: "Title, stage, date, and priority are required" });
    }

    const task = new Task({ title, stage, date, priority });
    await task.save();

    console.log("Task added"); // Log message for successful task addition
    res.status(201).json({ message: "Task created successfully", task });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getTaskById = async (req, res) => {
  const _id = req.params.id;
  try {
    const task = await Task.findById(_id);
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (error) {
    console.error("Error fetching task by ID:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find({});
    res.send(tasks);
  } catch (error) {
    console.error("Error fetching all tasks:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateTask = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["title", "stage", "date", "priority"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).send();
    }

    updates.forEach((update) => {
      if (update === "date") {
        // Format date as "yyyy-MM-dd"
        task[update] = new Date(req.body[update]).toISOString().split("T")[0];
      } else {
        task[update] = req.body[update];
      }
    });

    await task.save();

    res.send(task);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(400).json({ error: "Bad Request" });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getTasksCount = async (req, res) => {
  try {
    const count = await Task.countDocuments({});
    res.json({ count });
  } catch (error) {
    console.error("Error fetching tasks count:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getCompletedTasksCount = async (req, res) => {
  try {
    const count = await Task.countDocuments({ stage: "completed" });
    res.json({ count });
  } catch (error) {
    console.error("Error fetching completed tasks count:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getInProgressTasksCount = async (req, res) => {
  try {
    const count = await Task.countDocuments({ stage: "in progress" });
    res.json({ count });
  } catch (error) {
    console.error("Error fetching in progress tasks count:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getTodoTasksCount = async (req, res) => {
  try {
    const count = await Task.countDocuments({ stage: "todo" });
    res.json({ count });
  } catch (error) {
    console.error("Error fetching todo tasks count:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  createTask,
  getTaskById,
  getAllTasks,
  updateTask,
  deleteTask,
  getTasksCount,
  getCompletedTasksCount,
  getInProgressTasksCount,
  getTodoTasksCount,
};