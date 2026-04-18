"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const ws_1 = require("ws");
const handleConnection_1 = require("./handlers/handleConnection");
const PORT = Number(process.env.PORT) || 10000;
const server = http_1.default.createServer((req, res) => {
    if (req.url === "/" || req.url === "/health") {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("WebSocket server is running");
    }
    else {
        res.writeHead(404);
        res.end("Not found");
    }
});
const wss = new ws_1.WebSocketServer({
    server
});
(0, handleConnection_1.handleConnection)(wss);
server.listen(PORT, "0.0.0.0", () => {
});
const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
        if (ws.isAlive === false) {
            return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
    });
}, 30000);
wss.on("connection", (ws) => {
    ws.isAlive = true;
    ws.on("pong", () => {
        ws.isAlive = true;
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
