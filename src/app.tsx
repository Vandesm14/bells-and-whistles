import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Slider } from './components/Slider';
import { Switch } from './components/Switch';
import { collapse, init, pipe, System, World } from './lib/world';
import EngineMfd from './assets/svg/EngineMfd';

const FRAME_RATE = 30;
const perSecond = (constant: number) => constant / FRAME_RATE;

const stableInterval = (fn: () => void, interval: number) => {
  let last = Date.now();
  let timer = 0;

  const loop = () => {
    const now = Date.now();
    const delta = now - last;

    if (delta > interval) {
      last = now;
      fn();
    }

    timer = requestAnimationFrame(loop);
  };

  loop();

  return () => cancelAnimationFrame(timer);
};

const systems: System[] = [
  (world) => ({ ...world, framecount: world.framecount + 1 }),
  (world) => ({
    ...world,
    ms: Date.now() - world.lastTS,
    fps: Math.round(1000 / (Date.now() - world.lastTS)),
    lastTS: Date.now(),
  }),
  (world) => {
    let apu = world.apu;
    if (apu.master) {
      // Internal Engine Logic
      apu = collapse<typeof apu>(
        {
          0: (apu) => ({ ...apu, starter: true, fuel: 0 }),
          5: (apu) => ({ ...apu, fuel: 1 }),
          20: (apu) => ({ ...apu, starter: false }),
        },
        apu.rpm,
        'lte'
      )(apu);

      ///
      // ========== Math ==========
      //
      // Throttle target
      const target = apu.RPM_MIN + apu.throttle * (100 - apu.RPM_MIN);
      const diff = target - apu.rpm;

      // Add more speed if we're further away
      const plusThrottle =
        apu.rpm <= apu.RPM_MIN ? 0 : Math.abs(diff * perSecond(0.8));

      // Add up max acceleration
      const acceleration =
        Number(apu.starter) * perSecond(2) +
        apu.fuel * perSecond(1) +
        plusThrottle;

      // If we're below target, use negative acceleration
      const velocity = diff > 0 ? acceleration : -acceleration;

      // Add velocity to RPM
      apu.rpm = apu.rpm + velocity;
    } else {
      apu.fuel = 0;
      apu.rpm = Math.max(apu.rpm - perSecond(5), 0);
    }

    return { ...world, apu };
  },
];

const tick: System = (state: World) => pipe(...systems)(structuredClone(state));

const App = () => {
  const [state, setState] = useState<World>(init);
  useEffect(() => {
    stableInterval(() => {
      setState((world) => tick(world));
    }, 1000 / FRAME_RATE);
  }, []);

  return (
    <>
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
        <EngineMfd current={state.apu.rpm / 100} target={state.apu.throttle} />
      </div>
    </>
  );
};

createRoot(document.getElementById('root')!).render(<App />);
