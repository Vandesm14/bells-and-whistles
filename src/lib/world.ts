import { changeDetector, interpolation } from './blocks';

export const constants = {
  engine: {
    N1_START: 5,
    N1_IDLE: 15,

    N2_START: 25,
    N2_IDLE: 56,
    N2_MAX: 100,
  },
};

export const init = {
  framecount: 0,
  lastTS: 0,
  ms: 0,
  fps: 0,
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
    N1: 0,
    N2: interpolation.generate(),
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

export type World = typeof init;
