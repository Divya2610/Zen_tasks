const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    to:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["task_assigned", "status_updated"],
      required: true,
    },
    task:    { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
    message: { type: String, required: true },
    isRead:  { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
