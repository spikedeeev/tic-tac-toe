"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGame = createGame;
exports.joinGame = joinGame;
exports.requestRestart = requestRestart;
exports.acceptRestart = acceptRestart;
exports.declineRestart = declineRestart;
exports.leaveGame = leaveGame;
exports.makeMove = makeMove;
exports.resetGame = resetGame;
const crypto_1 = require("crypto");
const games_1 = require("./store/games");
function calculateWinner(board) {
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
function createGame(playerId, nickname, role) {
    const game = {
        id: (0, crypto_1.randomUUID)(),
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
    games_1.games.set(game.id, game);
    return game;
}
function joinGame(gameId, playerId, nickname) {
    const game = games_1.games.get(gameId);
    if (!game)
        return null;
    let role = null;
    if (game.players.X?.id === playerId) {
        role = "X";
    }
    else if (game.players.O?.id === playerId) {
        role = "O";
    }
    else {
        if (!game.players.X) {
            game.players.X = { id: playerId, nickname };
            role = "X";
        }
        else if (!game.players.O) {
            game.players.O = { id: playerId, nickname };
            role = "O";
        }
        else {
            return null;
        }
    }
    const bothPlayersConnected = !!(game.players.X && game.players.O);
    if (bothPlayersConnected && !game.hasGameStarted) {
        const firstPlayer = Math.random() < 0.5 ? "X" : "O";
        game.currentPlayer = firstPlayer;
        game.hasGameStarted = true;
        game.waitingForOpponent = false;
    }
    else if (!bothPlayersConnected) {
        game.waitingForOpponent = true;
    }
    else {
        game.waitingForOpponent = false;
    }
    return { game, role };
}
function requestRestart(gameId, playerRole) {
    const game = games_1.games.get(gameId);
    if (!game || game.waitingForOpponent)
        return null;
    game.restartRequestedBy = playerRole;
    game.restartAcceptedBy = new Set([playerRole]);
    return game;
}
function acceptRestart(gameId, playerRole) {
    const game = games_1.games.get(gameId);
    if (!game || !game.restartRequestedBy)
        return null;
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
function declineRestart(gameId) {
    const game = games_1.games.get(gameId);
    if (!game)
        return null;
    game.restartRequestedBy = null;
    game.restartAcceptedBy.clear();
    return game;
}
function leaveGame(gameId, playerId) {
    const game = games_1.games.get(gameId);
    if (!game)
        return null;
    if (game.players.X?.id === playerId)
        game.players.X = null;
    else if (game.players.O?.id === playerId)
        game.players.O = null;
    const hasAnyPlayer = game.players.X !== null || game.players.O !== null;
    game.waitingForOpponent = hasAnyPlayer;
    if (!hasAnyPlayer) {
        games_1.games.delete(gameId);
        return null;
    }
    return game;
}
function makeMove(gameId, index) {
    const game = games_1.games.get(gameId);
    if (!game || game.waitingForOpponent)
        return null;
    if (game.board[index] || game.winner)
        return game;
    const player = game.currentPlayer;
    game.board[index] = player;
    game.winner = calculateWinner(game.board);
    game.currentPlayer = player === "X" ? "O" : "X";
    return game;
}
function resetGame(gameId) {
    const game = games_1.games.get(gameId);
    if (!game)
        return null;
    game.board = Array(9).fill(null);
    game.currentPlayer = "X";
    game.winner = null;
    game.restartRequestedBy = null;
    game.restartAcceptedBy.clear();
    game.hasGameStarted = false;
    game.systemMessage = undefined;
    return game;
}
