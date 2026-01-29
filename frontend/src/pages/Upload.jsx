import React from "react";
import UploadForm from "../components/UploadForm";

const Upload = () => {
  return (
    <div className="page">
      <div className="card">
        <h2 className="page-title">Upload new video</h2>
        <p className="page-subtitle">
          Files are stored per-tenant and processed asynchronously for sensitivity.
        </p>
        <UploadForm />
      </div>
    </div>
  );
};

export default Upload;