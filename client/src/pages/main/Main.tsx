import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import styles from './style.module.scss';
import { useGameStore } from '../../entities/game/model/store';
import Button from '../../shared/ui/Button/Button';
import Input from '../../shared/ui/Input/Input';

const logo = '/main.png';

function Main() {
  const { send } = useGameStore();

  const [showJoin, setShowJoin] = useState<boolean>(false);
  const [showCreate, setShowCreate] = useState<boolean>(false);

  const [nickname, setNickname] = useState<string>('');
  const [gameId, setGameId] = useState<string>('');
  const [role, setRole] = useState<'X' | 'O'>('X');
  const [error, setError] = useState<string>('');

  
  useEffect(() => {
    const img = new Image();
    img.src = logo;
  }, []);

  const handleCreateGame = (): void => {
    if (!nickname.trim()) {
      setError('Nickname is required');
      return;
    }

    send({
      type: 'create_game',
      payload: { role, nickname },
    });

    setShowCreate(false);
    setNickname('');
    setError('');
  };

  const handleJoinGame = (): void => {
    if (!nickname.trim() || !gameId.trim()) {
      setError('Fill in all fields');
      return;
    }

    send({
      type: 'join_game',
      payload: { gameId, nickname },
    });

    setShowJoin(false);
    setNickname('');
    setGameId('');
  };

  const handleNicknameChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setError('');
    setNickname(e.target.value);
  };

  const handleGameIdChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setError('');
    setGameId(e.target.value);
  };

  return (
    <div className={styles.wrapper}>
      <img src={logo} alt="logo" className={styles.logo}/>

      <div className={styles.actions}>
        {!showJoin && !showCreate && (
          <div className={styles.buttons}>
            <Button onClick={() => setShowCreate(true)}>Create Game</Button>
            <Button onClick={() => setShowJoin(true)}>Join Game</Button>
          </div>
        )}

        {showCreate && (
          <div className={styles.form}>
            <Input
              placeholder="Enter your nickname"
              value={nickname}
              onChange={handleNicknameChange}
            />

            {error && <p className={styles.error}>{error}</p>}

            <p>Select a role:</p>

            <div className={styles.roleButtons}>
              <Button active={role === 'X'} onClick={() => setRole('X')}>
                X
              </Button>
              <Button active={role === 'O'} onClick={() => setRole('O')}>
                O
              </Button>
            </div>

            <div className={styles.formButtons}>
              <Button onClick={handleCreateGame}>Create</Button>
              <Button
                onClick={() => {
                  setError('');
                  setShowCreate(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {showJoin && (
          <div className={styles.form}>
            <Input
              placeholder="Enter your nickname"
              value={nickname}
              onChange={handleNicknameChange}
            />

            <Input
              placeholder="Enter Game ID"
              value={gameId}
              onChange={handleGameIdChange}
            />

            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.formButtons}>
              <Button onClick={handleJoinGame}>Join</Button>
              <Button
                onClick={() => {
                  setError('');
                  setShowJoin(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Main;