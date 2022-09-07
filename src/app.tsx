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
  apu: {
    master: false,
    lastUpdate: 0,
    N1: 0,
    flow: 0,
  },
};

const FRAME_RATE = 30;
const perSecond = (constant: number) => constant / FRAME_RATE / 2;

const systems: System[] = [
  (world) => ({ ...world, framecount: world.framecount + 1 }),
  (world) => {
    const apu = world.apu;
    if (apu.master) {
      if (apu.N1 < 10) {
        // start
        apu.flow = perSecond(1);
      } else {
        // ignition
        apu.flow = perSecond(2 + apu.N1 / 20);
      }

      apu.N1 = Math.min(apu.N1 + apu.flow, 100);

      return world;
    }

    apu.flow = 0;
    apu.N1 = Math.max(apu.N1 - perSecond(1), 0);

    return world;
  },
];

const tick: System = (state: Store) => pipe(...systems)(structuredClone(state));

const App = () => {
  const [state, setState] = useState<Store>(init);
  useEffect(() => {
    setInterval(() => {
      setState((world) => tick(world));
    }, 1 / FRAME_RATE);
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
        <Switch setState={setState} path="apu.master" text="Master" />
      </div>
    </main>
  );
};

render(<App />, document.body);
