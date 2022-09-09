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

export function logBase(base: number, value: number) {
  return Math.log(value) / Math.log(base);
}

// input an array of points: [[x1, y1], [x2, y2], ...]
// in between each point is a linear line
// output a function that takes a value between 0 and 1
// find which two points the value is in between (closest points)
// then use linear algebra to find the point on the line between those two points
export function pointsToCurve(points: [number, number][]) {
  return (value: number) => {
    const index = points.findIndex((point, i) => {
      if (i === 0) return value <= point[0];
      return value >= points[i - 1][0] && value <= point[0];
    });
    if (index === -1) return 0;
    if (index === 0) return points[0][1];
    if (index === points.length - 1) return points[index][1];
    const [x1, y1] = points[index - 1];
    const [x2, y2] = points[index];
    const m = (y2 - y1) / (x2 - x1);
    const b = y1 - m * x1;
    return m * value + b;
  };
}
