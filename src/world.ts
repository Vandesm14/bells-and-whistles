import { World } from './types';

export const world: World = {
  events: [],
  state: {
    engine: {
      current_state: '',
      last_update: Date.now(),
      N1: 0,
      switches: {
        master: false,
        start: false,
      },
    },
  },
};
export const constants = {
  engine: {
    states: {
      start: {
        min: 0,
        speed: 0.1,
      },
      ignition: {
        min: 1,
        speed: 2,
      },
      rising: {
        min: 8,
        speed: 1,
      },
      idle: {
        min: 10,
        speed: 0,
      },
    },
  },
};
