import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Slider } from './components/Slider';
import { Switch } from './components/Switch';
import { init, World, constants as C } from './lib/world';
import EngineMfd from './components/EngineMfd';
import { changeDetector, interpolation } from './lib/blocks';
import { System, feature, pipe } from './lib/engine';
import { lerp, normalize } from './lib/util';

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
      avail: (world) => {
        const { fuel } = world;
        fuel.avail = fuel.pump && fuel.tank > 0;
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
          engine.targetN2.starter = C.engine.N2_START;
        } else {
          engine.startValve = false;
          engine.targetN2.starter = 0;
        }

        return { ...world, engine };
      },
      throttle: (world) => {
        const { engine } = world;

        const canUse =
          world.fuel.avail &&
          engine.fuelValve &&
          engine.N2.value >= C.engine.N2_START;

        engine.targetN2.throttle =
          normalize(
            0,
            1,
            C.engine.N2_IDLE,
            C.engine.N2_MAX,
            world.input.throttle
          ) * Number(canUse);

        return { ...world, engine };
      },
      N2: (world) => {
        const { engine } = world;

        const total = Math.max(
          engine.targetN2.starter,
          engine.targetN2.throttle
        );
        engine.targetN2.total = changeDetector.detect(
          engine.targetN2.total,
          total
        );

        if (engine.targetN2.total.didChange)
          engine.N2 = interpolation.begin(
            engine.N2,
            engine.N2.value,
            Math.min(total, C.engine.N2_MAX),
            perSecond(engine.targetN2.throttle > 0 ? 10 : 1)
          );

        engine.N2 = interpolation.update(engine.N2, lerp);

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
  // const [state, setState, reset] = useLocalStorage<World>('world', init);
  const [state, setState] = useState<World>(init);
  const reset = () => setState(init);
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
        <EngineMfd N2={state.engine.N2.value} throttle={state.input.throttle} />
        <button onClick={reset}>reset</button>
      </div>
    </>
  );
};

createRoot(document.getElementById('root')!).render(<App />);
