const express = require("express");
const http = require("http");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

const UPLOAD_DIR = path.join(__dirname, process.env.UPLOAD_DIR || "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

dotenv.config();

const { connectDB } = require("./src/config/db");
const { initSocket } = require("./src/sockets");
const authRoutes = require("./src/routes/auth.routes");
const videoRoutes = require("./src/routes/video.routes");
const { errorHandler } = require("./src/middleware/errorHandler");

const app = express();
const server = http.createServer(app);

// Connect DB
connectDB();

// Middleware
app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

// Static serving for uploaded videos (local storage)
app.use("/uploads", express.static(path.join(__dirname, process.env.UPLOAD_DIR || "uploads")));
// Health check route
app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "PulseVision Backend",
    message: "Backend is running 🚀",
  });
});

const allowedOrigins = [
  process.env.CLIENT_ORIGIN,
  process.env.CLIENT_URL,
  "https://pulse-sepia-omega.vercel.app", // keep your exact vercel domain
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // allow requests with no origin (like Postman)
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("CORS blocked: " + origin));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// IMPORTANT: allow preflight for ALL routes
app.options("*", cors());
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/videos", videoRoutes);

// Error handling
app.use(errorHandler);

// Socket.io setup
initSocket(server);

// Start server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});