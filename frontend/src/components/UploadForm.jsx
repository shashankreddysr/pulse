// frontend/src/components/UploadForm.jsx

import { useState } from "react";
import { apiUpload } from "../api/api"; // adjust path if your folder differs

export default function UploadForm({ onUploaded }) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);

  const [progress, setProgress] = useState(0); // fetch doesn't give progress reliably
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setProgress(0);

    if (!file) {
      setError("Please choose a video file.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("video", file);
      formData.append("title", title || file.name);

      // IMPORTANT: backend route is /api/videos/upload
      const data = await apiUpload("/api/videos/upload", formData);

      if (onUploaded) onUploaded(data.video);

      setSuccess("Video uploaded successfully. Processing has started.");
      setFile(null);
      setTitle("");
      setProgress(100);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Upload failed. Please try again.");
      setProgress(0);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 600 }}>
      <h2>Upload new video</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <div style={{ marginTop: 10 }}>
        <label>Title</label>
        <input
          style={{ width: "100%", padding: 8, marginTop: 6 }}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="demo"
        />
      </div>

      <div style={{ marginTop: 10 }}>
        <label>Video file</label>
        <input
          style={{ width: "100%", padding: 8, marginTop: 6 }}
          type="file"
          accept="video/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </div>

      <div style={{ marginTop: 12 }}>
        <button type="submit">Upload</button>
      </div>

      {progress > 0 && (
        <div style={{ marginTop: 10 }}>
          <div>Progress: {progress}%</div>
        </div>
      )}
    </form>
  );
}