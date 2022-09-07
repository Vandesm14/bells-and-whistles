import { useEffect, useState } from 'react';
import { render } from 'react-dom';
import { KV, KVMut, Store } from './lib/state';

export type System = (state: Store) => Store;

export const pipe =
  (...fns: System[]) =>
  (arg: Store) =>
    fns.reduce((val, fn) => fn(val), arg);

const init = {
  count: 0,
  momentary: {
    test: {
      prev: false,
      curr: false,
      // 'off', 'rising', 'on', 'falling'
      state: 'off',
    },
    didRise: false,
    didFall: false,
  },
};

const systems: System[] = [
  (state) => ({ ...state, count: state.count + 1 }),
  (world) => {
    const kv = KVMut(world);
    let prev = kv.get('momentary.test.prev');
    const curr = kv.get('momentary.test.curr');
    const state = curr ? (prev ? 'on' : 'rising') : prev ? 'falling' : 'off';
    kv.set('momentary.test.prev', curr);
    if (state === 'falling') {
      kv.set('momentary.didFall', true);
    } else if (state === 'rising') {
      kv.set('momentary.didRise', true);
    }
    return kv
      .set('momentary.test.curr', curr)
      .set('momentary.test.state', state)
      .get();
  },
];

const tick: System = (state: Store) => pipe(...systems)(structuredClone(state));

const App = () => {
  const [state, setState] = useState<Store>(init);
  useEffect(() => {
    setInterval(() => {
      setState((world) => tick(world));
    }, 1 / 60);
  }, []);

  return (
    <main>
      <pre>{JSON.stringify(state, null, 2)}</pre>
      <div>
        <button
          onMouseDown={() =>
            setState((world) =>
              KV(world).set('momentary.test.curr', true).get()
            )
          }
          onMouseUp={() =>
            setState((world) =>
              KV(world).set('momentary.test.curr', false).get()
            )
          }
        >
          Click
        </button>
      </div>
    </main>
  );
};

render(<App />, document.body);
