const User = require("../models/user.model.js");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

const createUser = async (req, res, next) => {
  const { username, email, designation, role, password } = req.body;

  if (!username || !email || !password || !designation) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const hashedPassword = bcryptjs.hashSync(password, 10);

  const newUser = new User({
    username,
    email,
    designation,
    role,
    password: hashedPassword,
  });

  try {
    await newUser.save();
    res.status(201).json({ message: "User created successfully", role: newUser.role });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const validUser = await User.findOne({ email });

    if (!validUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const validPassword = await bcryptjs.compare(password, validUser.password);

    if (!validPassword) {
      return res.status(401).json({ message: "Wrong credentials" });
    }

    const token = jwt.sign(
      { id: validUser._id, role: validUser.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    const userToReturn = {
      _id: validUser._id,
      username: validUser.username,
      email: validUser.email,
      designation: validUser.designation,
      role: validUser.role,
    };

    res.cookie("access_token", token, { httpOnly: true });
    res.status(200).json({
      message: "Login successful",
      user: userToReturn,
    });
  } catch (error) {
    next(error);
  }
};

const logoutUser = (req, res) => {
  res.clearCookie("access_token").status(200).json({ message: "Logout successful" });
};

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select("-password");
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  const _id = req.params.id;
  try {
    const user = await User.findById(_id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["username", "email", "designation", "role", "password"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).json({ error: "Invalid updates" });
  }

  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ FIX: Hash the password before saving if it's being updated.
    // Previously, a plain-text password would be stored directly in the DB.
    if (req.body.password) {
      req.body.password = bcryptjs.hashSync(req.body.password, 10);
    }

    updates.forEach((update) => {
      user[update] = req.body[update];
    });

    await user.save();

    const updatedUser = await User.findById(req.params.id).select("-password");
    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUser,
  loginUser,
  logoutUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};
