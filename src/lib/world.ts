import { changeDetector, interpolation } from './blocks';
import { System, feature, perSecond, pipe } from './engine';
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
  health: {
    framecount: 0,
    lastTS: 0,
    ms: 0,
    fps: 0,
    ticks: '',
  },
  power: {
    externalAvail: 0,
    external: false,
  },
  fuel: {
    tank: 1_000_000,
    pump: false,
    avail: false,
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

const C = constants;
export const systems: System[] = feature({
  fps: (world) => {
    const { health } = world;

    health.ms = Date.now() - world.health.lastTS;
    health.fps = Math.round(1000 / (Date.now() - world.health.lastTS));
    health.lastTS = Date.now();

    return { ...world, health };
  },
  fuel: pipe(
    ...feature({
      avail: (world) => {
        const { fuel } = world;
        fuel.avail = fuel.pump && fuel.tank > 0;
        return { ...world, fuel };
      },
      // tank: (world) => {
      //   const { fuel } = world;
      //   fuel.tank -= perSecond(fuel.pressure);
      //   return { ...world, fuel };
      // },
    })
  ),
  engine: pipe(
    ...feature({
      starter: (world) => {
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
      },
      throttle: (world) => {
        const { engine } = world;

        const canUse =
          world.fuel.avail &&
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
      },
      N2Total: (world) => {
        const { engine } = world;

        const total = Math.max(
          engine.targetN2.starter,
          engine.targetN2.throttle
        );
        engine.targetN2.total = changeDetector.detect(
          engine.targetN2.total,
          total
        );

        return { ...world, engine };
      },
      N2: (world) => {
        const { engine } = world;

        if (engine.targetN2.total.didChange)
          engine.N2 = interpolation.begin(
            engine.N2,
            engine.N2.value,
            Math.min(engine.targetN2.total.value, C.engine.N2_MAX)
          );

        if (engine.targetN2.total.value > 0) {
          engine.N2 = interpolation.update(
            engine.N2,
            perSecond(engine.targetN2.throttle > 0 ? 10 : 1),
            lerp
          );
        } else {
          engine.N2 = interpolation.update(
            engine.N2,
            perSecond(engine.N2.value > C.engine.N2_START ? 5 : 3),
            smooth
          );
        }

        return { ...world, engine };
      },
    })
  ),
});
