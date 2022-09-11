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
  initDebugState,
  System,
} from './lib/engine';
import { init, World, systems } from './lib/world';
import { structureIsEqual } from './lib/util';
import { getState } from './lib/hooks';
import Controller from './components/Controller';
import * as history from './lib/history';

const App = () => {
  const [state, setState] = useState<World>(init);
  const [debug, setDebug] = useState<DebugState>(initDebugState(state));
  const [tickInterval, setTickInterval] = useState<{ clear: () => void }>();

  const setIsPaused = (paused: boolean) =>
    setDebug((debug) => ({
      ...debug,
      paused,
    }));

  const toggleDebugging = () =>
    setDebug((debug) => ({
      ...debug,
      debugging: !debug.debugging,
    }));

  const toggleRecording = async () => {
    const world = await getState(setState);
    const debug = await getState(setDebug);
    let { recording } = debug;

    let newHistory = debug.history;
    if (!recording) {
      // reset history
      newHistory = history.generate(world);
    }
    setDebug({
      ...debug,
      recording: !recording,
      history: newHistory,
    });
  };

  const togglePaused = () => {
    if (debug.paused) start();
    else stop();
  };

  const start = () => {
    console.log('starting...');

    const isEqual = structureIsEqual(state, init, true);
    if (!isEqual.isEqual) {
      console.error(isEqual.error, { state, init });
      setState(init);
    }

    setTickInterval({
      clear: stableInterval(async () => {
        const world = await getState(setState);
        const debug = await getState(setDebug);
        runTick(world, systems, debug);
      }, 1000 / FRAME_RATE),
    });

    setIsPaused(false);
  };

  const stop = () => {
    console.log('stopping...');
    tickInterval?.clear();
    setIsPaused(true);
  };

  const runTick = (world: World, systems: System[], debug: DebugState) => {
    const start = performance.now();
    const result = tick(world, systems, debug);

    if (debug.debugging) {
      setDebug((debug) => {
        return {
          ...debug,
          ...result.debug,
        };
      });
    }

    result.world = calcPerformance(result.world, performance.now() - start);

    if (debug.recording) {
      const newHistory = history.push(debug.history, result.world);
      setDebug((debug) => ({
        ...debug,
        history: newHistory,
      }));
    }

    setState(result.world);
  };

  const stepForward = async () => {
    stop();
    const debug = await getState(setDebug);
    const world = await getState(setState);
    const lastIndex = debug.history.index;
    const newHistory = history.forward(debug.history);

    if (lastIndex === newHistory.index) {
      runTick(world, systems, debug);
    } else {
      setState(newHistory.value);
      setDebug((debug) => ({
        ...debug,
        history: newHistory,
      }));
    }
  };

  const stepBackward = async () => {
    stop();
    const debug = await getState(setDebug);
    const newHistory = history.backward(debug.history);

    // If we're at the beginning of the history, don't do anything
    // This can happen when a user clicks the step backward button
    // without recording any history. We don't want to reset
    // the world to the initial state in this case.
    if (newHistory.list.length !== 0) {
      setDebug((debug) => ({
        ...debug,
        history: newHistory,
      }));
      setState(newHistory.value);
    }
  };

  useEffect(() => start(), []);

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
          <Controller
            isRecording={debug.recording}
            isDebugging={debug.debugging}
            isPaused={debug.paused}
            index={debug.history.index}
            length={debug.history.list.length}
            onStepForward={stepForward}
            onStepBackward={stepBackward}
            onToggleRecording={toggleRecording}
            onToggleDebugging={toggleDebugging}
            onTogglePaused={togglePaused}
          />
          <button
            onClick={() => {
              setState(init);
              // we don't stop or start the sim when resetting (I'm not sure if this is the right behavior)
              setDebug({ ...initDebugState(init), paused: debug.paused });
            }}
          >
            Reset
          </button>
          {debug.debugging ? (
            <pre>{JSON.stringify(debug.systems, null, 2)}</pre>
          ) : null}
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
        </div>
      </div>
    </>
  );
};

createRoot(document.getElementById('root')!).render(<App />);
