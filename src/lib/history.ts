import { applyPartialDiff, getPartialDiff } from './util';

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

/**
 * Discards the last value in the history. If the history is at the beginning, it will return the same history.
 */
export function backward<T extends Record<string, any>>(
  history: History<T>
): History<T> {
  if (history.length === 1) return history;
  // @ts-expect-error: TS doesn't know that the first element is always present
  return history.slice(0, -1);
}

/**
 * Rebuilds the state up to the given index.
 * @param index defaults to the last index
 */
export function rollback<T extends Record<string, any>>(
  history: History<T>,
  index?: number
): T {
  index = index ?? history.length - 1;
  // @ts-expect-error: TS doesn't know that the first element is always present
  return history
    .slice(0, index + 1)
    .reduce((acc, diff) => applyPartialDiff(acc, diff), history[0]);
}
