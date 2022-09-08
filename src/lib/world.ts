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

export function lerp(a: number, b: number, t: number, min?: number) {
  if (min && Math.abs(a - b) < min) return b;
  return a + (b - a) * t;
}

export function easeOut(a: number, b: number, t: number, min?: number) {
  if (min && Math.abs(a - b) < min) return b;
  return a + (b - a) * (1 - Math.pow(1 - t, 3));
}

export function easeInOut(a: number, b: number, t: number, min?: number) {
  if (min && Math.abs(a - b) < min) return b;
  return a + (b - a) * (1 - Math.pow(1 - t, 2));
}

export function clamp(a: number, min: number, max: number) {
  return Math.min(Math.max(a, min), max);
}

export function travel(from: number, to: number, rate: number, min = rate) {
  const diff = Math.abs(from - to);
  const delta = from < to ? rate : -rate;
  if (diff < min) return to;
  return from + delta;
  // return easeInOut(from, to, rate, min);
}

export function normalize(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  value: number
) {
  return ((value - x1) * (y2 - x2)) / (y1 - x1) + x2;
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

export const init = {
  framecount: 0,
  lastTS: 0,
  ms: 0,
  fps: 0,
  apu: {
    RPM_MIN: 22,
    master: false,
    starter: false,
    rpm: 0,
    injectors: false,
    fuelFlow: 0,
    throttle: 0,
  },
};

export type World = typeof init;
