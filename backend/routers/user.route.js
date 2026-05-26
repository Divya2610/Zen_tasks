const express = require('express');
const router = new express.Router();
const userController = require("../controllers/user-controller");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// import express from 'express';
// import { createUser, loginUser, logoutUser } from '../controllers/user-controller.js';


router.post('/signup', userController.createUser);
router.post('/signin', userController.loginUser);
router.post('/signout', userController.logoutUser); 

router.post("/users", protect, adminOnly, userController.createUser);

// router.post("/users/login", userController.loginUser);

router.get("/users", protect, adminOnly, userController.getUsers);

router.get("/users/:id", protect, adminOnly, userController.getUserById);

router.patch("/users/:id", protect, adminOnly, userController.updateUser);

router.patch("/users/:id/toggle-active", protect, adminOnly, userController.toggleUserActive);

router.delete("/users/:id", protect, adminOnly, userController.deleteUser);

module.exports = router;
