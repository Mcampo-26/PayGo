// server.js - UBICACIÓN: /server.js
const { createServer } = require("http");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Exportamos io globalmente para usarlo en tus API Routes
  global.io = io;

  io.on("connection", (socket) => {
    console.log("🔌 Cliente conectado:", socket.id);

    socket.on("join", (userId) => {
      console.log(`👤 Usuario unido a sala: ${userId}`);
      socket.join(userId);
    });

    socket.on("disconnect", () => {
      console.log("❌ Cliente desconectado");
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Servidor PayGo listo en http://${hostname}:${port}`);
  });
});