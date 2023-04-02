import React from 'react';
import styles from './styles.module.css';

interface ToolProps {
  title: string;
  children?: React.ReactNode | React.ReactNode[];
}

const Tool = ({ title, children }: ToolProps) => {
  return (
    <div className={styles.Tool}>
      <span className={styles.Title}>{title}</span>
      {children}
    </div>
  );
};

export default Tool;
