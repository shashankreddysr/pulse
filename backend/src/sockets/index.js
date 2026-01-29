const { Server } = require("socket.io");
const { setIO } = require("../services/videoProcessor");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_ORIGIN,
      methods: ["GET", "POST"]
    }
  });

  setIO(io);

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // join room per video to receive that video's updates
    socket.on("subscribe-video", (videoId) => {
      socket.join(videoId.toString());
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
};

module.exports = { initSocket, io };