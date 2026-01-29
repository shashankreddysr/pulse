const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    originalName: String,
    filePath: { type: String, required: true },
    size: Number,
    format: String,
    status: {
      type: String,
      enum: ["uploaded", "processing", "safe", "flagged", "failed"],
      default: "uploaded"
    },
    progress: {
      type: Number,
      default: 0
    },
    sensitivityLabel: {
      type: String,
      enum: ["safe", "flagged", null],
      default: null
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    tenantId: { type: String, required: true },
    metadata: {
      duration: Number,
      resolution: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Video", videoSchema);