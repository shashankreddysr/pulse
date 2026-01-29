import React, { useState } from "react";
import { api } from "../api/client";

const UploadForm = ({ onUploaded }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please choose a video file to upload.");
      return;
    }

    setError("");
    setSuccess("");
    setProgress(0);

    const formData = new FormData();
    formData.append("video", file);
    formData.append("title", title || file.name);

    try {
      const res = await api.post("api/videos/upload", formData, {
        onUploadProgress: (e) => {
          if (e.total) {
            const pct = Math.round((e.loaded * 100) / e.total);
            setProgress(pct);
          }
        },
      });

      if (onUploaded) onUploaded(res.data.video);

      setSuccess("Video uploaded successfully. Processing has started.");
      setFile(null);
      setTitle("");
      // keep progress at 100 so the user sees it
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed. Please try again.");
      setProgress(0);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="text-error">{error}</p>}
      {success && <p className="text-muted" style={{ color: "#4ade80" }}>{success}</p>}

      <div className="form-group">
        <label className="label">Title</label>
        <input
          className="input"
          placeholder="Marketing demo, training module, incident review..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="label">Video file</label>
        <input
          className="input"
          type="file"
          accept="video/*"
          onChange={(e) => setFile(e.target.files[0] || null)}
        />
        <p className="text-muted">
          Supported: any <code>video/*</code> format · max 200&nbsp;MB (MP4 recommended).
        </p>
      </div>

      {progress > 0 && (
        <div style={{ marginBottom: "0.75rem" }}>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-muted">{progress}% uploaded</p>
        </div>
      )}

      <button className="btn btn-primary" type="submit">
        Upload
      </button>
    </form>
  );
};

export default UploadForm;