require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser"); // ✅ FIX: required for req.cookies to work
const connectDB = require("./config/configdb");
const userRouter = require("./routers/user.route");
const taskRouter = require("./routers/task.route");
const errorHandler = require("./middleware/errorMiddleware");

// Connect to MongoDB
connectDB();

const app = express();
const port = process.env.PORT || 5001;

// CORS configuration
const allowedOrigins = ["http://localhost:5173"];
const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
};
app.use(cors(corsOptions));

// Body parser
app.use(express.json());

// ✅ FIX: parse cookies so req.cookies.access_token works in authMiddleware
app.use(cookieParser());

// Routes
app.use("/api", userRouter);
app.use("/api", taskRouter);

// Global error handler — must be last
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is up on port: ${port}`);
});
