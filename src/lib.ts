import deepEqual from 'fast-deep-equal';

export interface World {
  events: WorldEvent[];
  state: Record<string, any>;
}
export type System = (world: World) => World;
export type WorldEvent = {
  event: Event;
  tag: string;
};

export type Trigger = (event: Event) => void;
export type TriggerList = Record<string, Trigger>;

export const pipe =
  (...fns: System[]) =>
  (arg: World) =>
    fns.reduce((val, fn) => fn(val), arg);

export const runTriggers = (triggers: TriggerList, events: WorldEvent[]) =>
  Object.entries(triggers).forEach(([tag, fn]) => {
    const event = events.find((event) => event.tag === tag);
    if (event) fn(event.event);
  });

export const memo = <F extends (...args: any[]) => any>(
  fn: F
): ((...args: Parameters<F>) => ReturnType<F>) => {
  let lastParams: any[] = [];
  let result: ReturnType<F>;

  return (...params: Parameters<F>) => {
    console.log({ params, lastParams, result });

    if (deepEqual(params, lastParams)) {
      console.log('equal');
      return result;
    } else {
      console.log('not equal');
      result = fn(...params);
      lastParams = params;
      return result;
    }
  };
};
