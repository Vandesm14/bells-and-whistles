import {
  calcPerformance,
  FRAME_RATE,
  initDebugState,
  stableInterval,
  System,
  tick,
} from './engine';
import * as history from './history';
import { initial, systems } from './world';
import create from 'zustand';
import { applyPartialDiff, structureIsEqual } from './util';

const toggleDebugging = (state: State) =>
  applyPartialDiff(state, { debug: { debugging: !state.debug.debugging } });

const toggleRecording = (state: State) => {
  const { world, debug } = state;

  return applyPartialDiff(state, {
    debug: {
      recording: !debug.recording,
      history: !debug.recording ? history.generate(world) : debug.history,
    },
  });
};

const togglePaused = (state: State, setStore: SetStore) =>
  state.debug.paused ? start(state, setStore) : stop(state);

const intervalFn = (state: State) => {
  const { debug } = state;
  const isAtEndOfHistory = debug.history.index === debug.history.list.length;
  const isLengthZero = debug.history.list.length === 0;

  // if we are playing and in the middle of the history,
  // then we should just play back the history until
  // we reach the end of the history
  if (!debug.paused && !isAtEndOfHistory && !isLengthZero) {
    const newHistory = history.forward(debug.history, debug.step);

    return {
      ...state,
      world: newHistory.value,
      debug: { ...debug, history: newHistory },
    };
  } else if (
    !debug.paused &&
    isAtEndOfHistory &&
    !debug.recording &&
    !isLengthZero
  ) {
    // if we are playing from the debugger and we reach the end of the history,
    // then we should stop playing
    return {
      ...state,
      ...stop(state),
    };
  } else if (!debug.paused) {
    const result = runTick(state, systems);

    return {
      ...state,
      ...result,
    };
  } else {
    // any weird state, just stop
    return {
      ...state,
      ...stop(state),
    };
  }
};

const start = (state: State, setStore: SetStore) => {
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

const stop = (state: State) => {
  state.tickInterval?.clear();
  return applyPartialDiff(state, {
    debug: { paused: true },
  });
};

const runTick = (state: State, systems: System[]) => {
  const start = performance.now();
  let newState = state;
  const { world, debug } = state;
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

const stepForward = (state: State) => {
  state = stop(state);

  const { debug } = state;

  const lastIndex = debug.history.index;
  const nextIndex = lastIndex + debug.step;
  const newHistory = history.forward(debug.history, debug.step);

  const extraTicks = nextIndex - newHistory.index;

  if (extraTicks > 0) {
    let newState = state;
    for (let i = 0; i < extraTicks; i++) {
      newState = runTick(newState, systems);
    }

    return applyPartialDiff(state, {
      ...newState,
    });
  } else if (lastIndex === newHistory.index) {
    const result = runTick(state, systems);

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

const stepBackward = (state: State) => {
  state = stop(state);

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

const stepTo = (state: State, index: number) => {
  stop(state);

  const { debug } = state;
  const newHistory = history.toIndex(debug.history, index);

  return applyPartialDiff(state, {
    world: newHistory.value,
    debug: { history: newHistory },
  });
};

type SetStore = (fn: (state: State) => State) => void;

const storeInit = (set: SetStore) => ({
  world: initial,
  debug: initDebugState(initial),
  tickInterval: { clear: () => null },
  toggleDebugging: () => set(toggleDebugging),
  toggleRecording: () => set(toggleRecording),
  togglePaused: () => set((state) => togglePaused(state, set)),
  start: () => set((state) => start(state, set)),
  stop: () => set(stop),
  stepForward: () => set(stepForward),
  stepBackward: () => set(stepBackward),
  stepTo: (index: number) => set((state) => stepTo(state, index)),
  setStore: set,
});
export type State = ReturnType<typeof storeInit>;

export const useStore = create<State>(storeInit);
