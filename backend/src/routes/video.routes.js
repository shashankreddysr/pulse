const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const router = express.Router();

// Upload directory
const uploadDir = path.join(__dirname, "..", "..", process.env.UPLOAD_DIR || "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, `${base}-${Date.now()}${ext}`);
  },
});

// Only allow videos
const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("video/")) {
    return cb(new Error("Only video files allowed"));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 200 }, // 200MB
});

// ========================
// Upload video (NO AUTH)
// ========================
router.post("/upload", upload.single("video"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No video uploaded" });
    }

    res.status(201).json({
      message: "Video uploaded successfully",
      file: req.file.filename,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
});

// ========================
// List uploaded videos
// ========================
router.get("/", (req, res) => {
  try {
    const files = fs.readdirSync(uploadDir);
    res.json(files);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to list videos" });
  }
});

// ========================
// Stream video
// ========================
router.get("/stream/:name", (req, res) => {
  try {
    const videoPath = path.join(uploadDir, req.params.name);

    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({ message: "Video not found" });
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (!range) {
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": "video/mp4",
      });
      fs.createReadStream(videoPath).pipe(res);
      return;
    }

    const CHUNK_SIZE = 10 ** 6;
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = Math.min(start + CHUNK_SIZE, fileSize - 1);

    const contentLength = end - start + 1;

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": "video/mp4",
    });

    fs.createReadStream(videoPath, { start, end }).pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Streaming failed" });
  }
});

module.exports = router;