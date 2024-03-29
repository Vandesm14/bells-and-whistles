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

/**
 * Returns a boolean if the structure of the two objects (nested keys) are the same.
 */
export function structureIsEqual<T extends Record<string, any>>(
  a: T,
  b: T,
  returnError: true
): { isEqual: boolean; error: string; keys: string[] };
export function structureIsEqual<T extends Record<string, any>>(
  a: T,
  b: T
): boolean;
export function structureIsEqual<T extends Record<string, any>>(
  a: T,
  b: T,
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
    return errOrBool(returnKeys, false, `length mismatch`);
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

export function getPartialDiff<T extends Record<string, any>>(
  a: T,
  b: T
): Partial<T> {
  const keys = Object.keys(a);
  const diff: Partial<T> = {};
  for (const key of keys) {
    if (typeof a[key] === 'object' && typeof b[key] === 'object') {
      const result = getPartialDiff(a[key], b[key]);
      // @ts-expect-error: yes, string can be used as a key
      if (Object.keys(result).length > 0) diff[key] = result;
    } else if (a[key] !== b[key]) {
      // @ts-expect-error: yes, string can be used as a key
      diff[key] = b[key];
    }
  }
  return diff;
}

// create a type with all keys of T set to optional
// recursively for nested objects
export type PartialDeep<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? PartialDeep<U>[]
    : PartialDeep<T[P]>;
};

export function applyPartialDiff<T extends Record<string, any>>(
  a: T,
  diff: PartialDeep<T>
): T {
  const keys = Object.keys(diff);
  const result: T = { ...a };
  for (const key of keys) {
    if (Array.isArray(a[key])) {
      // ignore
    } else if (typeof a[key] === 'object' && typeof diff[key] === 'object') {
      // @ts-expect-error: yes, string can be used as a key
      result[key] = applyPartialDiff(a[key], diff[key]);
    } else {
      // @ts-expect-error: yes, string can be used as a key
      result[key] = diff[key];
    }
  }
  return result;
}

export function omit<T extends Record<string, any>>(
  obj: T,
  keys: Array<keyof T>
): Omit<T, typeof keys[number]> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

export function pick<T extends Record<string, any>>(
  obj: T,
  keys: Array<keyof T>
): Pick<T, typeof keys[number]> {
  const result: Pick<T, typeof keys[number]> = {} as any;
  for (const key of keys) {
    result[key] = obj[key];
  }
  return result;
}

export function last<T>(arr: T[]) {
  return arr[arr.length - 1];
}

export function range(start: number, end?: number) {
  if (end === undefined) {
    end = start;
    start = 0;
  }
  return Array.from({ length: end - start }, (_, i) => i + start);
}

export function dedupe<T>(arr: T[]) {
  return [...new Set(arr)];
}

/**
 * Compares the specificity of two paths such as `a.b.c` and `a.b`.
 * Returns 1 if a is more specific, -1 if b is more specific, and 0 if they are equal or unrelated.
 */
export function comparePathSpecificity(a: string, b: string) {
  if (a === b) return 0;
  const aParts = a.split('.');
  const bParts = b.split('.');

  // if they are equal or unrelated
  if (aParts.length === bParts.length) {
    for (let i = 0; i < aParts.length; i++) {
      if (aParts[i] !== bParts[i]) return 0;
    }
    return 0;
  }

  // if a is more specific or unrelated
  if (aParts.length > bParts.length) {
    for (let i = 0; i < bParts.length; i++) {
      if (aParts[i] !== bParts[i]) return 0;
    }
    return 1;
  }

  // if b is more specific or unrelated
  for (let i = 0; i < aParts.length; i++) {
    if (aParts[i] !== bParts[i]) return 0;
  }
  return -1;
}
