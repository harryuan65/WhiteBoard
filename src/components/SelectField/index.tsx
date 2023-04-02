import React from 'react';
import styles from './styles.module.css';

type ValidOptionValue = string | number | readonly string[] | undefined;
interface SelectFieldProps {
  onChange: (e: React.ChangeEvent) => void;
  values: readonly ValidOptionValue[];
  defaultValue: ValidOptionValue;
}

const SelectField = ({ onChange, values, defaultValue }: SelectFieldProps) => {
  return (
    <select
      className={styles.ModeSelect}
      onChange={onChange}
      defaultValue={defaultValue}
    >
      {values.map((v) => (
        <option value={v}>{v}</option>
      ))}
    </select>
  );
};

export default SelectField;
