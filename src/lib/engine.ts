import { Comparator, compare } from './util';
import { World } from './world';

export const FRAME_RATE = 30;
export const perSecond = (constant: number) => constant / FRAME_RATE;

export type SystemFn<T = World> = (state: T) => T;
export const pipe =
  <T = World>(...fns: SystemFn<T>[]) =>
  (state: T) =>
    fns.reduce((val, fn) => fn(structuredClone(val)), state);

export interface System {
  fn: SystemFn;
  name?: string;
  order?: number;
  path?: string;
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
export function collapse<T>(
  list: Record<number, SystemFn<T>>,
  val: number,
  mode?: Comparator
): SystemFn<T> {
  const comparator = mode ?? 'lte';
  const systems = Object.entries(list)
    .filter(([key]) => compare(Number(key), comparator, val))
    .map(([, system]) => system);
  return (world: T) => pipe(...systems)(world);
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
