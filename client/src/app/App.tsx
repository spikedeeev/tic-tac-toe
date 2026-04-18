import { useEffect } from "react";
import { useGameStore } from "../entities/game/model/store";
import GamePage from "../pages/game/GamePage"
import Main from "../pages/main/Main";

function App() {
    const connect = useGameStore((s) => s.connect);
     const currentView = useGameStore((s) => s.currentView);
      useEffect(() => {
    connect();
  }, [connect]);
    return (
    <>
      {currentView === "menu" && <Main />}
      {currentView === "game" && <GamePage />}
    </>
  );
}

export default App
