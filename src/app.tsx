import { render } from 'preact';
import { useEffect, useState } from 'preact/hooks';

const world = {
  events: [] as UIEvent[],
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

const constants = {
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

const engine: System = (world) => {
  const { state, events } = world;
  const diff = Date.now() - state.engine.last_update;
  state.engine.last_update = Date.now();
  const engineState = Object.entries(constants.engine.states)
    .filter(([_, val]) => val.min <= state.engine.N1)
    .slice(-1)[0];
  if (!engineState) throw new Error('Could not find engine state');

  if (
    state.engine.switches.master &&
    !(engineState[0] === 'start' && !state.engine.switches.start)
  ) {
    state.engine.N1 += (diff / 1000) * engineState[1].speed;
    state.engine.current_state = engineState[0];
  } else if (state.engine.N1 > 0) {
    state.engine.N1 -= diff / 1000;
  } else {
    state.engine.N1 = 0;
  }

  const triggers: TriggerList = {
    'engine/switches/master': (event) => {
      world.state.engine.switches.master =
        (event.target as HTMLInputElement)?.checked ?? false;
    },
    'engine/switches/start': (event) => {
      world.state.engine.switches.start =
        (event.target as HTMLInputElement)?.checked ?? false;
    },
  };

  Object.entries(triggers).forEach(([tag, fn]) => {
    const event = events.find((event) => event.tag === tag);
    if (event) fn(event.event);
  });

  state.engine.N1 = Math.max(state.engine.N1, 0);

  return world;
};

const systems: System[] = [engine];

type World = typeof world;
type System = (world: World) => World;
type UIEvent = {
  event: Event;
  tag: string;
};

type Trigger = (event: Event) => void;
type TriggerList = Record<string, Trigger>;

const pipe =
  (...fns: System[]) =>
  (arg: World) =>
    fns.reduce((val, fn) => fn(val), arg);

const tick: System = (world: World) => {
  world = { ...world, state: structuredClone(world.state) };
  world = pipe(...systems)(world);
  world.events = [];
  return world;
};

const App = () => {
  const [state, setState] = useState<World>(world);
  useEffect(() => {
    setInterval(() => {
      setState((world) => tick(world));
    }, 100);
  }, []);

  const addEvent = (event: Event, tag: UIEvent['tag']) =>
    setState((world) => ({
      ...world,
      events: [...world.events, { event, tag }],
    }));

  return (
    <main>
      <pre>{JSON.stringify(state.state, null, 2)}</pre>
      <div>
        <input
          type="checkbox"
          onChange={(e) => addEvent(e, 'engine/switches/master')}
        />
        <span>Master</span>
      </div>
      <div>
        <input
          type="checkbox"
          onChange={(e) => addEvent(e, 'engine/switches/start')}
        />
        <span>Starter</span>
      </div>
    </main>
  );
};

render(<App />, document.body);
