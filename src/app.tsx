import { useEffect, useState } from 'react';
import { render } from 'react-dom';
import { Slider } from './components/Slider';
import { Switch } from './components/Switch';
import { collapse, init, pipe, System, World } from './lib/world';

const FRAME_RATE = 30;
const perSecond = (constant: number) => constant / FRAME_RATE / 2;

const systems: System[] = [
  (world) => ({ ...world, framecount: world.framecount + 1 }),
  (world) => {
    let apu = world.apu;
    if (apu.master) {
      // Internal Engine Logic
      // https://www.flight-mechanic.com/wp-content/uploads/2017/03/5-14.jpg
      apu = collapse<typeof apu>(
        {
          0: (apu) => ({ ...apu, starter: true, ignition: false, fuel: 0 }),
          5: (apu) => ({ ...apu, ignition: true }),
          10: (apu) => ({ ...apu, fuel: 1 }),
          20: (apu) => ({ ...apu, fuel: 3 }),
          40: (apu) => ({ ...apu, ignition: false }),
          50: (apu) => ({ ...apu, starter: false }),
          55: (apu) => ({ ...apu, fuel: 2 }),
        },
        apu.rpm
      )(apu);

      ///
      // ========== Math ==========
      //
      // Throttle target
      const target = 55 + apu.throttle * 45;
      const diff = target - apu.rpm;

      // Add more speed if we're further away
      const plusThrottle = apu.rpm <= 55 ? 0 : Math.abs(diff * perSecond(1));

      // Add up max acceleration
      const acceleration =
        Number(apu.starter) * perSecond(2) +
        apu.fuel * perSecond(1) +
        plusThrottle;

      // If we're below target, use negative acceleration
      const velocity = diff > 0 ? acceleration : -acceleration;

      // Add velocity to RPM
      const rpm = apu.rpm + velocity;
      apu = { ...apu, rpm };
    } else {
      apu.fuel = 0;
      apu.rpm = Math.max(apu.rpm - perSecond(2), 0);
    }

    return { ...world, apu };
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
        <Slider setState={setState} path="apu.throttle" text="Throttle" />
      </div>
    </main>
  );
};

render(<App />, document.body);
