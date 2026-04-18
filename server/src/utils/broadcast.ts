import { WebSocketServer } from "ws";
import { Game } from "../types";

export function broadcastGame(wss: WebSocketServer, game: Game) {
  wss.clients.forEach((client) => {
    const ws = client as unknown as WebSocket & { id?: string };

    if (
      ws.readyState === WebSocket.OPEN &&
      (ws.id === game.players.X?.id ||
       ws.id === game.players.O?.id)
    ) {
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