import React from 'react';
import styles from './styles.module.css';

interface ButtonProps {
  children: React.ReactNode | React.ReactNode[];
  onClick: (e: React.MouseEvent) => void;
}

const Button = ({ onClick, children }: ButtonProps) => {
  return (
    <div className={styles.Button} onClick={onClick}>
      {children}
    </div>
  );
};

export default Button;
