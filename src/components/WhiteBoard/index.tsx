import React, { useState, useRef, useLayoutEffect, ChangeEvent } from 'react';
import Button from '../Button';
import SelectField from '../SelectField';
import Tool from '../Tool';
import { MODES, Keys, Brushes } from '../constants';
import { DrawMode, KeyType, BrushType } from '../types';
import styles from './styles.module.css';

const DefaultStrokeColors = [
  '#000000',
  '#ffffff',
  '#D92027',
  '#3a9505',
  '#002c59',
  '#F49D1A',
  '#5f14eb',
];

const Whiteboard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<DrawMode>('Mouse');
  const [brushType, setBrushType] = useState<BrushType>('Stroke');
  const [brushSize, setBrushSize] = useState<number>(40);
  const [drawKey, setDrawKey] = useState<KeyType>('z');
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);
  const [stroked, setStroked] = useState(0);
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [strokeStyle, setStrokeStyle] = useState<string>('#000000');
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

  const updateStrokeWidth = (e: ChangeEvent) => {
    const value = (e.target as HTMLInputElement).value;
    setStrokeWidth(Number(value));
  };

  const updateStrokeStyle = (e: ChangeEvent) => {
    const value = (e.target as HTMLInputElement).value;
    setStrokeStyle(value);
  };

  const updateMode = (e: ChangeEvent) => {
    const value = (e.target as HTMLSelectElement).value as DrawMode;
    setMode(value);
  };

  const strokeCircle = (x: number, y: number) => {
    let canvas = canvasRef.current!;
    let ctx = canvas.getContext('2d')!;
    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = strokeStyle;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, 2 * Math.PI); // draws 2* desired width. So /2
    ctx.stroke();
    updateHistory();
  };

  const strokeRect = (x: number, y: number) => {
    let canvas = canvasRef.current!;
    let ctx = canvas.getContext('2d')!;
    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = strokeStyle;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.rect(x - brushSize / 2, y - brushSize / 2, brushSize, brushSize); // make cursor center
    ctx.stroke();
    updateHistory();
  };

  const strokeListNode = (x: number, y: number) => {
    let canvas = canvasRef.current!;
    let ctx = canvas.getContext('2d')!;
    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = strokeStyle;
    ctx.lineCap = 'round';

    let circleWidth = brushSize / 2; // draws 2* desired width. So /2

    ctx.beginPath();
    ctx.arc(x, y, circleWidth, 0, 2 * Math.PI);
    ctx.stroke();

    // center + 2x brushSize ->
    let arrowStartPoint = x + circleWidth;
    ctx.beginPath();
    ctx.moveTo(arrowStartPoint, y);
    ctx.lineTo(arrowStartPoint + 2 * circleWidth, y);
    ctx.stroke();
    // ---->  go 1/2 left <-- and up  ^--
    ctx.beginPath();
    ctx.moveTo(arrowStartPoint + 2 * circleWidth, y);
    ctx.lineTo(
      arrowStartPoint + 2 * circleWidth - circleWidth / 2,
      y - circleWidth / 2
    );
    ctx.stroke();

    // ---->  go 1/2 left <-- and down  ^--
    ctx.beginPath();
    ctx.moveTo(arrowStartPoint + 2 * circleWidth, y);
    ctx.lineTo(
      arrowStartPoint + 2 * circleWidth - circleWidth / 2,
      y + circleWidth / 2
    ); // y down
    ctx.stroke();
    updateHistory();
  };

  const strokeArrow = (x: number, y: number) => {
    let canvas = canvasRef.current!;
    let ctx = canvas.getContext('2d')!;
    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = strokeStyle;
    ctx.lineCap = 'round';
    // center + 2x brushSize ->
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 2 * brushSize, y);
    ctx.stroke();
    // ---->  go 1/2 left <-- and up  ^--
    ctx.beginPath();
    ctx.moveTo(x + 2 * brushSize, y);
    ctx.lineTo(x + 2 * brushSize - brushSize / 2, y - brushSize / 2);
    ctx.stroke();

    // ---->  go 1/2 left <-- and down  ^--
    ctx.beginPath();
    ctx.moveTo(x + 2 * brushSize, y);
    ctx.lineTo(x + 2 * brushSize - brushSize / 2, y + brushSize / 2); // y down
    ctx.stroke();
    updateHistory();
  };

  const startDrawing = (e: MouseEvent) => {
    switch (brushType) {
      case 'Circle':
        strokeCircle(e.offsetX, e.offsetY);
        break;
      case 'Rect':
        strokeRect(e.offsetX, e.offsetY);
        break;
      case 'Arrow':
        strokeArrow(e.offsetX, e.offsetY);
        break;
      case 'ListNode':
        strokeListNode(e.offsetX, e.offsetY);
        break;
      default:
        setIsDrawing(true);
    }
  };

  const updateDrawKey = (e: ChangeEvent) => {
    const newKey = (e.target as HTMLSelectElement).value as KeyType;
    setDrawKey(newKey);
  };

  const startDrawingByKey = (e: KeyboardEvent) => {
    if (e.key == drawKey) {
      switch (brushType) {
        case 'Circle':
          strokeCircle(lastX, lastY);
          break;
        case 'Rect':
          strokeRect(lastX, lastY);
          break;
        default:
          setIsDrawing(true);
      }
    }
  };

  const draw = (e: MouseEvent) => {
    if (isDrawing && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')!;
      ctx.beginPath();
      ctx.lineWidth = strokeWidth;
      ctx.strokeStyle = strokeStyle;
      ctx.lineCap = 'round';
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

    if (stroked > 0) updateHistory();

    setStroked(0);
  };

  const updateHistory = () =>
    setHistory([...history, canvasRef.current!.toDataURL()]);

  useLayoutEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.focus();
      const canvas = canvasRef.current;

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
  }, [
    brushSize,
    brushType,
    drawKey,
    mode,
    canvasRef.current,
    isDrawing,
    lastX,
    lastY,
  ]);

  return (
    <>
      <div className={styles.ToolBar}>
        <Tool title="Draw Mode">
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
        </Tool>
        <Tool title={`Width: ${strokeWidth}`}>
          <input
            type="range"
            value={strokeWidth}
            min={3}
            max={20}
            onChange={updateStrokeWidth}
          />
        </Tool>
        <Tool title="Brush">
          {Brushes.map((brush) => (
            <span
              className={[
                styles[brush],
                styles.Brush,
                brushType == brush && styles.selected,
              ].join(' ')}
              onClick={() => setBrushType(brush)}
            ></span>
          ))}
          {brushType != 'Stroke' && brushSize}
          {brushType != 'Stroke' && (
            <input
              type="range"
              min={20}
              max={200}
              value={brushSize}
              onChange={(e) =>
                setBrushSize(Number((e.target as HTMLInputElement).value))
              }
            />
          )}
        </Tool>
        <Tool title="Stroke Color">
          {DefaultStrokeColors.map((color) => (
            <span
              className={[
                styles.DefaultStrokeColorOption,
                strokeStyle === color && styles.selected,
              ].join(' ')}
              style={{ '--color': color } as React.CSSProperties}
              onClick={() => setStrokeStyle(color)}
            ></span>
          ))}
          <input
            type="color"
            value={strokeStyle}
            onChange={updateStrokeStyle}
          />
        </Tool>
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
