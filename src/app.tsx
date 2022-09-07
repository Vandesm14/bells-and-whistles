import { useEffect, useState } from 'react';
import { render } from 'react-dom';
import { Momentary } from './components/Momentary';
import { Switch } from './components/Switch';
import { KVMut, Store } from './lib/state';

export type System = (state: Store) => Store;

export const pipe =
  (...fns: System[]) =>
  (arg: Store) =>
    fns.reduce((val, fn) => fn(val), arg);

const init = {
  framecount: 0,
  momentary: {
    test: {
      prev: false,
      curr: false,
      state: 'off',
    },
  },
  switch: {
    test: false,
  },
};

const systems: System[] = [
  (state) => ({ ...state, framecount: state.framecount + 1 }),
  (world) => {
    const kv = KVMut(world);
    const { curr, prev } = kv.get('momentary.test');
    const state = curr ? (prev ? 'on' : 'rising') : prev ? 'falling' : 'off';

    return kv
      .set('momentary.test', { prev: curr, curr, state }, { partial: true })
      .get();
  },
];

const tick: System = (state: Store) => pipe(...systems)(structuredClone(state));

const App = () => {
  const [state, setState] = useState<Store>(init);
  useEffect(() => {
    setInterval(() => {
      setState((world) => tick(world));
    }, 1 / 30);
  }, []);

  return (
    <main>
      <pre>{JSON.stringify(state, null, 2)}</pre>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: 'max-content',
        }}
      >
        <Momentary
          setState={setState}
          path="momentary.test.curr"
          text="Button"
        />
        <Switch setState={setState} path="switch.test" text="Switch" />
      </div>
    </main>
  );
};

render(<App />, document.body);
