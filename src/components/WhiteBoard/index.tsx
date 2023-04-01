import React, { useState, useRef, useEffect } from 'react';

const Whiteboard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);

  const draw = (e: MouseEvent) => {
    if (!isDrawing || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d')!;
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    setLastX(e.offsetX);
    setLastY(e.offsetY);
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.log('ctx is null');
      return;
    }
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;

    canvas.addEventListener('mousedown', (e) => {
      setIsDrawing(true);
      setLastX(e.offsetX);
      setLastY(e.offsetY);
    });

    canvas.addEventListener('mousemove', draw);

    canvas.addEventListener('mouseup', () => {
      setIsDrawing(false);
    });

    canvas.addEventListener('mouseout', () => {
      setIsDrawing(false);
    });

    return () => {
      canvas.removeEventListener('mousedown', () => {});
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', () => {});
      canvas.removeEventListener('mouseout', () => {});
    };
  }, [isDrawing, lastX, lastY]);

  return (
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
  );
};

export default Whiteboard;
