import React from 'react';
import styles from './styles.module.css';
import { Brushes } from '../constants';
import { BrushType } from '../types';

interface BrushSettingProps {
  currentBrushType: BrushType;
  currentBrushSize: number;
  setBrushType: React.Dispatch<React.SetStateAction<BrushType>>;
  onChangeBrushSize: (e: React.ChangeEvent) => void;
}

const BrushSetting = ({
  currentBrushSize,
  currentBrushType,
  setBrushType,
  onChangeBrushSize,
}: BrushSettingProps) => {
  return (
    <div className={styles.BrushSetting}>
      <div className={styles.Column}>
        <div className={styles.Row}>
          <span>Brush:</span>
          {Brushes.map((brush) => (
            <span
              className={[
                styles[brush],
                styles.Brush,
                currentBrushType == brush && styles.selected,
              ].join(' ')}
              onClick={() => setBrushType(brush)}
            ></span>
          ))}
        </div>
        {currentBrushType != 'Stroke' && (
          <div className={styles.Row}>
            <input
              type="range"
              min={20}
              max={200}
              value={currentBrushSize}
              onChange={onChangeBrushSize}
            />
            <span>{currentBrushSize}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrushSetting;
