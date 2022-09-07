import { useEffect, useState } from 'react';
import { render } from 'react-dom';
import { Momentary } from './components/Momentary';
import { Switch } from './components/Switch';
import { KVMut, Store } from './lib/state';
import { init, pipe, System, World } from './lib/world';

const FRAME_RATE = 30;
const perSecond = (constant: number) => constant / FRAME_RATE / 2;

const systems: System[] = [
  (world) => ({ ...world, framecount: world.framecount + 1 }),
  (world) => {
    let apu = world.apu;
    if (apu.master) {
      if (apu.rpm < 10) {
        apu = { ...apu, starter: true, ignition: true };
      } else if (apu.rpm) {
      }
    }

    apu.flow = 0;
    apu.rpm = Math.max(apu.rpm - perSecond(1), 0);

    return world;
  },
];

const tick: System = (state: World) => pipe(...systems)(structuredClone(state));

const App = () => {
  const [state, setState] = useState<World>(init);
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
