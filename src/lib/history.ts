import { applyPartialDiff, getPartialDiff } from './util';

// export type HistoryList<T extends Record<string, any>> = [T, ...Partial<T>[]];
export interface History<T> {
  list: Array<Partial<T>>;
  base: T;
  value: T;
  index: number;
}

// History is a list of partial diffs, and a base state.
// It allows us to go back and forth in time, and apply the diffs to the base state.
// We can push a state to the history, and then go back and forth in time.
// If we push a new state while we're not at the end of the history, we'll remove the future states.

export function generate<T extends Record<string, any>>(base: T): History<T> {
  return {
    list: [],
    base,
    value: base,
    index: 0,
  };
}

export function push<T extends Record<string, any>>(
  history: History<T>,
  state: T
): History<T> {
  const diff = getPartialDiff(history.value, state);
  const list = [...history.list.slice(0, history.index), diff];

  const index = list.length;
  const value = state;
  return { ...history, list, index, value };
}

export function assemble<T extends Record<string, any>>(
  history: History<T>
): T {
  // use array.reduce to apply the diffs to the base state
  return history.list
    .slice(0, history.index)
    .reduce<T>((state, diff) => applyPartialDiff(state, diff), history.base);
}

export function toIndex<T extends Record<string, any>>(
  history: History<T>,
  index: number
): History<T> {
  index = Math.max(0, Math.min(index, history.list.length));

  const value = assemble({ ...history, index });
  return { ...history, index, value };
}

export function forward<T extends Record<string, any>>(
  history: History<T>,
  steps = 1
): History<T> {
  return toIndex(history, history.index + steps);
}

export function backward<T extends Record<string, any>>(
  history: History<T>,
  steps = 1
): History<T> {
  return toIndex(history, history.index - steps);
}
