const Video = require("../models/Video");
let ioInstance = null;

// called from sockets/index.js
const setIO = (io) => {
  ioInstance = io;
};

const emitProgress = (videoId, progress) => {
  if (!ioInstance) return;
  ioInstance.emit("processing-progress", { videoId, progress });
};

const emitStatus = (videoId, status, sensitivityLabel) => {
  if (!ioInstance) return;
  ioInstance.emit("processing-complete", {
    videoId,
    status,
    sensitivityLabel
  });
};

// Fake processing pipeline (replace with FFmpeg + real logic if you want)
const processVideo = async (video) => {
  try {
    await Video.findByIdAndUpdate(video._id, { status: "processing", progress: 0 });
    emitProgress(video._id, 0);

    const steps = [20, 40, 60, 80, 100];

    for (const p of steps) {
      await new Promise((res) => setTimeout(res, 1000));
      await Video.findByIdAndUpdate(video._id, { progress: p });
      emitProgress(video._id, p);
    }

    // fake classification
    const isSafe = Math.random() > 0.3;
    const status = isSafe ? "safe" : "flagged";
    const sensitivityLabel = isSafe ? "safe" : "flagged";

    await Video.findByIdAndUpdate(video._id, {
      status,
      progress: 100,
      sensitivityLabel
    });

    emitStatus(video._id, status, sensitivityLabel);
  } catch (err) {
    console.error("Error in processVideo:", err);
    await Video.findByIdAndUpdate(video._id, { status: "failed" });
    emitStatus(video._id, "failed", null);
  }
};

module.exports = { processVideo, setIO };