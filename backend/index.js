require("dotenv").config();

const express      = require("express");
const cors         = require("cors");
const cookieParser = require("cookie-parser");
const morgan       = require("morgan");
const path         = require("path");

const connectDB      = require("./config/configdb");
const userRouter     = require("./routers/user.route");
const taskRouter     = require("./routers/task.route");
const errorHandler   = require("./middleware/errorMiddleware");
const projectRoutes  = require("./routers/project.route.js");

// ─── Connect to MongoDB ───────────────────────────────────────────────────────
connectDB();

// ─── App ──────────────────────────────────────────────────────────────────────
const app  = express();                          // ← declare FIRST
const PORT = process.env.PORT || 5001;

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: ["http://localhost:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
}));

// ─── Body / Cookie parsers ────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// ─── Static uploads ───────────────────────────────────────────────────────────
app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api", userRouter);
app.use("/api", taskRouter);
app.use("/api/project", projectRoutes);          // ← moved here, after app is declared

// ─── Global error handler (must be last) ─────────────────────────────────────
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

// require("dotenv").config();                         // ← MUST be first

// const express      = require("express");
// const cors         = require("cors");
// const cookieParser = require("cookie-parser");
// const morgan       = require("morgan");
// const path         = require("path");

// const connectDB      = require("./config/configdb");
// const userRouter     = require("./routers/user.route");
// const taskRouter     = require("./routers/task.route");
// const errorHandler   = require("./middleware/errorMiddleware");
// const projectRoutes = require("./routers/project.route.js");
// app.use("/api/project", projectRoutes);

// // ─── Connect to MongoDB ───────────────────────────────────────────────────────
// connectDB();

// // ─── App ──────────────────────────────────────────────────────────────────────
// const app  = express();                             // ← app declared BEFORE use()
// const PORT = process.env.PORT || 5001;

// // ─── CORS ─────────────────────────────────────────────────────────────────────
// app.use(cors({
//   origin:  ["http://localhost:5173"],
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
// }));

// // ─── Body / Cookie parsers ────────────────────────────────────────────────────
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());
// app.use(morgan("dev"));

// // ─── Static uploads ───────────────────────────────────────────────────────────
// // Files saved to /uploads/file.pdf → GET /api/uploads/file.pdf
// app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));

// // ─── Routes ───────────────────────────────────────────────────────────────────
// app.use("/api", userRouter);
// app.use("/api", taskRouter);

// // ─── Global error handler (must be last) ─────────────────────────────────────
// app.use(errorHandler);

// // ─── Start ────────────────────────────────────────────────────────────────────
// app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

