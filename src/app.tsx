import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Slider } from './components/Slider';
import { Switch } from './components/Switch';
import {
  collapse,
  feature,
  init,
  normalize,
  pipe,
  System,
  travel,
  World,
} from './lib/world';
import EngineMfd from './components/EngineMfd';

const FRAME_RATE = 30;
const perSecond = (constant: number) => constant / FRAME_RATE;

const stableInterval = (fn: () => void, interval: number) => {
  let last = Date.now();
  let timer = 0;

  const loop = () => {
    const now = Date.now();
    const delta = now - last;

    if (delta > interval) {
      last = now;
      fn();
    }

    timer = requestAnimationFrame(loop);
  };

  loop();

  return () => cancelAnimationFrame(timer);
};

const systems: System[] = feature({
  framecount: (world) => ({ ...world, framecount: world.framecount + 1 }),
  fps: (world) => ({
    ...world,
    ms: Date.now() - world.lastTS,
    fps: Math.round(1000 / (Date.now() - world.lastTS)),
    lastTS: Date.now(),
  }),
  fuel: pipe(
    ...feature({
      pump: (world) => {
        const { fuel } = world;
        const { throttle } = world.input;

        if (fuel.pump) {
          if (fuel.tank > 0) fuel.pressure = 1 + throttle;
          return { ...world, fuel };
        }

        fuel.pressure = 0;
        return { ...world, fuel };
      },
      // tank: (world) => {
      //   const { fuel } = world;
      //   fuel.tank -= perSecond(fuel.pressure);
      //   return { ...world, fuel };
      // },
    })
  ),
  engine: pipe(
    ...feature({
      starter: (world) => {
        const { engine } = world;

        if (engine.input.starter) {
          engine.startValve = true;
          engine.rpmAccel.starter = travel(
            engine.rpmAccel.starter,
            25,
            perSecond(2)
          );
        } else {
          engine.startValve = false;
          engine.rpmAccel.starter = 0;
        }

        return { ...world, engine };
      },
      rpmAccel: (world) => {
        const { engine } = world;
        // starter
        //   The starter can only accelerate N2 to the N2_START value
        // fuel
        //   If the fuel valve is open and there is fuel pressure, the fuel will accelerate N2

        if (engine.rpmAccel.starter) {
          engine.N2 = travel(engine.N2, engine.rpmAccel.starter, perSecond(1));
        }

        return { ...world, engine };
      },
    })
  ),
});

const tick: System = (state: World) => pipe(...systems)(structuredClone(state));

const App = () => {
  const [state, setState] = useState<World>(init);
  useEffect(() => {
    stableInterval(() => {
      setState((world) => tick(world));
    }, 1000 / FRAME_RATE);
  }, []);

  return (
    <>
      <pre>{JSON.stringify(state, null, 2)}</pre>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: 'max-content',
        }}
      >
        <Switch path="fuel.pump" setState={setState} text="fuel pump" />
        <Switch
          path="engine.input.starter"
          setState={setState}
          text="starter"
        />
        <Switch path="engine.fuelValve" setState={setState} text="fuel valve" />
        <Slider path="input.throttle" setState={setState} text="throttle" />
        <EngineMfd N2={state.engine.N2} throttle={state.input.throttle} />
      </div>
    </>
  );
};

createRoot(document.getElementById('root')!).render(<App />);
