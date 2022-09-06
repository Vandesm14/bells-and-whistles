import { useEffect, useState } from 'react';
import { render } from 'react-dom';
import { KV, Store } from './lib/state';

export type System = (state: Store) => Store;

export const pipe =
  (...fns: System[]) =>
  (arg: Store) =>
    fns.reduce((val, fn) => fn(val), arg);

const systems: System[] = [];

const tick: System = (state: Store) => pipe(...systems)(state);

const App = () => {
  const [state, setState] = useState<Store>({});
  useEffect(() => {
    setInterval(() => {
      setState((world) => tick(world));
    }, 100);
  }, []);

  return (
    <main>
      <pre>{JSON.stringify(state, null, 2)}</pre>
      <div>
        <input
          type="checkbox"
          onChange={(e) =>
            setState((world) =>
              KV(world).set('switch/master', e.target.checked).get()
            )
          }
        />
        <span>Master</span>
      </div>
      <div>
        <input
          type="checkbox"
          onChange={(e) =>
            setState((world) =>
              KV(world).set('switch/starter', e.target.checked).get()
            )
          }
        />
        <span>Starter</span>
      </div>
    </main>
  );
};

render(<App />, document.body);
