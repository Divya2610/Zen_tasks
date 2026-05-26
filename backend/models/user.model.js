const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: false,        // usernames can repeat — intentional
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,         // ✅ FIXED: emails must be unique
      lowercase: true,
      trim: true,
    },
    designation: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "member"],
      default: "member",
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;

// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema(
//   {
//     username: {
//       type: String,
//       required: true,
//       unique: false,
//     },
//     email: {
//       type: String,
//       required: true,
//       unique: false,
//     },
//     designation: {
//       type: String,
//       required: true,
//       unique: false,
//     },
//     password: {
//       type: String,
//       required: true,
//     },
//   },
//   { timestamps: true }
// );

// const User = mongoose.model("User", userSchema);

// module.exports = User;
