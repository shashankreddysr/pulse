import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/client";

const Player = () => {
  const { id } = useParams();
  const [video, setVideo] = useState(null);

  useEffect(() => {
    const fetchOne = async () => {
      const res = await api.get("/videos");
      const found = res.data.find((v) => v._id === id);
      setVideo(found || null);
    };
    fetchOne();
  }, [id]);

  if (!video) return <p style={{ margin: "2rem" }}>Loading video details...</p>;
  const token = localStorage.getItem("token");
  const streamUrl = `http://localhost:4000/api/videos/stream/${video._id}?token=${token}`;

  return (
    <div style={{ maxWidth: 900, margin: "1.5rem auto" }}>
      <h2>{video.title}</h2>
      <video
        controls
        width="100%"
        src={streamUrl}
        style={{ borderRadius: 8, border: "1px solid #ccc", marginTop: "1rem" }}
      />
      <p>Status: {video.status}</p>
      <p>Sensitivity: {video.sensitivityLabel || "-"}</p>
    </div>
  );
};

export default Player;