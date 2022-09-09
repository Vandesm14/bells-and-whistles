import { Comparator, compare } from './util';
import { World } from './world';

export type System<T = World> = (state: T) => T;

export const pipe =
  <T = World>(...fns: System<T>[]) =>
  (state: T) =>
    fns.reduce((val, fn) => fn(structuredClone(val)), state);

/**
 * A wrapper for Object.values() that returns an array of Systems
 * This will have more functionality in the future (especially for debugging)
 */
export function feature<T = World>(
  obj: Record<string, System<T>>,
  name?: string
): System<T>[] {
  return Object.values(obj);
}

/**
 * Collapses a set of systems into a single system that runs all systems either greater than or less than a value
 */
export function collapse<T>(
  list: Record<number, System<T>>,
  val: number,
  mode?: Comparator
): System<T> {
  const comparator = mode ?? 'lte';
  const systems = Object.entries(list)
    .filter(([key]) => compare(Number(key), comparator, val))
    .map(([, system]) => system);
  return (world: T) => pipe(...systems)(world);
}
