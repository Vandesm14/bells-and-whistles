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
      fuel: (world) => {
        const { engine } = world;
        const { pressure } = world.fuel;

        // the fuel can only combust if the engine reaches N2_START and beyond
        // if the fuel pressure is at 1 (throttle idle), then N2 will rise to 56

        if (engine.fuelValve && engine.N2 >= engine.N2_START) {
          engine.rpmAccel.fuel = travel(
            engine.rpmAccel.fuel,
            normalize(1, 2, engine.N2_IDLE, 100, pressure),
            perSecond(5)
          );
        } else {
          engine.rpmAccel.fuel = 0;
        }

        return { ...world, engine };
      },
      rpmAccel: (world) => {
        const { engine } = world;

        engine.rpmAccel.total = engine.rpmAccel.starter + engine.rpmAccel.fuel;
        engine.N2 = travel(engine.N2, engine.rpmAccel.total, perSecond(1));

        return { ...world, engine };
      },
    })
  ),
});

const tick: System = (state: World) => pipe(...systems)(structuredClone(state));

function useLocalStorage<T>(key: string, initialValue: T) {
  // use UseEffect to update the local storage when the state changes
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.log(error);
      return initialValue;
    }
  });

  const reset = () => {
    setStoredValue(initialValue);
  };

  useEffect(() => {
    try {
      // Save state to local storage
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.log(error);
    }
  });

  return [storedValue, setStoredValue, reset] as const;
}

const App = () => {
  const [state, setState, reset] = useLocalStorage<World>('world', init);
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
        <Switch
          path="fuel.pump"
          state={state}
          setState={setState}
          text="fuel pump"
        />
        <Switch
          path="engine.input.starter"
          state={state}
          setState={setState}
          text="starter"
        />
        <Switch
          path="engine.fuelValve"
          state={state}
          setState={setState}
          text="fuel valve"
        />
        <Slider
          path="input.throttle"
          state={state}
          setState={setState}
          text="throttle"
        />
        <EngineMfd N2={state.engine.N2} throttle={state.input.throttle} />
        <button onClick={reset}>reset</button>
      </div>
    </>
  );
};

createRoot(document.getElementById('root')!).render(<App />);
