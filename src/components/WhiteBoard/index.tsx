import React, { useState, useRef, useLayoutEffect, ChangeEvent } from 'react';
import Button from '../Button';
import SelectField from '../SelectField';
import styles from './styles.module.css';

const MODES = {
  Mouse: 'Mouse',
  KeyBoard: 'KeyBoard',
} as const;

const Keys = [
  'q',
  'w',
  'e',
  'r',
  't',
  'y',
  'u',
  'i',
  'o',
  'p',
  'a',
  's',
  'd',
  'f',
  'g',
  'h',
  'j',
  'k',
  'l',
  'z',
  'x',
  'c',
  'v',
  'b',
  'n',
  'm',
] as const;

type ElementType<T extends ReadonlyArray<unknown>> = T extends ReadonlyArray<
  infer ElementType
>
  ? ElementType
  : never;

type KeyType = ElementType<typeof Keys>; // this is correctly inferred as literal "A" | "B"

type DrawMode = typeof MODES[keyof typeof MODES];

const Whiteboard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<DrawMode>('KeyBoard');
  const [drawKey, setDrawKey] = useState<KeyType>('z');
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);
  const [stroked, setStroked] = useState(0);
  const [history, setHistory] = useState<string[]>([]);

  const handleReset = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHistory([]);
  };

  const handleUndo = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;

    if (history.length > 0) {
      const lastHistory = history[history.length - 2];
      if (!lastHistory) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHistory([]);
        return;
      }
      const img = new Image();
      img.src = lastHistory;
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        setHistory(history.slice(0, -1));
      };
    }
  };

  const updateMode = (e: ChangeEvent) => {
    const value = (e.target as HTMLSelectElement).value as DrawMode;
    setMode(value);
  };

  const startDrawing = (e: MouseEvent) => {
    console.log('start');

    setIsDrawing(true);
  };

  const updateDrawKey = (e: ChangeEvent) => {
    const newKey = (e.target as HTMLSelectElement).value as KeyType;
    setDrawKey(newKey);
  };

  const startDrawingByKey = (e: KeyboardEvent) => {
    if (e.key == drawKey) {
      setIsDrawing(true);
    }
  };

  const draw = (e: MouseEvent) => {
    if (isDrawing && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')!;
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
      setStroked(
        (prev) =>
          prev + Math.sqrt((e.offsetX - lastX) ** 2 + (e.offsetY - lastY) ** 2)
      );
    }

    setLastX(e.offsetX);
    setLastY(e.offsetY);
  };

  const finishDrawing = (e: MouseEvent | KeyboardEvent) => {
    setIsDrawing(false);

    if (stroked > 0) setHistory([...history, canvasRef.current!.toDataURL()]);

    setStroked(0);
  };

  useLayoutEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.focus();
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d')!;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;

      switch (mode) {
        case MODES.Mouse:
          canvas.addEventListener('mousedown', startDrawing);
          canvas.addEventListener('mouseup', finishDrawing);
          break;
        case MODES.KeyBoard:
          canvas.addEventListener('keydown', startDrawingByKey);
          canvas.addEventListener('keyup', finishDrawing);
          break;
      }

      canvas.addEventListener('mousemove', draw);
      canvas.addEventListener('mouseout', finishDrawing);

      return () => {
        switch (mode) {
          case MODES.Mouse:
            canvas.removeEventListener('mousedown', startDrawing);
            canvas.removeEventListener('mouseup', finishDrawing);
            break;
          case MODES.KeyBoard:
            canvas.removeEventListener('keydown', startDrawingByKey);
            canvas.removeEventListener('keyup', finishDrawing);
            break;
        }

        canvas.removeEventListener('mousemove', draw);
        canvas.removeEventListener('mouseout', finishDrawing);
      };
    }
  }, [drawKey, mode, canvasRef.current, isDrawing, lastX, lastY]);

  return (
    <>
      <div className={styles.ToolBar}>
        <div className={styles.ModeSelectWrap}>
          <span>Draw Mode</span>
          <SelectField
            onChange={updateMode}
            values={[MODES.Mouse, MODES.KeyBoard]}
            defaultValue={mode}
          />
          {mode == MODES.KeyBoard && (
            <SelectField
              onChange={updateDrawKey}
              values={Keys}
              defaultValue={drawKey}
            />
          )}
        </div>

        <Button onClick={handleUndo}>Undo</Button>
        <Button onClick={handleReset}>Reset</Button>
      </div>
      {/* autoFocus + tabIndex to allow focus */}
      <canvas
        ref={canvasRef}
        tabIndex={1}
        autoFocus
        style={{
          backgroundColor: 'white',
          display: 'block',
          margin: 'auto',
          border: '1px solid black',
        }}
        width={window.innerWidth}
        height={window.innerHeight}
      ></canvas>
    </>
  );
};

export default Whiteboard;
