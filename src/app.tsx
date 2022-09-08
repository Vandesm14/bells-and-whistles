import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Slider } from './components/Slider';
import { Switch } from './components/Switch';
import {
  collapse,
  init,
  normalize,
  pipe,
  System,
  travel,
  World,
} from './lib/world';
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
          0: (apu) => ({ ...apu, starter: true, injectors: false }),
          5: (apu) => ({ ...apu, injectors: true }),
          20: (apu) => ({ ...apu, starter: false }),
        },
        apu.rpm,
        'lte'
      )(apu);

      ///
      // ========== Math ==========
      //
      // Fuel Flow
      if (apu.injectors)
        apu.fuelFlow = travel(
          apu.fuelFlow,
          20,
          perSecond(1 + apu.fuelFlow / 4)
        );

      // RPM
      const targetRpm = normalize(0, 1, 22, 100, apu.throttle);
      const fromFuelFlow = apu.rpm > targetRpm ? 10 : apu.fuelFlow;

      const delta = [travel(apu.rpm, targetRpm, perSecond(1 + fromFuelFlow))];

      apu.rpm = delta.reduce((a, b) => a + b, 0);
    } else {
      apu.injectors = false;
      apu.fuelFlow = 0;
      // apu.rpm = Math.max(apu.rpm - perSecond(5), 0);
      apu.rpm = travel(apu.rpm, 0, perSecond(3));
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
