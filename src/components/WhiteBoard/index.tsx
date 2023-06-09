import React, {
  useState,
  useRef,
  useLayoutEffect,
  ChangeEvent,
  useCallback,
} from 'react';
import Button from '../Button';
import SelectField from '../SelectField';
import Tool from '../Tool';
import { MODES, Keys, Brushes } from '../constants';
import { DrawMode, KeyType, BrushType } from '../types';
import styles from './styles.module.css';
import BrushSetting from '../BrushSetting';

const DefaultStrokeColors = [
  '#D92027',
  '#3a9505',
  '#1a82ea',
  '#F49D1A',
  '#5f14eb',
];

const Whiteboard: React.FC = () => {
  const defaultSchemeStrokeColors = window.matchMedia(
    '(prefers-color-scheme: dark)'
  ).matches
    ? ['#ffffff', '#000000']
    : ['#000000', '#ffffff'];
  const [initialized, setInitialized] = useState(false);
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
  const [strokeStyle, setStrokeStyle] = useState<string>(
    defaultSchemeStrokeColors[0]
  );
  const [history, setHistory] = useState<string[]>([]);

  const getCurrentCtx = useCallback(() => {
    let canvas = canvasRef.current!;
    let ctx = canvas.getContext('2d')!;
    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = strokeStyle;
    ctx.lineCap = 'round';
    ctx.fillStyle = defaultSchemeStrokeColors[1];
    return ctx;
  }, [canvasRef, strokeWidth, strokeStyle]);

  const handleReset = () => {
    if (!confirm('Are you sure you want to reset?')) {
      return;
    }
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
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

  const strokeCircle = (x: number, y: number) => {
    let ctx = getCurrentCtx();
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, 2 * Math.PI); // draws 2* desired width. So /2
    ctx.stroke();
    updateHistory();
  };

  const strokeRect = (x: number, y: number) => {
    let ctx = getCurrentCtx();
    ctx.beginPath();
    ctx.rect(x - brushSize / 2, y - brushSize / 2, brushSize, brushSize); // make cursor center
    ctx.stroke();
    updateHistory();
  };

  const strokeListNode = (x: number, y: number) => {
    let ctx = getCurrentCtx();

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
    let ctx = getCurrentCtx();
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
        case 'Arrow':
          strokeArrow(lastX, lastY);
          break;
        case 'ListNode':
          strokeListNode(lastX, lastY);
          break;
        default:
          setIsDrawing(true);
      }
    }
  };

  const draw = (e: MouseEvent) => {
    if (isDrawing && canvasRef.current) {
      let ctx = getCurrentCtx();
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

    if (stroked > 0) updateHistory();

    setStroked(0);
  };

  const updateHistory = () =>
    setHistory([...history, canvasRef.current!.toDataURL()]);

  useLayoutEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [history]);

  const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    if (history.length > 0) {
      event.preventDefault();
      event.returnValue = '';
    }
  };

  const copyImage = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#242424';
    const img = new Image();
    img.src = canvas.toDataURL('image/png');

    img.onload = function () {
      canvas.toBlob(function (blob) {
        console.log(blob);

        const item = new ClipboardItem({ 'image/png': blob! });
        navigator.clipboard
          .write([item])
          .then(() => {
            console.log('圖像已成功複製到剪貼板中');
          })
          .catch((e) => {
            console.error('複製到剪貼板時出現錯誤: ', e);
          });
      });
    };
  };
  useLayoutEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.focus();
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = defaultSchemeStrokeColors[1];

      if (!initialized) {
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setInitialized(true);
      }
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
            onChange={(e) =>
              setMode((e.target as HTMLSelectElement).value as DrawMode)
            }
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
            onChange={(e) =>
              setStrokeWidth(Number((e.target as HTMLInputElement).value))
            }
          />
        </Tool>
        <BrushSetting
          currentBrushSize={brushSize}
          currentBrushType={brushType}
          setBrushType={setBrushType}
          onChangeBrushSize={(e) =>
            setBrushSize(Number((e.target as HTMLInputElement).value))
          }
        />
        <Tool title="Stroke Color">
          {[...defaultSchemeStrokeColors, ...DefaultStrokeColors].map(
            (color) => (
              <span
                className={[
                  styles.DefaultStrokeColorOption,
                  strokeStyle === color && styles.selected,
                ].join(' ')}
                style={{ '--color': color } as React.CSSProperties}
                onClick={() => setStrokeStyle(color)}
              ></span>
            )
          )}
          <input
            type="color"
            value={strokeStyle}
            onChange={(e) =>
              setStrokeStyle((e.target as HTMLInputElement).value)
            }
          />
        </Tool>
        <Button onClick={handleUndo}>Undo</Button>
        <Button onClick={handleReset}>Reset</Button>
        <Button onClick={copyImage}>Copy Image</Button>
      </div>
      {/* autoFocus + tabIndex to allow focus */}
      <canvas
        ref={canvasRef}
        tabIndex={1}
        autoFocus
        className={styles.WhiteBoard}
        width={window.innerWidth}
        height={window.innerHeight}
      ></canvas>
    </>
  );
};

export default Whiteboard;
