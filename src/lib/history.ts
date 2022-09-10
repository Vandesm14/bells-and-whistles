import { getPartialDiff } from './util';

export type History<T extends Record<string, any>> = [T, ...Partial<T>[]];

export function forward<T extends Record<string, any>>(
  history: History<T>,
  value: T
): History<T> {
  if (history.length === 0) {
    return [value];
  }

  return [...history, getPartialDiff(history.at(-1)!, value)];
}

export function backward<T extends Record<string, any>>(
  history: History<T>
): History<T> {
  if (history.length === 1) return history;
  // @ts-expect-error: TS doesn't know that the first element is always present
  return history.slice(0, -1);
}

export function rollback<T extends Record<string, any>>(
  history: History<T>
): T {
  // @ts-expect-error: TS doesn't know that the first element is always present
  return history.reduce((acc, diff) => ({ ...acc, ...diff }), history[0]);
}
