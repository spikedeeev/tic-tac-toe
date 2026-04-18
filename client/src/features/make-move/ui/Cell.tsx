import useMakeMove from "../model/useMakeMove";
import styles from './style.module.scss'

interface CellProps {
  value: string | null;
  index: number;
}

function Cell({ value, index }: CellProps) {
  const { makeMove } = useMakeMove();

  return (
    <button
      className={styles.cell}
      onClick={() => makeMove(index)}
    >
      {value}
    </button>
  );
}

export default Cell;