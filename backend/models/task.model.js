//THIS JS FILE DEIFINES USER MODEL

const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  stage: {
    type: String,
    enum: ['todo', 'in progress', 'completed'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'normal'],
    required: true
  }
});

const Task = mongoose.model("Task", taskSchema);
module.exports = Task;

// export default mongoose.model("Task", taskSchema);