import { useGameStore } from "../../../entities/game/model/store";

function useMakeMove() {
  const send = useGameStore((s) => s.send);
  const game = useGameStore((s) => s.game);
  const role = useGameStore((s) => s.role);

  const handleMove = (index: number) => {
    if (!game) return;                   
    if (game.board[index]) return;      
    if (game.currentPlayer !== role) return;

   
    send({ type: "make_move", payload: { gameId: game.id, index } });
  };

  return {
    makeMove: handleMove
  };
}

export default useMakeMove;