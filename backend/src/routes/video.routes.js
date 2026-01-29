const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const Video = require("../models/Video");
const { auth, requireRole } = require("../middleware/auth");
const { ROLES } = require("../utils/roles");
const { processVideo } = require("../services/videoProcessor");

const router = express.Router();

const uploadDir = path.join(__dirname, "..", "..", process.env.UPLOAD_DIR || "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, `${base}-${Date.now()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  // basic video validation
  if (!file.mimetype.startsWith("video/")) {
    return cb(new Error("Only video files allowed"));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 200 } // 200MB
});

// Upload video
router.post(
  "/upload",
  auth,
  requireRole(ROLES.EDITOR, ROLES.ADMIN),
  upload.single("video"),
  async (req, res, next) => {
    try {
      const { title } = req.body;
      if (!req.file) return res.status(400).json({ message: "No video uploaded" });

      const videoDoc = await Video.create({
        title: title || req.file.originalname,
        originalName: req.file.originalname,
        filePath: req.file.filename,
        size: req.file.size,
        format: req.file.mimetype,
        owner: req.user.id,
        tenantId: req.user.tenantId
      });

      // Start async processing (do not block response)
      processVideo(videoDoc); // no await

      res.status(201).json({ message: "Video uploaded", video: videoDoc });
    } catch (err) {
      next(err);
    }
  }
);

// List videos with basic filtering (status, safety)
router.get("/", auth, async (req, res, next) => {
  try {
    const { status, sensitivity } = req.query;

    const query = { tenantId: req.user.tenantId };

    if (status) query.status = status;
    if (sensitivity) query.sensitivityLabel = sensitivity;

    // viewers: only see assigned / own; editors: own; admins: all in tenant (simplified)
    if (req.user.role === ROLES.EDITOR || req.user.role === ROLES.VIEWER) {
      query.owner = req.user.id;
    }

    const videos = await Video.find(query).sort({ createdAt: -1 });
    res.json(videos);
  } catch (err) {
    next(err);
  }
});

// Stream video with HTTP range
router.get("/stream/:id", auth, async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Video not found" });

    if (video.tenantId !== req.user.tenantId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const videoPath = path.join(uploadDir, video.filePath);
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;

    const range = req.headers.range;
    if (!range) {
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": video.format || "video/mp4"
      });
      fs.createReadStream(videoPath).pipe(res);
      return;
    }

    const CHUNK_SIZE = 10 ** 6; // 1MB
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = Math.min(start + CHUNK_SIZE, fileSize - 1);

    const contentLength = end - start + 1;
    const headers = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": video.format || "video/mp4"
    };

    res.writeHead(206, headers);
    fs.createReadStream(videoPath, { start, end }).pipe(res);
  } catch (err) {
    next(err);
  }
});

module.exports = router;