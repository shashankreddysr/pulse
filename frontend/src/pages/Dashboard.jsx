import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import VideoList from "../components/VideoList";
import { io } from "socket.io-client";

const Dashboard = () => {
  const [videos, setVideos] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchVideos = async () => {
    const params = {};
    if (filter === "safe") params.sensitivity = "safe";
    if (filter === "flagged") params.sensitivity = "flagged";
    if (filter === "processing") params.status = "processing";

    const res = await api.get("/videos", { params });
    setVideos(res.data);
  };

  useEffect(() => {
    fetchVideos();
  }, [filter]);

  useEffect(() => {
    const socket = io("http://localhost:4000", {
      transports: ["websocket"]
    });

    socket.on("processing-progress", ({ videoId, progress }) => {
      setVideos((prev) =>
        prev.map((v) =>
          v._id === videoId ? { ...v, progress, status: "processing" } : v
        )
      );
    });

    socket.on("processing-complete", ({ videoId, status, sensitivityLabel }) => {
      setVideos((prev) =>
        prev.map((v) =>
          v._id === videoId
            ? { ...v, status, sensitivityLabel, progress: 100 }
            : v
        )
      );
    });

    return () => socket.disconnect();
  }, []);

  // derived stats
  const stats = useMemo(() => {
    const total = videos.length;
    const safe = videos.filter((v) => v.sensitivityLabel === "safe").length;
    const flagged = videos.filter((v) => v.sensitivityLabel === "flagged").length;
    const processing = videos.filter((v) => v.status === "processing").length;
    return { total, safe, flagged, processing };
  }, [videos]);

  // apply search on top of filter result
  const filteredVideos = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return videos;
    return videos.filter((v) => v.title.toLowerCase().includes(term));
  }, [videos, search]);

  return (
    <div className="page">
      <h2 className="page-title">Video Library</h2>
      <p className="page-subtitle">
        Upload, review and stream videos with automated sensitivity classification.
      </p>

      <div className="card">
        <div className="stats-row">
          <span className="stat-pill">Total: {stats.total}</span>
          <span className="stat-pill">Safe: {stats.safe}</span>
          <span className="stat-pill">Flagged: {stats.flagged}</span>
          <span className="stat-pill">Processing: {stats.processing}</span>
        </div>

        <div className="filter-row">
          <div className="filter-buttons">
            <button
              className={`chip ${filter === "all" ? "chip-active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All
            </button>
            <button
              className={`chip ${filter === "safe" ? "chip-active" : ""}`}
              onClick={() => setFilter("safe")}
            >
              Safe
            </button>
            <button
              className={`chip ${filter === "flagged" ? "chip-active" : ""}`}
              onClick={() => setFilter("flagged")}
            >
              Flagged
            </button>
            <button
              className={`chip ${filter === "processing" ? "chip-active" : ""}`}
              onClick={() => setFilter("processing")}
            >
              Processing
            </button>
          </div>

          <div>
            <input
              className="input search-input"
              placeholder="Search by title…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <VideoList videos={filteredVideos} />
      </div>
    </div>
  );
};

export default Dashboard;