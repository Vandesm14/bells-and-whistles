import React from 'react';
import { init as world, normalize } from '../lib/world';

const degToRad = (deg: number) => (deg * Math.PI) / 180;

export interface EngineMfdProps {
  N2: number;
  throttle: number;
}

const WIDTH = 500;
const HEIGHT = 515;

export default function EngineMfd({ N2, throttle }: EngineMfdProps) {
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

    const circle = {
      x: 200,
      y: 200,
      radius: 80,
      from: -225,
      to: -45,
      get length() {
        return this.to - this.from;
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
      // Current
      ctx.strokeStyle = '#82FF80';
      ctx.beginPath();
      ctx.lineWidth = 4;
      ctx.moveTo(circle.x, circle.y);
      ctx.lineTo(
        circle.x +
          circle.radius *
            Math.cos(
              degToRad(
                circle.from +
                  normalize(0, 100, 0, 1, N2) * Math.abs(circle.length)
              )
            ),
        circle.y +
          circle.radius *
            Math.sin(
              degToRad(
                circle.from +
                  normalize(0, 100, 0, 1, N2) * Math.abs(circle.length)
              )
            )
      );
      ctx.stroke();
      ctx.closePath();
    }

    {
      // Target
      ctx.strokeStyle = '#F19036';
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.arc(
        circle.x +
          (circle.radius + 10) *
            Math.cos(
              degToRad(
                circle.from +
                  normalize(0, 1, world.engine.N1_IDLE / 100, 1, throttle) *
                    Math.abs(circle.length)
              )
            ),
        circle.y +
          (circle.radius + 10) *
            Math.sin(
              degToRad(
                circle.from +
                  normalize(0, 1, world.engine.N1_IDLE / 100, 1, throttle) *
                    Math.abs(circle.length)
              )
            ),
        5,
        0,
        2 * Math.PI
      );
      ctx.stroke();
      ctx.closePath();
    }
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
