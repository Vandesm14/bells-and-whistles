import { getPartialDiff } from './util';
import { World } from './world';
import * as history from './history';

export const FRAME_RATE = 30;
export const perSecond = (constant: number) => constant / FRAME_RATE;

export type SystemFn<T = World> = (state: T) => T;
export interface System<T = World> {
  fn: SystemFn<T>;
  name?: string;
  order?: number;
  path?: string;
}

export type DebugState = {
  debugging: boolean;
  systems: Record<
    string,
    Omit<System, 'fn'> & { ms: number; diff: Partial<World> }
  >;
  step: number;
  paused: boolean;
  recording: boolean;
  history: history.History<World>;
};
export const initDebugState = (world: World): DebugState => ({
  debugging: false,
  systems: {},
  step: 1,
  paused: false,
  recording: false,
  history: history.generate(world),
});

/**
 * Runs a list of systems in order, and returns the new world state and the list of systems (if debug, they'll have debug info).
 */
export function tick(
  world: World,
  systems: System[],
  debug: DebugState
): { world: World; debug: DebugState } {
  let state = world;
  const isDebugging = debug.debugging;
  const debugState = debug;

  if (isDebugging) debugState.systems = {};

  for (const system of systems) {
    const start = performance.now();
    const result = system.fn(structuredClone(state));
    const end = performance.now();

    if (isDebugging && system.name) {
      debugState.systems[system.name] = {
        ms: end - start,
        diff: getPartialDiff(state, result),
      };
    }

    state = result;
  }

  return { world: state, debug: debugState };
}

export function calcPerformance(world: World, diff: number) {
  const { performance } = world;

  performance.ms = Date.now() - performance.lastTS;
  performance.fps = Math.round(1000 / (Date.now() - performance.lastTS));
  performance.lastTS = Date.now();

  const ms = performance.ms;
  const percentOfMs = (diff / ms) * 100;
  performance.tick = `${diff}ms (${percentOfMs.toFixed(2)}% of frame)`;

  return { ...world, performance };
}

// /**
//  * A wrapper for Object.values() that returns an array of Systems
//  */
// export function feature(
//   obj: Record<string, SystemFn | System[]>,
//   name?: string
// ): System[] {
//   const systems: System[] = [];
//   for (const key in obj) {
//     const value = obj[key];
//     if (Array.isArray(value)) {
//       systems.push(...value);
//     } else {
//       systems.push({
//         fn: value,
//         name: key,
//         path: name ? `${name}.${key}` : key,
//       });
//     }
//   }
//   return systems;
// }

/**
 * Creates a system
 */
export function system<T = World>(name: string, fn: SystemFn<T>): System<T> {
  return {
    fn,
    name,
    path: name,
  };
}

/**
 * Pepends a group name the path of systems
 */
export function group(name: string, systems: System[]): System[] {
  return systems.map((s) => ({
    ...s,
    path: `${name}.${s.path}`,
  }));
}

export function stableInterval(fn: () => void, interval: number) {
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
}
