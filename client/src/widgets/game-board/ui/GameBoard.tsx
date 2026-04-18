import { useEffect, useState } from 'react';
import styles from './style.module.scss';
import { useGameStore } from '../../../entities/game/model/store';
import Cell from '../../../features/make-move/ui/Cell';
import Button from '../../../shared/ui/Button/Button';
import { BeatLoader } from 'react-spinners';

export const GameBoard = () => {
  const { game, role, setView } = useGameStore();
  const [showSystemMessage, setShowSystemMessage] = useState<string | null>(null);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const [showFirstMoveMessage, setShowFirstMoveMessage] = useState(false);


  useEffect(() => {
    const ws = useGameStore.getState().ws;
    if (!ws) return;

    const handler = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "system_message" && data.payload?.message) {
          setShowSystemMessage(data.payload.message);

          const timer = setTimeout(() => {
            setShowSystemMessage(null);
          }, 3000);

          return () => clearTimeout(timer);
        }
      } catch (e) {}
    };

    ws.addEventListener('message', handler);
    return () => ws.removeEventListener('message', handler);
  }, []);


  useEffect(() => {
    if (!game || game.waitingForOpponent || !role) return;

    const { board, winner } = game;
    const isDraw = !winner && board.every(Boolean);
    const isFirstMove = board.every((cell: string | null) => !cell);

    if (isFirstMove && !winner && !isDraw) {
      setShowFirstMoveMessage(true);

      const timer = setTimeout(() => {
        setShowFirstMoveMessage(false);
      }, 2800);

      return () => clearTimeout(timer);
    }
  }, [game, role]);

  if (!game) {
    return <div className={styles.wrapper}>Connecting...</div>;
  }

  const playerX = game.players?.X;
  const playerO = game.players?.O;

  const myNickname = role === "X" ? playerX?.nickname : playerO?.nickname;
  const opponentNickname = role === "X" ? playerO?.nickname : playerX?.nickname;

  const { board, currentPlayer, winner, id, restartRequestedBy } = game;
  const isDraw = !winner && board.every(Boolean);



  const copyGameId = async () => {
    try {
      await navigator.clipboard.writeText(id);
    } catch {
      alert("Failed to copy");
    }
  };

  const handleRequestRestart = () => {
    setShowRestartConfirm(true);
  };

  const confirmRestart = () => {
    if (game.id && role) {
      const ws = useGameStore.getState().ws;
      ws?.send(JSON.stringify({
        type: 'request_restart',
        payload: { gameId: game.id, role }
      }));
    }
    setShowRestartConfirm(false);
  };

  const cancelRestart = () => {
    setShowRestartConfirm(false);
  };

  const handleAcceptRestart = () => {
    if (game.id && role) {
      const ws = useGameStore.getState().ws;
      ws?.send(JSON.stringify({
        type: 'accept_restart',
        payload: { gameId: game.id, role }
      }));
    }
  };

  const handleDeclineRestart = () => {
    if (game.id) {
      const ws = useGameStore.getState().ws;
      ws?.send(JSON.stringify({
        type: 'decline_restart',
        payload: { gameId: game.id }
      }));
    }
  };



  if (game.waitingForOpponent) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.spinnerWrapper}>
          <BeatLoader 
            color="#a78bfa" 
            size={18} 
            speedMultiplier={0.8}
          />
          <div className={styles.waitingText}>Waiting for opponent...</div>
        </div>

        <div className={styles.gameInfo}>
          <span>Share Game ID: {game.id}</span>
          <Button onClick={copyGameId}>Copy</Button>
        </div>

        <div className={styles.actions}>
          <Button
            onClick={() => {
              if (game.id) {
                const ws = useGameStore.getState().ws;
                ws?.send(JSON.stringify({
                  type: 'leave_game',
                  payload: { gameId: game.id }
                }));
              }
              setView('menu');
            }}
          >
            Exit
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
     
      <div className={styles.board}>
        {board.map((value: string | null, index: number) => (
          <Cell key={index} value={value} index={index} />
        ))}
      </div>

  
      {showSystemMessage && (
        <div className={styles.systemMessage}>
          {showSystemMessage}
        </div>
      )}

   
      <div className={styles.status}>
        <div>You: {myNickname} ({role})</div>

        {winner && (
          <div>
            Winner: {winner === "X" ? playerX?.nickname : playerO?.nickname}
          </div>
        )}

        {isDraw && <div>Draw</div>}

        {!winner && !isDraw && (
          <div>
            {currentPlayer === role
              ? `Your turn`
              : `Turn: ${opponentNickname}`}
          </div>
        )}
      </div>

      {restartRequestedBy && restartRequestedBy !== role && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Restart Request</h3>
            </div>
            <div className={styles.modalBody}>
              <p>
                <strong>{opponentNickname}</strong> wants to restart the game.
              </p>
              <p className={styles.modalWarning}>
                Current progress will be lost.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <Button onClick={handleAcceptRestart}>Accept Restart</Button>
              <Button onClick={handleDeclineRestart}>Decline</Button>
            </div>
          </div>
        </div>
      )}


      <div className={styles.actions}>
        {!restartRequestedBy && (
          <Button onClick={handleRequestRestart}>
            Restart Game
          </Button>
        )}

        <Button
          onClick={() => {
            if (game.id) {
              const ws = useGameStore.getState().ws;
              ws?.send(JSON.stringify({
                type: 'leave_game',
                payload: { gameId: game.id }
              }));
            }
            setView('menu');
          }}
        >
          Exit
        </Button>
      </div>

   
      {showRestartConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Restart Game?</h3>
            </div>
            
            <div className={styles.modalBody}>
              <p>Are you sure you want to restart the game?</p>
              <p className={styles.modalWarning}>
                The current progress will be lost.
              </p>
            </div>

            <div className={styles.modalFooter}>
              <Button onClick={confirmRestart}>Yes, Restart</Button>
              <Button onClick={cancelRestart}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

 
      {showFirstMoveMessage && (
        <div className={styles.firstMoveOverlay}>
          <div className={styles.firstMoveMessage}>
            <div className={styles.firstMoveIcon}>
              {currentPlayer === 'X' ? '❌' : '⭕'}
            </div>
            <div className={styles.firstMoveText}>
              {currentPlayer === role ? (
                <>
                  <span className={styles.you}>YOU</span> go first!
                </>
              ) : (
                <>
                  <span className={styles.opponent}>{opponentNickname}</span> goes first
                </>
              )}
            </div>
            <div className={styles.firstMoveSubtext}>
              {currentPlayer === 'X' ? 'X starts the game' : 'O starts the game'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};