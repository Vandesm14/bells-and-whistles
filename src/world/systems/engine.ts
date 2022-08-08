import { runTriggers, System, TriggerList } from '../../lib';
import { constants } from '../index';

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

  runTriggers(triggers, events);

  state.engine.N1 = Math.max(state.engine.N1, 0);

  return world;
};

export default engine;
