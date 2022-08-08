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
