const constants = {
  power: {
    battery: {
      max_capacity: 1000,
    },
  },
};

const world = {
  state: {
    power: {
      battery: {
        capacity: 1000,
        last_updated: Date.now(),
      },
    },
    fuel_cells: {
      fc1: {
        on: false,
      },
    },
  },
  calculated_state: {
    /** positive power (available) on the bus */
    bus: 0,
    /** negative power (used) on the bus */
    draw: 100,
  },
  inputs: {
    power: {
      master: false,
      battery: false,
    },
  },
};

function power(state: State): State {
  const diff = Date.now() - state.power.battery.last_updated;
  const percent = diff / 1000;
  state.power.battery.capacity -= Math.floor(percent * state.power.draw);

  return state;
}

const systems: Reducer[] = [power];

type State = typeof world['state'];
type Reducer = (state: State) => State;

const pipe =
  (...fns: Reducer[]) =>
  (arg: State) =>
    fns.reduce((val, fn) => fn(val), arg);

function tick(state: State): State {
  state = structuredClone(state);

  state = pipe(...systems)(state);
  console.log(state);

  return state;
}

setInterval(() => tick(world.state), 0);
tick(world.state);
