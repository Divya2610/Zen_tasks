require("dotenv").config();                         // ← MUST be first

const express      = require("express");
const cors         = require("cors");
const cookieParser = require("cookie-parser");
const morgan       = require("morgan");
const path         = require("path");

const connectDB      = require("./config/configdb");
const userRouter     = require("./routers/user.route");
const taskRouter     = require("./routers/task.route");
const errorHandler   = require("./middleware/errorMiddleware");

// ─── Connect to MongoDB ───────────────────────────────────────────────────────
connectDB();

// ─── App ──────────────────────────────────────────────────────────────────────
const app  = express();                             // ← app declared BEFORE use()
const PORT = process.env.PORT || 5001;

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin:  ["http://localhost:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
}));

// ─── Body / Cookie parsers ────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// ─── Static uploads ───────────────────────────────────────────────────────────
// Files saved to /uploads/file.pdf → GET /api/uploads/file.pdf
app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api", userRouter);
app.use("/api", taskRouter);

// ─── Global error handler (must be last) ─────────────────────────────────────
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());
// app.use(morgan("dev"));

// // ─── Serve Uploaded Files Statically ─────────────────────────────────────────
// // Files uploaded by team members are accessible at /uploads/<filename>
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// // ─── API Routes ───────────────────────────────────────────────────────────────
// app.use("/api", routes);

// // ─── Error Handling ───────────────────────────────────────────────────────────
// app.use(routeNotFound);
// app.use(errorHandler);

// app.listen(PORT, () => console.log(`Server listening on ${PORT}`));

// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const cookieParser = require("cookie-parser"); // ✅ FIX: required for req.cookies to work
// const connectDB = require("./config/configdb");
// const userRouter = require("./routers/user.route");
// const taskRouter = require("./routers/task.route");
// const errorHandler = require("./middleware/errorMiddleware");

// // Connect to MongoDB
// connectDB();

// const app = express();
// const port = process.env.PORT || 5001;

// // CORS configuration
// const allowedOrigins = ["http://localhost:5173"];
// const corsOptions = {
//   origin: allowedOrigins,
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
// };
// app.use(cors(corsOptions));

// // Body parser
// app.use(express.json());

// // ✅ FIX: parse cookies so req.cookies.access_token works in authMiddleware
// app.use(cookieParser());

// // Routes
// app.use("/api", userRouter);
// app.use("/api", taskRouter);

// // Global error handler — must be last
// app.use(errorHandler);

// app.listen(port, () => {
//   console.log(`Server is up on port: ${port}`);
// });
