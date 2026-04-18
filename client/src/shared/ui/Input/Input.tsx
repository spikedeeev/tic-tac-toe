import type { ChangeEvent } from 'react';
import styles from './style.module.scss'

type InputProps = {
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  value: string;
  placeholder?: string;
};


function Input({onChange, value, placeholder}:InputProps) {
        return(
        <div className={styles.wrapper}>
  <div className={styles.inputContainer}>
    <input
      type="text"
      className={styles.input}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  </div>
</div>
    )
}

export default Input;