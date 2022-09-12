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
import { init, World, systems, constants } from './lib/world';
import { applyPartialDiff, structureIsEqual } from './lib/util';
import { getState } from './lib/hooks';
import Controller from './components/Controller';
import * as history from './lib/history';
import colors from './components/compose/colors';
import { Column } from './components/compose/flex';

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

        const isAtEndOfHistory =
          debug.history.index === debug.history.list.length;
        const isLengthZero = debug.history.list.length === 0;

        // if we are playing and in the middle of the history,
        // then we should just play back the history until
        // we reach the end of the history
        if (!debug.paused && !isAtEndOfHistory && !isLengthZero) {
          const newHistory = history.forward(debug.history, debug.step);

          setState(newHistory.value);
          setDebug((debug) => ({
            ...debug,
            history: newHistory,
          }));
        } else if (
          !debug.paused &&
          isAtEndOfHistory &&
          !debug.recording &&
          !isLengthZero
        ) {
          // if we are playing from the debugger and we reach the end of the history,
          // then we should stop playing
          stop();
        } else if (!debug.paused) {
          const result = runTick(world, systems, debug);

          setState(result.world);
          setDebug(result.debug);
        } else {
          // any weird state, just stop
          stop();
        }
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

  const stepTo = async (index: number) => {
    stop();
    const debug = await getState(setDebug);
    const newHistory = history.toIndex(debug.history, index);

    setDebug((debug) => ({
      ...debug,
      history: newHistory,
    }));
    setState(newHistory.value);
  };

  useEffect(() => start(), []);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
      }}
    >
      <Column maxContent>
        <label>
          <input
            type="checkbox"
            checked={debug.debugging}
            onChange={toggleDebugging}
          />
          Debug
        </label>
        {debug.debugging ? (
          <>
            <Controller
              isRecording={debug.recording}
              isPaused={debug.paused}
              index={debug.history.index}
              length={debug.history.list.length}
              onStepForward={stepForward}
              onStepBackward={stepBackward}
              onToggleRecording={toggleRecording}
              onTogglePaused={togglePaused}
              onChangeStep={(step) => {
                setDebug((debug) => ({ ...debug, step }));
              }}
              onChangeIndex={(index) => stepTo(index)}
              size={JSON.stringify(debug.history).length}
            />
            <button
              onClick={() => {
                setDebug({
                  ...debug,
                  history: history.generate(state),
                  recording: false,
                });
              }}
            >
              Reset Debugger
            </button>
            <button
              onClick={() => {
                setState(init);
                // TODO: we don't stop or start the sim when resetting (I'm not sure if this is the right behavior)
                setDebug({ ...initDebugState(init), paused: debug.paused });
              }}
            >
              Reset ALL
            </button>
            <pre>{JSON.stringify(state, null, 2)}</pre>
          </>
        ) : null}
      </Column>
      <Column maxContent align="right">
        <Column maxContent center>
          <Switch
            label="fuel pump"
            value={!state.fuel.pump}
            onChange={(pump) =>
              setState(applyPartialDiff(state, { fuel: { pump: !pump } }))
            }
          />
          <Switch
            label="starter"
            value={state.engine.input.starter}
            top={{
              on:
                state.engine.N2.value < constants.engine.N2_START &&
                !state.engine.startValve,
              text: 'avail',
              color: 'green',
            }}
            bottom={{
              on: state.engine.input.starter,
              text: 'on',
              color: 'white',
            }}
            onChange={(starter) =>
              setState(
                applyPartialDiff(state, {
                  engine: { input: { starter: starter } },
                })
              )
            }
          />
          <Switch
            label="fuel valve"
            top={{
              text: 'avail',
              color: colors.status.green,
              on:
                state.fuel.avail &&
                state.engine.N2.value >= constants.engine.N2_START &&
                !state.engine.fuelValve,
            }}
            value={!state.engine.fuelValve}
            onChange={(fuelValve) =>
              setState(
                applyPartialDiff(state, { engine: { fuelValve: !fuelValve } })
              )
            }
          />
          <Slider
            path="input.throttle"
            state={state}
            setState={setState}
            label="throttle"
          />
        </Column>
        <EngineMfd N2={state.engine.N2.value} throttle={state.input.throttle} />
      </Column>
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById('root')!).render(<App />);
