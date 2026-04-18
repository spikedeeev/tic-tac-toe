import { Board, Game, Player } from "./types";
import { randomUUID } from "crypto";
import { games } from "./store/games";

function calculateWinner(board: Board): Player | null {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

export function createGame(
  playerId: string,
  nickname: string,
  role: "X" | "O"
): Game {
  const game: Game = {
    id: randomUUID(),
    board: Array(9).fill(null),
    currentPlayer: "X",
    winner: null,
    waitingForOpponent: true,
    players: {
      X: role === "X" ? { id: playerId, nickname } : null,
      O: role === "O" ? { id: playerId, nickname } : null,
    },
    restartRequestedBy: null,
    restartAcceptedBy: new Set(),
    hasGameStarted: false,
    systemMessage: undefined,
  };

  games.set(game.id, game);
  return game;
}

export function joinGame(
  gameId: string,
  playerId: string,
  nickname: string
) {
  const game = games.get(gameId);
  if (!game) return null;

  let role: "X" | "O" | null = null;

  if (game.players.X?.id === playerId) {
    role = "X";
  } else if (game.players.O?.id === playerId) {
    role = "O";
  } else {
    if (!game.players.X) {
      game.players.X = { id: playerId, nickname };
      role = "X";
    } else if (!game.players.O) {
      game.players.O = { id: playerId, nickname };
      role = "O";
    } else {
      return null;
    }
  }

  const bothPlayersConnected = !!(game.players.X && game.players.O);

  if (bothPlayersConnected && !game.hasGameStarted) {
    const firstPlayer: "X" | "O" = Math.random() < 0.5 ? "X" : "O";

    game.currentPlayer = firstPlayer;
    game.hasGameStarted = true;
    game.waitingForOpponent = false;
  } else if (!bothPlayersConnected) {
    game.waitingForOpponent = true;
  } else {
    game.waitingForOpponent = false;
  }

  return { game, role };
}

export function requestRestart(
  gameId: string,
  playerRole: "X" | "O"
): Game | null {
  const game = games.get(gameId);
  if (!game || game.waitingForOpponent) return null;

  game.restartRequestedBy = playerRole;
  game.restartAcceptedBy = new Set([playerRole]);
  return game;
}

export function acceptRestart(
  gameId: string,
  playerRole: "X" | "O"
): Game | null {
  const game = games.get(gameId);
  if (!game || !game.restartRequestedBy) return null;

  game.restartAcceptedBy.add(playerRole);

  if (game.restartAcceptedBy.size === 2) {
    game.board = Array(9).fill(null);
    game.currentPlayer = "X";
    game.winner = null;
    game.restartRequestedBy = null;
    game.restartAcceptedBy.clear();
    game.hasGameStarted = false;
    game.systemMessage = undefined;
  }

  return game;
}

export function declineRestart(gameId: string): Game | null {
  const game = games.get(gameId);
  if (!game) return null;

  game.restartRequestedBy = null;
  game.restartAcceptedBy.clear();
  return game;
}

export function leaveGame(gameId: string, playerId: string) {
  const game = games.get(gameId);
  if (!game) return null;

  if (game.players.X?.id === playerId) game.players.X = null;
  else if (game.players.O?.id === playerId) game.players.O = null;

  const hasAnyPlayer = game.players.X !== null || game.players.O !== null;
  game.waitingForOpponent = hasAnyPlayer;

  if (!hasAnyPlayer) {
    games.delete(gameId);
    return null;
  }

  return game;
}

export function makeMove(gameId: string, index: number) {
  const game = games.get(gameId);
  if (!game || game.waitingForOpponent) return null;

  if (game.board[index] || game.winner) return game;

  const player = game.currentPlayer;
  game.board[index] = player;
  game.winner = calculateWinner(game.board);
  game.currentPlayer = player === "X" ? "O" : "X";

  return game;
}

export function resetGame(gameId: string) {
  const game = games.get(gameId);
  if (!game) return null;

  game.board = Array(9).fill(null);
  game.currentPlayer = "X";
  game.winner = null;
  game.restartRequestedBy = null;
  game.restartAcceptedBy.clear();
  game.hasGameStarted = false;
  game.systemMessage = undefined;

  return game;
}