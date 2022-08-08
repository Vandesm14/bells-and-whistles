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
