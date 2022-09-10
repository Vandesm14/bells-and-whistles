import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Slider } from './components/Slider';
import { Switch } from './components/Switch';
import EngineMfd from './components/EngineMfd';
import { System, pipe, stableInterval, FRAME_RATE } from './lib/engine';
import { init, World, systems } from './lib/world';
import { structureIsEqual } from './lib/util';
import { useLocalStorage } from './lib/hooks';

const tick: System = (state: World) => pipe(...systems)(structuredClone(state));

const App = () => {
  const [state, setState, reset] = useLocalStorage<World>('world', init);
  useEffect(() => {
    const result = structureIsEqual(state, init, true);
    if (!result.isEqual) {
      if (confirm(`Save is out of date, reset?\n\nReason: ${result.error}`))
        reset();
    }

    stableInterval(() => {
      setState((world) => {
        const then = Date.now();
        world = tick(world);
        const diff = Date.now() - then;

        const { health } = world;

        const ms = health.ms;
        const percentOfMs = (diff / ms) * 100;
        health.ticks = `${diff}ms (${percentOfMs.toFixed(2)}%)`;
        return { ...world, health };
      });
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
