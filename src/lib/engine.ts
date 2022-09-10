import { getPartialDiff } from './util';
import { World } from './world';

export const FRAME_RATE = 30;
export const perSecond = (constant: number) => constant / FRAME_RATE;

export type SystemFn<T = World> = (state: T) => T;
export interface System {
  fn: SystemFn;
  name?: string;
  order?: number;
  path?: string;
}

export type DebugState = {
  systems: Record<
    string,
    Omit<System, 'fn'> & { ms: number; diff: Partial<World> }
  >;
};

export function run(world: World, system: System, debug = false): World {
  const start = performance.now();
  let result = system.fn(structuredClone(world));
  const end = performance.now();

  if (debug && system.name) {
    result.debug.systems[system.name] = {
      ms: end - start,
      diff: getPartialDiff(world, result),
    };
  }

  return result;
}

/**
 * Runs a list of systems in order, and returns the new world state and the list of systems (if debug, they'll have debug info).
 */
export function tick(world: World, systems: System[], debug = false) {
  let result = world;
  for (const system of systems) {
    result = run(result, system, debug);
  }
  return result;
}

/**
 * A wrapper for Object.values() that returns an array of Systems
 */
export function feature(
  obj: Record<string, SystemFn | System[]>,
  name?: string
): System[] {
  const systems: System[] = [];
  for (const key in obj) {
    const value = obj[key];
    if (Array.isArray(value)) {
      systems.push(...value);
    } else {
      systems.push({
        fn: value,
        name: key,
        path: name ? `${name}.${key}` : key,
      });
    }
  }
  return systems;
}

/**
 * Collapses a set of systems into a single system that runs all systems either greater than or less than a value
 */
// TODO: I'll halt dev on this for now, unless I need it later (good luck future me)
// export function collapse(
//   list: Record<number, System>,
//   val: number,
//   mode?: Comparator
// ): SystemFn {
//   const comparator = mode ?? 'lte';
//   const systems = Object.entries(list)
//     .filter(([key]) => compare(Number(key), comparator, val))
//     .map(([, system]) => system);
//   return (world: World) => pipe(...systems)(world);
// }

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
