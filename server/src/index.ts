import http from "http";
import { WebSocketServer } from "ws";
import { handleConnection } from "./handlers/handleConnection";

const PORT = Number(process.env.PORT) || 10000;

const server = http.createServer((req, res) => {
  if (req.url === "/" || req.url === "/health") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("WebSocket server is running");
  } else {
    res.writeHead(404);
    res.end("Not found");
  }
});

const wss = new WebSocketServer({ 
  server
});

handleConnection(wss);

server.listen(PORT, "0.0.0.0", () => {
});

const interval = setInterval(() => {
  wss.clients.forEach((ws: any) => {
    if (ws.isAlive === false) {
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on("connection", (ws) => {
  (ws as any).isAlive = true;
  ws.on("pong", () => {
    (ws as any).isAlive = true;
  });
});

process.on("SIGTERM", () => {
  clearInterval(interval);
  wss.close(() => {
    server.close(() => {
      process.exit(0);
    });
  });
});