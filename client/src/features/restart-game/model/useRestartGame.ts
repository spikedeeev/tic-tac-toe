import { useGameStore } from "../../../entities/game/model/store";

function useRestartGame() {
  const send = useGameStore((s) => s.send);
  const game = useGameStore((s) => s.game);

  const handleReset = () => {
    if (!game) return;

    send({
      type: "reset",
      payload: { gameId: game.id }
    });
  };

  return {
    reset: handleReset
  };
}

export default useRestartGame;