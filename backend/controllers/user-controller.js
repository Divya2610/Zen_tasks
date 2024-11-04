const User = require('../models/user.model.js');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const createUser = async (req, res, next) => {
    const { username, email, designation, role, password } = req.body;
    const hashedPassword = bcryptjs.hashSync(password, 10);

    // Create new user object, including the role
    const newUser = new User({ 
        username, 
        email, 
        designation, 
        role, // Save role here
        password: hashedPassword 
    });

    try {
        await newUser.save();
        res.status(201).json({ message: 'User created successfully', role: newUser.role });
    } catch (error) {
        next(error);
    }
};

const loginUser = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const validUser = await User.findOne({ email });

        // If user not found, return error
        if (!validUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare passwords
        const validPassword = await bcryptjs.compare(password, validUser.password);

        // If passwords don't match, return error
        if (!validPassword) {
            return res.status(401).json({ message: 'Wrong credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: validUser._id, role: validUser.role }, process.env.JWT_SECRET);

        // Set token in cookie and send response with user role
        res.cookie('access_token', token, { httpOnly: true });
        res.status(200).json({ message: 'Login successful', role: validUser.role });
    } catch (error) {
        next(error);
    }
};

const logoutUser = (req, res) => {
    res.clearCookie('access_token').status(200).json({ message: 'Logout successful' });
};

const getUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).send(users);
    } catch (e) {
        res.status(500).send();
    }
};

const getUserById = async (req, res) => {
    const _id = req.params.id;
    try {
        const user = await User.findById(_id);
        if (!user) {
            return res.status(404).send();
        }
        res.send(user);
    } catch (e) {
        res.status(500).send();
    }
};

const updateUser = async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'age', 'password', 'role']; // Allow role updates too
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send('error: Invalid updates');
    }

    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).send();
        }

        updates.forEach((update) => {
            user[update] = req.body[update];
        });

        await user.save();
        res.send(user);
    } catch (e) {
        res.status(400).send(e);
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            res.status(404).send();
        }
        res.send(user);
    } catch (e) {
        res.status(404).send(e);
    }
};

module.exports = {
    createUser,
    loginUser,
    logoutUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser
};

// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const bcrypt = require('bcryptjs');

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Middleware
// app.use(cors());
// app.use(bodyParser.json());

// // MongoDB Connection
// mongoose.connect('mongodb://localhost:27017/yourdbname', { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(() => console.log('MongoDB connected'))
//     .catch(err => console.log(err));

// // User Schema
// const userSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     role: { type: String, required: true },
// });

// const User = mongoose.model('User', userSchema);

// // Signup Route
// app.post('/api/signup', async (req, res) => {
//     const { name, email, password, role } = req.body;

//     try {
//         const hashedPassword = await bcrypt.hash(password, 10);
//         const newUser = new User({ name, email, password: hashedPassword, role });
//         await newUser.save();
//         res.status(201).json({ message: 'User registered successfully!' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Error registering user!' });
//     }
// });

// // Start Server
// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });