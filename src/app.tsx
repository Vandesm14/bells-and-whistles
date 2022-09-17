import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Slider } from './components/input/Slider';
import { Switch } from './components/input/Switch';
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
import { initial, World, systems, constants, fuelIsAvail } from './lib/world';
import { applyPartialDiff, structureIsEqual } from './lib/util';
import Controller from './components/Controller';
import * as history from './lib/history';
import colors from './components/compose/colors';
import { Column } from './components/compose/flex';

interface Store {
  world: World;
  debug: DebugState;
  tickInterval: { clear: () => void };
}

const App = () => {
  const [store, setStore] = useState<Store>({
    world: initial,
    debug: initDebugState(initial),
    tickInterval: { clear: () => null },
  });

  const toggleDebugging = (state: Store) =>
    applyPartialDiff(state, { debug: { debugging: !state.debug.debugging } });

  const toggleRecording = (state: Store) => {
    const { world, debug } = state;

    return applyPartialDiff(state, {
      debug: {
        recording: !debug.recording,
        history: !debug.recording ? history.generate(world) : debug.history,
      },
    });
  };

  const togglePaused = (state: Store) =>
    state.debug.paused ? start(state) : stop(state);

  const intervalFn = (state: Store) => {
    let newState = state;
    const isAtEndOfHistory = debug.history.index === debug.history.list.length;
    const isLengthZero = debug.history.list.length === 0;

    // if we are playing and in the middle of the history,
    // then we should just play back the history until
    // we reach the end of the history
    if (!debug.paused && !isAtEndOfHistory && !isLengthZero) {
      const newHistory = history.forward(debug.history, debug.step);

      newState = applyPartialDiff(state, {
        world: newHistory.value,
        debug: { history: newHistory },
      });
    } else if (
      !debug.paused &&
      isAtEndOfHistory &&
      !debug.recording &&
      !isLengthZero
    ) {
      // if we are playing from the debugger and we reach the end of the history,
      // then we should stop playing
      newState = applyPartialDiff(state, {
        ...stop(newState),
      });
    } else if (!debug.paused) {
      const result = runTick(state, world, systems, debug);

      newState = {
        ...newState,
        ...result,
      };
    } else {
      // any weird state, just stop
      newState = applyPartialDiff(state, {
        ...stop(newState),
      });
    }

    return newState;
  };

  const start = (state: Store) => {
    const { world } = state;
    let newState = state;
    const isEqual = structureIsEqual(world, initial, true);
    if (!isEqual.isEqual) {
      // eslint-disable-next-line no-console
      console.error(isEqual.error, { state, init: initial });
      newState = applyPartialDiff(state, { world: initial });
    }

    return applyPartialDiff(newState, {
      debug: { paused: false },
      tickInterval: {
        clear: stableInterval(() => setStore(intervalFn), 1000 / FRAME_RATE),
      },
    });
  };

  const stop = (state: Store) => {
    state.tickInterval?.clear();
    return applyPartialDiff(state, {
      debug: { paused: true },
    });
  };

  const runTick = (
    state: Store,
    world: World,
    systems: System[],
    debug: DebugState
  ) => {
    const start = performance.now();
    let newState = state;
    let result = tick(world, systems, debug);

    newState = applyPartialDiff(newState, {
      ...result,
    });

    if (debug.debugging) {
      result = applyPartialDiff(result, { debug });
    }

    result.world = calcPerformance(result.world, performance.now() - start);

    if (debug.recording) {
      const newHistory = history.push(debug.history, result.world);
      newState = applyPartialDiff(newState, {
        debug: { history: newHistory },
      });
    }

    return newState;
  };

  const stepForward = (state: Store) => {
    stop(state);
    const { world, debug } = state;

    const lastIndex = debug.history.index;
    const nextIndex = lastIndex + debug.step;
    const newHistory = history.forward(debug.history, debug.step);

    const extraTicks = nextIndex - newHistory.index;

    if (extraTicks > 0) {
      let newState = { world, debug };
      for (let i = 0; i < extraTicks; i++) {
        newState = runTick(state, newState.world, systems, newState.debug);
      }

      return applyPartialDiff(state, {
        ...newState,
      });
    } else if (lastIndex === newHistory.index) {
      const result = runTick(state, world, systems, debug);

      return applyPartialDiff(state, {
        ...result,
      });
    } else {
      return applyPartialDiff(state, {
        world: newHistory.value,
        debug: { history: newHistory },
      });
    }
  };

  const stepBackward = (state: Store) => {
    stop(state);

    const { debug } = state;
    const newHistory = history.backward(debug.history, debug.step);

    // Don't do anything if there is no history
    if (newHistory.list.length !== 0) {
      return applyPartialDiff(state, {
        world: newHistory.value,
        debug: { history: newHistory },
      });
    }

    return state;
  };

  const stepTo = (state: Store, index: number) => {
    stop(state);

    const { debug } = state;
    const newHistory = history.toIndex(debug.history, index);

    return applyPartialDiff(state, {
      world: newHistory.value,
      debug: { history: newHistory },
    });
  };

  useEffect(() => setStore(start), []);

  const setWorld = (world: World) =>
    setStore((state) => applyPartialDiff(state, { world }));
  const { world, debug } = store;

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
            onChange={() => setStore(toggleDebugging)}
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
              onStepForward={() => setStore(stepForward)}
              onStepBackward={() => setStore(stepBackward)}
              onToggleRecording={() => setStore(toggleRecording)}
              onTogglePaused={() => setStore(togglePaused)}
              onChangeStep={(step) =>
                setStore((state) =>
                  applyPartialDiff(state, { debug: { step } })
                )
              }
              onChangeIndex={(index) =>
                setStore((state) => stepTo(state, index))
              }
              size={JSON.stringify(debug.history).length}
            />
            <button
              onClick={() => {
                setStore((state) =>
                  applyPartialDiff(state, {
                    debug: {
                      history: history.generate(state.world),
                      recording: false,
                    },
                  })
                );
              }}
            >
              Reset Debugger
            </button>
            <button
              onClick={() => {
                // TODO: we don't stop or start the sim when resetting (I'm not sure if this is the right behavior)
                setStore((state) =>
                  applyPartialDiff(state, {
                    world: initial,
                    debug: {
                      ...initDebugState(initial),
                      paused: state.debug.paused,
                    },
                  })
                );
              }}
            >
              Reset ALL
            </button>
            <pre>{JSON.stringify(store.world, null, 2)}</pre>
          </>
        ) : null}
      </Column>
      <Column maxContent align="right">
        <Column maxContent center>
          <Switch
            label="fuel pump"
            value={!world.fuel.pump}
            onChange={(pump) =>
              setWorld(applyPartialDiff(world, { fuel: { pump: !pump } }))
            }
          />
          <Switch
            label="starter"
            value={world.engine.input.starter}
            top={{
              on:
                world.engine.N2.value < constants.engine.N2_START &&
                !world.engine.startValve,
              text: 'avail',
              color: 'green',
            }}
            bottom={{
              on: world.engine.input.starter,
              text: 'on',
              color: 'white',
            }}
            onChange={(starter) =>
              setWorld(
                applyPartialDiff(world, {
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
                fuelIsAvail(world) &&
                world.engine.N2.value >= constants.engine.N2_START &&
                !world.engine.fuelValve,
            }}
            value={!world.engine.fuelValve}
            onChange={(fuelValve) =>
              setWorld(
                applyPartialDiff(world, { engine: { fuelValve: !fuelValve } })
              )
            }
          />
          <Slider
            path="input.throttle"
            state={world}
            setState={setWorld}
            label="throttle"
          />
        </Column>
        <EngineMfd N2={world.engine.N2.value} throttle={world.input.throttle} />
      </Column>
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById('root')!).render(<App />);
