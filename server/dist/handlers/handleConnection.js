"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleConnection = handleConnection;
const crypto_1 = require("crypto");
const handleMessage_1 = require("./handleMessage");
const games_1 = require("../store/games");
const broadcast_1 = require("../utils/broadcast");
function handleConnection(wss) {
    wss.on("connection", (ws) => {
        const socket = ws;
        socket.id = (0, crypto_1.randomUUID)();
        socket.on("message", (data) => {
            (0, handleMessage_1.handleMessage)(socket, wss, Buffer.from(data));
        });
        socket.on("close", () => {
            const playerId = socket.id;
            if (!playerId)
                return;
            games_1.games.forEach((game, gameId) => {
                let changed = false;
                if (game.players.X?.id === playerId) {
                    game.players.X = null;
                    changed = true;
                }
                if (game.players.O?.id === playerId) {
                    game.players.O = null;
                    changed = true;
                }
                if (changed) {
                    const hasPlayers = game.players.X || game.players.O;
                    if (!hasPlayers) {
                        games_1.games.delete(gameId);
                        return;
                    }
                    game.waitingForOpponent = true;
                    game.systemMessage = "Opponent disconnected";
                    (0, broadcast_1.broadcastGame)(wss, game);
                }
            });
        });
        socket.on("error", (err) => console.error("WS error:", socket.id, err));
    });
}
