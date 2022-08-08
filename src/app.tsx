import { render } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import { pipe, System, World, WorldEvent } from './lib';
import { world, systems } from './world';

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

  const addEvent = (event: Event, tag: WorldEvent['tag']) =>
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
