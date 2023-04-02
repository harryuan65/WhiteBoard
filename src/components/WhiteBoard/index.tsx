import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useLayoutEffect,
} from 'react';

const Whiteboard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);
  const [stroked, setStroked] = useState(0);
  const [history, setHistory] = useState<string[]>([]);

  const handleUndo = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
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

  const startDrawing = (e: MouseEvent) => {
    console.log('start');

    setIsDrawing(true);
    setLastX(e.offsetX);
    setLastY(e.offsetY);
  };

  const draw = (e: MouseEvent) => {
    if (!isDrawing || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d')!;
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    setLastX(e.offsetX);
    setLastY(e.offsetY);
    setStroked(
      (prev) =>
        prev + Math.sqrt((e.offsetX - lastX) ** 2 + (e.offsetY - lastY) ** 2)
    );
  };

  const finishDrawing = (e: MouseEvent) => {
    if (!isDrawing) return;
    console.log('finishing');
    setIsDrawing(false);
    setHistory([...history, canvasRef.current!.toDataURL()]);
    setStroked(0);
    console.log(history);
    console.log(stroked);
  };

  useLayoutEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d')!;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      console.log('adding listeners');
      canvas.addEventListener('mousedown', startDrawing);
      canvas.addEventListener('mousemove', draw);
      canvas.addEventListener('mouseup', finishDrawing);
      canvas.addEventListener('mouseout', finishDrawing);

      return () => {
        canvas.removeEventListener('mousedown', startDrawing);
        canvas.removeEventListener('mousemove', draw);
        canvas.removeEventListener('mouseup', finishDrawing);
        canvas.removeEventListener('mouseout', finishDrawing);
      };
    }
  }, [canvasRef.current, isDrawing, lastX, lastY, history]);

  return (
    <>
      <button
        onClick={() => {
          handleUndo();
        }}
      >
        Undo
      </button>
      {history.length}
      <canvas
        ref={canvasRef}
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
