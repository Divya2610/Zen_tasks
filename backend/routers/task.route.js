const express = require("express");
const router = new express.Router();
const taskController = require("../controllers/task.controller");

// create new task
router.post("/tasks", taskController.createTask);

// get total tasks count
router.get("/tasks/count", taskController.getTasksCount);

// get individual task details
router.get("/tasks/:id", taskController.getTaskById);

// get all the tasks with details
router.get("/tasks", taskController.getAllTasks);

// update any task with id
router.patch("/tasks/:id", taskController.updateTask);

// delete any task with id
router.delete("/tasks/:id", taskController.deleteTask);

// New routes for task stages
router.get("/tasks/completed/count", taskController.getCompletedTasksCount);
router.get("/tasks/inprogress/count", taskController.getInProgressTasksCount);
router.get("/tasks/todos/count", taskController.getTodoTasksCount);

module.exports = router;
