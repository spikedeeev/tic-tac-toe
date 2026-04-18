import { WebSocketServer, WebSocket } from "ws";
import {
  createGame,
  joinGame,
  makeMove,
  resetGame,
  requestRestart,
  acceptRestart,
  declineRestart,
  leaveGame,
} from "../gameManager";
import { broadcastGame } from "../utils/broadcast";

export function handleMessage(
  ws: WebSocket & { id?: string },
  wss: WebSocketServer,
  raw: Buffer
) {
  const send = (data: any) => ws.send(JSON.stringify(data));

  try {
    const message = JSON.parse(raw.toString());

    switch (message.type) {
      case "create_game": {
        const { role, nickname } = message.payload;

        const game = createGame(ws.id!, nickname, role);

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

  const result = joinGame(gameId, ws.id!, nickname);
  if (!result) return;

  const { game, role } = result;

  ws.send(
    JSON.stringify({
      type: "game_created",
      payload: { gameId: game.id, role },
    })
  );

  broadcastGame(wss, game);

  break;
}

      case "make_move": {
        const game = makeMove(
          message.payload.gameId,
          message.payload.index
        );

        if (!game) return;

        broadcastGame(wss, game);
        break;
      }

      case "reset": {
        const game = resetGame(message.payload.gameId);
        if (!game) return;

        broadcastGame(wss, game);
        break;
      }

      case "leave_game": {
        const { gameId } = message.payload;
        const playerId = ws.id!;

        const game = leaveGame(gameId, playerId);

        if (!game) return;

        broadcastGame(wss, game);
        break;
      }

      case "request_restart": {
        const game = requestRestart(
          message.payload.gameId,
          message.payload.role
        );

        if (!game) return;

        broadcastGame(wss, game);
        break;
      }

      case "accept_restart": {
        const game = acceptRestart(
          message.payload.gameId,
          message.payload.role
        );

        if (!game) return;

        broadcastGame(wss, game);
        break;
      }

      case "decline_restart": {
        const game = declineRestart(message.payload.gameId);

        if (!game) return;

        broadcastGame(wss, game);
        break;
      }
    }
  } catch {
    ws.send(
      JSON.stringify({
        type: "error",
        payload: "Invalid message",
      })
    );
  }
}