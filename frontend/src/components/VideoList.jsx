import React from "react";
import { Link } from "react-router-dom";

const getBadgeClass = (status) => {
  if (status === "safe") return "badge badge-safe";
  if (status === "flagged") return "badge badge-flagged";
  if (status === "processing") return "badge badge-processing";
  return "badge";
};

const VideoList = ({ videos }) => {
  if (!videos.length) return <p className="text-muted">No videos yet.</p>;

  return (
    <table className="table">
      <thead>
        <tr>
          <th align="left">Title</th>
          <th align="left">Status</th>
          <th align="left">Progress</th>
          <th align="left">Sensitivity</th>
          <th align="left">Actions</th>
        </tr>
      </thead>
      <tbody>
        {videos.map((v) => (
          <tr key={v._id}>
            <td>{v.title}</td>
            <td>
              <span className={getBadgeClass(v.status)}>{v.status}</span>
            </td>
            <td style={{ minWidth: 140 }}>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${v.progress || 0}%` }}
                />
              </div>
              <span className="text-muted">{v.progress || 0}%</span>
            </td>
            <td>
              {v.sensitivityLabel ? (
                <span
                  className={
                    v.sensitivityLabel === "safe"
                      ? "badge badge-safe"
                      : "badge badge-flagged"
                  }
                >
                  {v.sensitivityLabel}
                </span>
              ) : (
                <span className="text-muted">Pending</span>
              )}
            </td>
            <td>
              {v.status === "safe" || v.status === "flagged" ? (
                <Link to={`/player/${v._id}`} className="btn btn-ghost">
                  Play
                </Link>
              ) : (
                <span className="text-muted">Processing…</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default VideoList;