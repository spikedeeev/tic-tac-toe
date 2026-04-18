import { WebSocketServer, WebSocket, RawData } from "ws";
import { randomUUID } from "crypto";
import { handleMessage } from "./handleMessage";
import { games } from "../store/games";
import { broadcastGame } from "../utils/broadcast";

export function handleConnection(wss: WebSocketServer) {
  wss.on("connection", (ws: WebSocket) => {
    const socket = ws as WebSocket & { id?: string };

    socket.id = randomUUID();

socket.on("message", (data: RawData) => {
  handleMessage(socket, wss, Buffer.from(data as any));   
});

    socket.on("close", () => {
      const playerId = socket.id;
      if (!playerId) return;

      games.forEach((game, gameId) => {
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
            games.delete(gameId);
            return;
          }

          game.waitingForOpponent = true;
          game.systemMessage = "Opponent disconnected";

          broadcastGame(wss, game);
        }
      });
    });

    socket.on("error", (err) => console.error("WS error:", socket.id, err));
  });
}