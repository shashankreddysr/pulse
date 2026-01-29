const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const Video = require("../models/Video");
const { auth, requireRole } = require("../middleware/auth");
const { ROLES } = require("../utils/roles");
const { processVideo } = require("../services/videoProcessor");

const router = express.Router();

/**
 * Upload directory:
 * - Local: ./uploads (default)
 * - Render: /tmp/uploads (recommended, writable)
 */
const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads";

// Always resolve from project root (more reliable than __dirname for deploys)
const uploadDir = path.isAbsolute(UPLOAD_DIR)
  ? UPLOAD_DIR
  : path.join(process.cwd(), UPLOAD_DIR);

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage (disk)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const base = path.basename(file.originalname || "video", ext);
    const safeBase = base.replace(/[^a-zA-Z0-9-_]/g, "_").slice(0, 60);
    cb(null, `${safeBase}-${Date.now()}${ext}`);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  if (!file.mimetype || !file.mimetype.startsWith("video/")) {
    return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "video"));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 200 }, // 200MB
});

// ---------------------------
// POST /videos/upload
// ---------------------------
router.post(
  "/upload",
  auth,
  requireRole(ROLES.EDITOR, ROLES.ADMIN),
  (req, res, next) => {
    // Wrap multer to catch errors and return clean JSON (frontend will show it)
    upload.single("video")(req, res, (err) => {
      if (err) {
        // Multer errors
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(413).json({ message: "File too large. Max 200MB." });
          }
          return res.status(400).json({ message: "Invalid upload file. Only video files allowed." });
        }
        // Other errors
        return res.status(400).json({ message: err.message || "Upload failed." });
      }
      next();
    });
  },
  async (req, res, next) => {
    try {
      const { title } = req.body;

      if (!req.file) {
        return res.status(400).json({ message: "No video uploaded" });
      }

      // Save metadata in DB
      const videoDoc = await Video.create({
        title: title || req.file.originalname,
        originalName: req.file.originalname,
        filePath: req.file.filename,      // IMPORTANT: exists because diskStorage
        size: req.file.size,
        format: req.file.mimetype,
        owner: req.user.id,
        tenantId: req.user.tenantId,
        status: "uploaded",
      });

      // Start async processing (don’t block response)
      try {
        processVideo(videoDoc);
      } catch (e) {
        // processing failure shouldn't break upload response
        console.error("processVideo error:", e);
      }

      return res.status(201).json({
        message: "Video uploaded",
        video: videoDoc,
      });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------
// GET /videos  (list by tenant)
// ---------------------------
router.get("/", auth, async (req, res, next) => {
  try {
    const { status, sensitivity } = req.query;

    const query = { tenantId: req.user.tenantId };

    if (status) query.status = status;
    if (sensitivity) query.sensitivityLabel = sensitivity;

    // viewers/editors see their own; admins see all in tenant
    if (req.user.role === ROLES.EDITOR || req.user.role === ROLES.VIEWER) {
      query.owner = req.user.id;
    }

    const videos = await Video.find(query).sort({ createdAt: -1 });
    res.json(videos);
  } catch (err) {
    next(err);
  }
});

// ---------------------------
// GET /videos/stream/:id  (range streaming)
// ---------------------------
router.get("/stream/:id", auth, async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) return res.status(404).json({ message: "Video not found" });
    if (video.tenantId !== req.user.tenantId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const videoPath = path.join(uploadDir, video.filePath);

    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({ message: "Video file missing on server" });
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    // No range -> send full file
    if (!range) {
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": video.format || "video/mp4",
      });
      fs.createReadStream(videoPath).pipe(res);
      return;
    }

    const CHUNK_SIZE = 10 ** 6; // 1MB
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = Math.min(start + CHUNK_SIZE, fileSize - 1);

    const contentLength = end - start + 1;

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": video.format || "video/mp4",
    });

    fs.createReadStream(videoPath, { start, end }).pipe(res);
  } catch (err) {
    next(err);
  }
});

module.exports = router;