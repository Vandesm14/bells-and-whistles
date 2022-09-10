import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Slider } from './components/Slider';
import { Switch } from './components/Switch';
import EngineMfd from './components/EngineMfd';
import {
  stableInterval,
  FRAME_RATE,
  tick,
  DebugState,
  calcPerformance,
} from './lib/engine';
import { init, World, systems } from './lib/world';
import { structureIsEqual } from './lib/util';
import { getState, useLocalStorage } from './lib/hooks';

const App = () => {
  const [debugMode, setDebugMode] = useState(false);
  const [debug, setDebug] = useState<DebugState>({ systems: {} });
  const [state, setState] = useLocalStorage<World>('world', init);
  useEffect(() => {
    const isEqual = structureIsEqual(state, init, true);
    if (!isEqual.isEqual) {
      console.error(isEqual.error, { state, init });
      setState(init);
    }

    stableInterval(async () => {
      const debugMode = await getState(setDebugMode);
      const world = await getState(setState);

      const start = performance.now();
      const result = tick(world, systems, debugMode, debug);

      if (debugMode) setDebug(result.debug);

      setState(calcPerformance(result.world, performance.now() - start));
    }, 1000 / FRAME_RATE);
  }, []);

  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: 'max-content',
          }}
        >
          <label>
            Debug
            <input
              type="checkbox"
              checked={debugMode}
              onChange={() => setDebugMode(!debugMode)}
            />
          </label>
          {debugMode ? <pre>{JSON.stringify(debug, null, 2)}</pre> : null}
          <pre>{JSON.stringify(state, null, 2)}</pre>
        </div>
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
          <EngineMfd
            N2={state.engine.N2.value}
            throttle={state.input.throttle}
          />
          <button onClick={() => setState(init)}>reset</button>
        </div>
      </div>
    </>
  );
};

createRoot(document.getElementById('root')!).render(<App />);
