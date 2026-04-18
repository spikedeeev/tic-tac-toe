import { create } from "zustand";

type View = "menu" | "game";

interface GameState {
  ws: WebSocket | null;
  game: any | null;
  role: "X" | "O" | null;
  waitingForOpponent: boolean;
  currentView: View;

  nickname: string;

  connect: () => void;
  send: (msg: any) => void;
  setView: (view: View) => void;

  setNickname: (name: string) => void;

  createGame: (role: "X" | "O") => void;
  joinGame: (gameId: string) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  ws: null,
  game: null,
  role: null,
  waitingForOpponent: false,
  currentView: "menu",

  nickname: "",


  connect: () => {
    const ws = new WebSocket(import.meta.env.VITE_WS_URL);

 

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === "game_state") {
        set({
          game: msg.payload,
          currentView: "game",
          waitingForOpponent: msg.payload.waitingForOpponent,
        });
      }

      if (msg.type === "game_created") {
        set({
          role: msg.payload.role,
          waitingForOpponent: true,
          currentView: "game",
        });
      }

      if (msg.type === "system_message") {
        console.log("SYSTEM:", msg.payload.message);
      }
    };
    ws.onerror = (err) => console.error("WS error", err);

    set({ ws });
  },


  send: (msg) => {
    const ws = get().ws;
    if (!ws) return;
    ws.send(JSON.stringify(msg));
  },


  setNickname: (name) => set({ nickname: name }),


  createGame: (role: "X" | "O") => {
    const { ws, nickname } = get();
    if (!ws || !nickname.trim()) return;

    ws.send(JSON.stringify({
      type: "create_game",
      payload: {
        role,
        nickname,
      },
    }));
  },

  
  joinGame: (gameId: string) => {
    const { ws, nickname } = get();
    if (!ws || !nickname.trim() || !gameId.trim()) return;

    ws.send(JSON.stringify({
      type: "join_game",
      payload: {
        gameId,
        nickname,
      },
    }));
  },

  setView: (view: View) => set({ currentView: view }),
}));