import React from "react";
import styles from './style.module.scss';

type ButtonProps = {
  onClick: () => void;
  children: React.ReactNode;
  active?: boolean;
};

function Button({ onClick, children, active = false }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`${styles.button} ${active ? styles.active : ''}`}
    >
      {children}
    </button>
  );
}

export default Button;