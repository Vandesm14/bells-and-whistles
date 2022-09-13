import { changeDetector, interpolation } from './blocks';
import { group, perSecond, system, System } from './engine';
import { lerp, normalize, smooth } from './util';

export const constants = {
  engine: {
    N1_START: 5,
    N1_IDLE: 15,
    N1_MAX: 100,

    N2_START: 25,
    N2_IDLE: 56,
    N2_MAX: 100,
  },
};

export type World = typeof init;
export const init = {
  performance: {
    framecount: 0,
    lastTS: 0,
    ms: 0,
    fps: 0,
    tick: '',
  },
  power: {
    externalAvail: 0,
    external: false,
  },
  fuel: {
    tank: 60 * 60 * 5, // 5 minutes
    usage: 0,
    pump: false,
  },
  engine: {
    // State
    startValve: false,
    fuelValve: false,
    N2: interpolation.generate(),
    N1: 0,
    EGT: 0,

    targetN2: {
      starter: 22,
      throttle: 0,
      total: changeDetector.generate(0),
    },

    // Controls
    input: {
      starter: false,
    },
  },
  input: {
    throttle: 0,
  },
};

export const fuelIsAvail = (world: World) => {
  const { fuel } = world;
  return fuel.pump && fuel.tank > 0;
};

const C = constants;
export const systems: System[] = [
  ...group('fuel', [
    system('avail', (world) => {
      const { fuel } = world;
      return { ...world, fuel };
    }),
    system('tank', (world) => {
      const { fuel, engine } = world;
      const usage =
        engine.N2.value *
        Number(
          engine.fuelValve &&
            fuelIsAvail(world) &&
            engine.N2.value > C.engine.N2_START
        );

      fuel.tank = Math.max(fuel.tank - perSecond(usage), 0);
      fuel.usage = usage;
      return { ...world, fuel };
    }),
  ]),
  ...group('engine', [
    system('starter', (world) => {
      const { engine } = world;

      if (engine.input.starter) {
        engine.startValve = true;
        engine.targetN2.starter =
          engine.N2.value <= C.engine.N2_START ? C.engine.N2_START : 0;
      } else {
        engine.startValve = false;
        engine.targetN2.starter = 0;
      }

      return { ...world, engine };
    }),
    system('throttle', (world) => {
      const { engine } = world;

      const canUse =
        fuelIsAvail(world) &&
        engine.fuelValve &&
        engine.N2.value >= C.engine.N2_START;

      engine.targetN2.throttle =
        normalize(
          0,
          1,
          C.engine.N2_IDLE,
          C.engine.N2_MAX,
          world.input.throttle
        ) * Number(canUse);

      return { ...world, engine };
    }),
    system('N2Total', (world) => {
      const { engine } = world;

      const total = Math.max(engine.targetN2.starter, engine.targetN2.throttle);
      engine.targetN2.total = changeDetector.detect(
        engine.targetN2.total,
        total
      );

      return { ...world, engine };
    }),
    system('N2RetrigInterp', (world) => {
      const { engine } = world;

      if (engine.targetN2.total.didChange)
        engine.N2 = interpolation.begin(
          engine.N2,
          engine.N2.value,
          Math.min(engine.targetN2.total.value, C.engine.N2_MAX)
        );

      return { ...world, engine };
    }),
    system('N2UpdateInterp', (world) => {
      const { engine } = world;

      if (engine.targetN2.total.value > 0) {
        engine.N2 = interpolation.update(
          engine.N2,
          perSecond(engine.targetN2.throttle > 0 ? 10 : 1),
          lerp
        );
      } else {
        engine.N2 = interpolation.update(
          engine.N2,
          // TODO: find a better curve to start at N2 speed, then slowly ramp down to 0 (as it gets closer, it decreases slower)
          perSecond(engine.N2.value > C.engine.N2_START ? 5 : 3),
          smooth
        );
      }

      return { ...world, engine };
    }),
  ]),
];
