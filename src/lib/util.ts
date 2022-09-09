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

/**
 * Returns a boolean if the structure of the two objects (nested keys) are the same.
 */
export function structureIsEqual(
  a: any,
  b: any,
  returnError: true
): { isEqual: boolean; error: string; keys: string[] };
export function structureIsEqual(a: any, b: any): boolean;
export function structureIsEqual(
  a: any,
  b: any,
  returnKeys?: boolean
): boolean | { isEqual: boolean; error: string; keys: string[] } {
  const errOrBool = (
    returnKeys: boolean | undefined,
    isEqual: boolean,
    error?: string
  ) => {
    if (returnKeys) {
      return { isEqual, error: error || '', keys: [] };
    }
    return isEqual;
  };

  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length)
    return errOrBool(returnKeys, false, 'length');
  if (Array.isArray(a) || Array.isArray(b))
    return errOrBool(returnKeys, false, 'array');
  for (const key of aKeys) {
    if (!bKeys.includes(key))
      return errOrBool(returnKeys, false, `missing key ${key}`);
    if (
      typeof a[key] === 'object' &&
      typeof b[key] === 'object' &&
      !Array.isArray(a[key]) &&
      !Array.isArray(b[key])
    ) {
      const result = structureIsEqual(a[key], b[key], true);
      if (!result.isEqual) return errOrBool(returnKeys, false, result.error);
    }
  }
  return errOrBool(returnKeys, true);
}
