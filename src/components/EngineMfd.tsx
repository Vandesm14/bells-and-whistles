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
        `${N2.toFixed(1)}%`,
        circle.x + circle.radius / 2,
        circle.y + circle.radius / 2
      );
    }

    {
      // Spokes
      ctx.strokeStyle = 'white';
      ctx.beginPath();
      ctx.lineWidth = 3;

      function spoke(
        ctx: CanvasRenderingContext2D,
        angle: number,
        length = 10
      ) {
        ctx.moveTo(
          circle.x +
            circle.radius *
              Math.cos(degToRad(circle.from + angle * circle.length)),
          circle.y +
            circle.radius *
              Math.sin(degToRad(circle.from + angle * circle.length))
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

      // create a spoke for N2_START
      spoke(ctx, normalize(0, 100, 0, 1, world.engine.N2_START));

      for (let i = 0; i < 6; i++) {
        spoke(ctx, 0.5 + i * 0.1);
      }

      ctx.stroke();
      ctx.closePath();
    }

    {
      // Labels
      ctx.fillStyle = 'white';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      function label(
        ctx: CanvasRenderingContext2D,
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

      // create a "5" lable for 50% and "10" for 100%
      label(ctx, 0.5, '5');
      label(ctx, 1, '10');
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
            Math.cos(
              degToRad(
                circle.from + normalize(0, 100, 0, 1, N2) * circle.length
              )
            ),
        circle.y +
          circle.radius *
            Math.sin(
              degToRad(
                circle.from + normalize(0, 100, 0, 1, N2) * circle.length
              )
            )
      );
      ctx.stroke();
      ctx.closePath();
    }

    {
      // Throttle
      ctx.strokeStyle = '#F19036';
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.arc(
        circle.x +
          (circle.radius + 10) *
            Math.cos(
              degToRad(
                circle.from +
                  normalize(0, 1, world.engine.N2_IDLE / 100, 1, throttle) *
                    circle.length
              )
            ),
        circle.y +
          (circle.radius + 10) *
            Math.sin(
              degToRad(
                circle.from +
                  normalize(0, 1, world.engine.N2_IDLE / 100, 1, throttle) *
                    circle.length
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
