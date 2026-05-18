const mongoose = require("mongoose");

const subTaskSchema = new mongoose.Schema({
  title:      { type: String, required: true, trim: true },
  date:       { type: Date, required: true },
  tag:        { type: String, trim: true },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  completed:  { type: Boolean, default: false },
});

// ── Asset schema ──────────────────────────────────────────────────────────────
// Each asset now tracks who uploaded it and their role so the frontend can
// show download buttons to team members and label admin vs member uploads.
const assetSchema = new mongoose.Schema(
  {
    url:            { type: String, required: true },        // e.g. /uploads/file.pdf
    name:           { type: String, default: "" },           // original filename
    uploadedBy:     { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    uploadedByRole: { type: String, enum: ["admin", "member"], default: "admin" },
  },
  { _id: true }
);

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    stage: {
      type: String,
      enum: ["todo", "in progress", "completed"],
      default: "todo",
      required: true,
    },
    date: { type: Date, required: true },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "low",
      required: true,
    },

    team:     [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // ── Assets: structured objects instead of plain URL strings ───────────────
    // MIGRATION NOTE: existing string entries are kept as-is by the mixed
    // approach below — use the `url` getter in the controller/frontend.
    assets: [assetSchema],

    subTasks: [subTaskSchema],

    activities: [
      {
        type: {
          type: String,
          enum: ["assigned", "started", "in progress", "bug", "completed", "commented"],
          default: "assigned",
        },
        activity: String,
        date: { type: Date, default: Date.now },
        by:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],

    notifications: [
      {
        forAdmin: { type: Boolean, default: false },
        forUser:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        message:  { type: String, required: true },
        seen:     { type: Boolean, default: false },
        date:     { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);
module.exports = Task;
