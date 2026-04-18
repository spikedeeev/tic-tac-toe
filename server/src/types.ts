export type Player = "X" | "O";
export type Cell = Player | null;
export type Board = Cell[];

export interface Game {
  id: string;
  waitingForOpponent: Boolean;
  board: Board;
  currentPlayer: Player;
  winner: Player | null;
  systemMessage?: string;
  hasGameStarted: boolean;
  players: {
    X: { id: string; nickname: string } | null;
    O: { id: string; nickname: string } | null;
  };
  restartRequestedBy: "X" | "O" | null;     
  restartAcceptedBy: Set<"X" | "O">;
}

export type ClientMessage =
  | { type: "create_game" }
  | { type: "join_game"; payload: { gameId: string } }
  | { type: "make_move"; payload: { gameId: string; index: number } }
  | { type: "reset"; payload: { gameId: string } };

export type ServerMessage =
  | { type: "game_created"; payload: { gameId: string; role: Player } }
  | { type: "game_state"; payload: Game }
  | { type: "error"; payload: string };