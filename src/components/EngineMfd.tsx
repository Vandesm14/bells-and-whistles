import React from 'react';
import { normalize } from '../lib/util';
import { constants as C } from '../lib/world';

const degToRad = (deg: number) => (deg * Math.PI) / 180;

export interface EngineMfdProps {
  N1: number;
  N2: number;
  throttle: number;
}

const WIDTH = 500;
const HEIGHT = 515;

interface Circle {
  x: number;
  y: number;
  radius: number;
  from: number;
  to: number;
  get length(): number;
}

function spoke(
  ctx: CanvasRenderingContext2D,
  circle: Circle,
  angle: number,
  length = 10
) {
  ctx.moveTo(
    circle.x +
      circle.radius * Math.cos(degToRad(circle.from + angle * circle.length)),
    circle.y +
      circle.radius * Math.sin(degToRad(circle.from + angle * circle.length))
  );
  ctx.lineTo(
    circle.x +
      (circle.radius - length) *
        Math.cos(degToRad(circle.from + angle * circle.length)),
    circle.y +
      (circle.radius - length) *
        Math.sin(degToRad(circle.from + angle * circle.length))
  );
}

function text(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  color = 'white'
) {
  ctx.fillStyle = color;
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText(text, x, y);
}

function label(
  ctx: CanvasRenderingContext2D,
  circle: Circle,
  angle: number,
  text: string,
  length = 20
) {
  ctx.fillText(
    text,
    circle.x +
      (circle.radius - length) *
        Math.cos(degToRad(circle.from + angle * circle.length)),
    circle.y +
      (circle.radius - length) *
        Math.sin(degToRad(circle.from + angle * circle.length))
  );
}

function guage(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  needle: number,
  style: 'N1' | 'N2',
  target?: number
) {
  const circle = {
    x,
    y,
    radius: 80,
    from: -225,
    to: -45,
    get length() {
      return Math.abs(this.to - this.from);
    },
  };

  {
    // Gauge
    ctx.strokeStyle = 'white';
    ctx.beginPath();
    ctx.lineWidth = 4;
    ctx.arc(
      circle.x,
      circle.y,
      circle.radius,
      degToRad(circle.from),
      degToRad(circle.to)
    );
    ctx.stroke();
    ctx.closePath();
  }

  {
    // Digital
    ctx.fillStyle = '#82FF80';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(
      `${(needle * 100).toFixed(1)}%`,
      circle.x + circle.radius / 2,
      circle.y + circle.radius / 2
    );
  }

  if (style === 'N1') {
    // Spokes
    ctx.strokeStyle = 'white';
    ctx.beginPath();
    ctx.lineWidth = 3;

    // create a spoke for N1_IDLE
    spoke(ctx, circle, normalize(0, 100, 0, 1, C.engine.N1_IDLE));

    for (let i = 0; i < 6; i++) {
      spoke(ctx, circle, 0.5 + i * 0.1);
    }

    ctx.stroke();
    ctx.closePath();
  } else {
    // create a spoke for N2_START, N2_IDLE, N2_MAX
    ctx.strokeStyle = 'white';
    ctx.beginPath();
    ctx.lineWidth = 3;

    spoke(ctx, circle, normalize(0, 100, 0, 1, C.engine.N2_START));
    spoke(ctx, circle, normalize(0, 100, 0, 1, C.engine.N2_IDLE));
    spoke(ctx, circle, normalize(0, 100, 0, 1, C.engine.N2_MAX));

    ctx.stroke();
    ctx.closePath();
  }

  if (style === 'N1') {
    // Labels
    ctx.fillStyle = 'white';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // create a "5" lable for 50% and "10" for 100%
    label(ctx, circle, 0.5, '5');
    label(ctx, circle, 1, '10');
  }

  {
    // Needle
    ctx.strokeStyle = '#82FF80';
    ctx.beginPath();
    ctx.lineWidth = 4;
    ctx.moveTo(circle.x, circle.y);
    ctx.lineTo(
      circle.x +
        circle.radius *
          Math.cos(degToRad(circle.from + needle * circle.length)),
      circle.y +
        circle.radius * Math.sin(degToRad(circle.from + needle * circle.length))
    );
    ctx.stroke();
    ctx.closePath();
  }

  if (target !== undefined) {
    // Target
    ctx.strokeStyle = '#F19036';
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.arc(
      circle.x +
        (circle.radius + 10) *
          Math.cos(degToRad(circle.from + target * circle.length)),
      circle.y +
        (circle.radius + 10) *
          Math.sin(degToRad(circle.from + target * circle.length)),
      5,
      0,
      2 * Math.PI
    );

    ctx.stroke();
    ctx.closePath();
  }
}

export default function EngineMfd({ N1, N2, throttle }: EngineMfdProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = React.useState<CanvasRenderingContext2D | null>(null);

  React.useEffect(() => {
    if (canvasRef.current) {
      setCtx(canvasRef.current.getContext('2d'));
    }
  }, [canvasRef]);

  if (ctx) {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    guage(ctx, 100, 100, normalize(0, 100, 0, 1, N1), 'N1');
    text(ctx, 100 + 80 / 2, 100 + 80 / 2 - 25, 'N1', '#82FF80');

    guage(
      ctx,
      100,
      300,
      normalize(0, 100, 0, 1, N2),
      'N2',
      normalize(0, 1, C.engine.N2_IDLE / 100, 1, throttle)
    );
    text(ctx, 100 + 80 / 2, 300 + 80 / 2 - 25, 'N2', '#82FF80');
  }

  return (
    <canvas
      ref={canvasRef}
      width={WIDTH}
      height={HEIGHT}
      style={{ border: '1px solid black' }}
    />
  );
}
