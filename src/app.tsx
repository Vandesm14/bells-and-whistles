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
    const { recording } = debug;

    let newHistory = debug.history;
    if (!recording) {
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
    const isEqual = structureIsEqual(state, init, true);
    if (!isEqual.isEqual) {
      // eslint-disable-next-line no-console
      console.error(isEqual.error, { state, init });
      setState(init);
    }

    setTickInterval({
      clear: stableInterval(async () => {
        const world = await getState(setState);
        const debug = await getState(setDebug);
        const result = runTick(world, systems, debug);
        setState(result.world);
        setDebug(result.debug);
      }, 1000 / FRAME_RATE),
    });

    setIsPaused(false);
  };

  const stop = () => {
    tickInterval?.clear();
    setIsPaused(true);
  };

  const runTick = (world: World, systems: System[], debug: DebugState) => {
    const start = performance.now();
    let result = tick(world, systems, debug);

    if (debug.debugging) {
      result = {
        ...result,
        debug: {
          ...result.debug,
          ...debug,
        },
      };
    }

    result.world = calcPerformance(result.world, performance.now() - start);

    if (debug.recording) {
      const newHistory = history.push(debug.history, result.world);
      result = {
        ...result,
        debug: {
          ...result.debug,
          history: newHistory,
        },
      };
    }

    return result;
  };

  const stepForward = async () => {
    stop();
    const debug = await getState(setDebug);
    const world = await getState(setState);
    const lastIndex = debug.history.index;
    const nextIndex = lastIndex + debug.step;
    const newHistory = history.forward(debug.history, debug.step);

    const extraTicks = nextIndex - newHistory.index;

    if (extraTicks > 0) {
      let result = { world, debug };
      for (let i = 0; i < extraTicks; i++) {
        result = runTick(result.world, systems, result.debug);
      }
      setState(result.world);
      setDebug(result.debug);
    } else if (lastIndex === newHistory.index) {
      const result = runTick(world, systems, debug);
      setState(result.world);
      setDebug(result.debug);
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
    const newHistory = history.backward(debug.history, debug.step);

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
            onChangeStep={(step) => {
              setDebug((debug) => ({ ...debug, step }));
            }}
            size={JSON.stringify(debug.history).length}
          />
          <button
            onClick={() => {
              setState(init);
              // TODO: we don't stop or start the sim when resetting (I'm not sure if this is the right behavior)
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

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById('root')!).render(<App />);
