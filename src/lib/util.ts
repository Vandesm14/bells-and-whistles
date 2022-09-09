export type Comparator = 'lt' | 'gt' | 'lte' | 'gte' | 'eq' | 'neq';
export function compare(a: number, is: Comparator, b: number) {
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

export function smooth(a: number, b: number, t: number, min?: number) {
  if (min && Math.abs(a - b) < min) return b;
  // return -(Math.pow(t - 1, 2) - 1) * (b - a) + a;
  return Math.sin((t / 2) * Math.PI) * (b - a) + a;
}

export function clamp(a: number, min: number, max: number) {
  return Math.min(Math.max(a, min), max);
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
