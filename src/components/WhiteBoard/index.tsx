import React, { useState, useRef, useLayoutEffect } from 'react';
import styles from './styles.module.css';

const Whiteboard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

  // V1
  const startDrawing = (e: MouseEvent) => {
    console.log('start');

    setIsDrawing(true);
    setLastX(e.offsetX);
    setLastY(e.offsetY);
  };

  const startDrawingByKey = (e: KeyboardEvent) => {
    if (e.key == 'z') {
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

      // V1 Use mousedown
      // canvas.addEventListener('mousedown', startDrawing);
      // canvas.addEventListener('mouseup', finishDrawing);
      // or Use key
      canvas.addEventListener('keydown', startDrawingByKey);
      canvas.addEventListener('keyup', finishDrawing);

      canvas.addEventListener('mousemove', draw);
      canvas.addEventListener('mouseout', finishDrawing);

      return () => {
        // V1
        // canvas.removeEventListener('mousedown', startDrawing);
        // canvas.removeEventListener('mouseup', finishDrawing);

        // or Use key
        canvas.removeEventListener('keydown', startDrawingByKey);
        canvas.removeEventListener('keyup', finishDrawing);

        canvas.removeEventListener('mousemove', draw);
        canvas.removeEventListener('mouseout', finishDrawing);
      };
    }
  }, [canvasRef.current, isDrawing, lastX, lastY, history]);

  return (
    <>
      <div className={styles.ToolBar}>
        <button onClick={handleUndo}>Undo</button>
        <button onClick={handleReset}>Reset</button>
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
