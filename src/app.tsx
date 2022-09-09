import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Slider } from './components/Slider';
import { Switch } from './components/Switch';
import { init, World, systems } from './lib/world';
import EngineMfd from './components/EngineMfd';
import { System, pipe, stableInterval, FRAME_RATE } from './lib/engine';

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
        <EngineMfd
          N1={state.engine.N1.value}
          N2={state.engine.N2.value}
          throttle={state.input.throttle}
        />
        <button onClick={reset}>reset</button>
      </div>
    </>
  );
};

createRoot(document.getElementById('root')!).render(<App />);
