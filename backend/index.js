const express = require("express");
const mongoose = require("mongoose");
const fs = require("fs");
require("dotenv").config(); // To load environment variables from .env file

const app = express();
const port = process.env.PORT || 5001;
const cors = require("cors");

const userRouter = require("./routers/user.route");
const taskRouter = require("./routers/task.route");

// MongoDB Atlas connection URI from environment variable
const uri = process.env.MONGO;

// Connect to MongoDB Atlas using Mongoose
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: true, // Keep this if you want to use SSL/TLS
  // sslValidate: true, // Remove this line
  // If you have a CA certificate, use it; otherwise, you can omit this
  // sslCA: [fs.readFileSync('/path/to/ca.pem')] 
}).then(() => {
  console.log("Connected to MongoDB");
}).catch((error) => {
  console.error("MongoDB connection error:", error);
});

// Allow requests from specific origins with credentials
const allowedOrigins = ['http://localhost:5173']; // Add other origins as needed

// CORS middleware configuration
const corsOptions = {
  origin: allowedOrigins,
  credentials: true, // Allow credentials (cookies, authorization headers)
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] // Allow these HTTP methods
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

// Start Express server
app.listen(port, () => {
  console.log("Server is up on port: " + port);
});
