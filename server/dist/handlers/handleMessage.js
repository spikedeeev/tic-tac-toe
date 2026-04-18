"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMessage = handleMessage;
const gameManager_1 = require("../gameManager");
const broadcast_1 = require("../utils/broadcast");
function handleMessage(ws, wss, raw) {
    const send = (data) => ws.send(JSON.stringify(data));
    try {
        const message = JSON.parse(raw.toString());
        switch (message.type) {
            case "create_game": {
                const { role, nickname } = message.payload;
                const game = (0, gameManager_1.createGame)(ws.id, nickname, role);
                send({
                    type: "game_created",
                    payload: { gameId: game.id, role },
                });
                send({
                    type: "game_state",
                    payload: game,
                });
                break;
            }
            case "join_game": {
                const { gameId, nickname } = message.payload;
                const result = (0, gameManager_1.joinGame)(gameId, ws.id, nickname);
                if (!result)
                    return;
                const { game, role } = result;
                ws.send(JSON.stringify({
                    type: "game_created",
                    payload: { gameId: game.id, role },
                }));
                (0, broadcast_1.broadcastGame)(wss, game);
                break;
            }
            case "make_move": {
                const game = (0, gameManager_1.makeMove)(message.payload.gameId, message.payload.index);
                if (!game)
                    return;
                (0, broadcast_1.broadcastGame)(wss, game);
                break;
            }
            case "reset": {
                const game = (0, gameManager_1.resetGame)(message.payload.gameId);
                if (!game)
                    return;
                (0, broadcast_1.broadcastGame)(wss, game);
                break;
            }
            case "leave_game": {
                const { gameId } = message.payload;
                const playerId = ws.id;
                const game = (0, gameManager_1.leaveGame)(gameId, playerId);
                if (!game)
                    return;
                (0, broadcast_1.broadcastGame)(wss, game);
                break;
            }
            case "request_restart": {
                const game = (0, gameManager_1.requestRestart)(message.payload.gameId, message.payload.role);
                if (!game)
                    return;
                (0, broadcast_1.broadcastGame)(wss, game);
                break;
            }
            case "accept_restart": {
                const game = (0, gameManager_1.acceptRestart)(message.payload.gameId, message.payload.role);
                if (!game)
                    return;
                (0, broadcast_1.broadcastGame)(wss, game);
                break;
            }
            case "decline_restart": {
                const game = (0, gameManager_1.declineRestart)(message.payload.gameId);
                if (!game)
                    return;
                (0, broadcast_1.broadcastGame)(wss, game);
                break;
            }
        }
    }
    catch {
        ws.send(JSON.stringify({
            type: "error",
            payload: "Invalid message",
        }));
    }
}
