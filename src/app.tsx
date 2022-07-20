import { render } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { parseJsonSourceFileConfigFileContent } from 'typescript';

const world = {
  state: {
    engine: {
      states: {
        start: {
          min: 0,
          speed: 0.1,
        },
        ignition: {
          min: 1,
          speed: 2,
        },
        rising: {
          min: 8,
          speed: 1,
        },
        idle: {
          min: 10,
          speed: 0,
        },
      },
      current_state: '',
      last_update: Date.now(),
      N1: 0,
      switches: {
        master: true,
      },
    },
  },
};

function engine(state: State): State {
  const diff = Date.now() - state.engine.last_update;
  state.engine.last_update = Date.now();
  if (state.engine.switches.master) {
    const engineState = Object.entries(state.engine.states)
      .filter(([name, val]) => val.min <= state.engine.N1)
      .slice(-1)[0];
    if (!engineState) throw new Error('Could not find engine state');

    state.engine.N1 += (diff / 1000) * engineState[1].speed;
    state.engine.current_state = engineState[0];
  } else if (state.engine.N1 > 0) {
    state.engine.N1 -= diff / 1000;
  } else {
    state.engine.N1 = 0;
  }

  return state;
}

const systems: Reducer[] = [engine];

type State = typeof world['state'];
type Reducer = (state: State) => State;

const pipe =
  (...fns: Reducer[]) =>
  (arg: State) =>
    fns.reduce((val, fn) => fn(val), arg);

function tick(state: State): State {
  state = structuredClone(state);
  state = pipe(...systems)(state);
  return state;
}

const App = () => {
  const [state, setState] = useState<State>(world.state);

  setInterval(() => setState(tick), 0);

  return <pre>{JSON.stringify(state, null, 2)}</pre>;
};

render(<App />, document.body);
