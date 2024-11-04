const express = require('express');
const router = new express.Router();
const userController = require("../controllers/user-controller");

// import express from 'express';
// import { createUser, loginUser, logoutUser } from '../controllers/user-controller.js';


router.post('/signup', userController.createUser);
router.post('/signin', userController.loginUser);
router.post('/signout', userController.logoutUser); 

// router.post("/users", userController.createUser);

// router.post("/users/login", userController.loginUser);

router.get("/users", userController.getUsers);

router.get("/users/:id", userController.getUserById);

router.patch("/users/:id", userController.updateUser);

router.delete("/users/:id", userController.deleteUser);

module.exports = router;
