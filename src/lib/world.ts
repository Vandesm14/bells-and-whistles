export type System<T = World> = (state: T) => T;

export const pipe =
  <T = World>(...fns: System<T>[]) =>
  (state: T) =>
    fns.reduce((val, fn) => fn(structuredClone(val)), state);

type Comparator = 'lt' | 'gt' | 'lte' | 'gte' | 'eq' | 'neq';
function compare(a: number, is: Comparator, b: number) {
  switch (is) {
    case 'lt':
      return a < b;
    case 'gt':
      return a > b;
    case 'lte':
      return a <= b;
    case 'gte':
      return a >= b;
    case 'eq':
      return a === b;
    case 'neq':
      return a !== b;
  }
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
    .filter(([key]) => compare(+key, comparator, val))
    .map(([, system]) => system);
  return (world: T) => pipe(...systems)(world);
}

export const init = {
  framecount: 0,
  apu: {
    master: false,
    starter: false,
    rpm: 0,
    ignition: false,
    fuel: 0,
    throttle: 0,
    uiRotate: 0,
  },
};

export type World = typeof init;
