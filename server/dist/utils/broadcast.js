"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcastGame = broadcastGame;
function broadcastGame(wss, game) {
    wss.clients.forEach((client) => {
        const ws = client;
        if (ws.readyState === WebSocket.OPEN &&
            (ws.id === game.players.X?.id ||
                ws.id === game.players.O?.id)) {
            ws.send(JSON.stringify({
                type: "game_state",
                payload: {
                    ...game,
                    systemMessage: undefined
                },
            }));
        }
    });
}
