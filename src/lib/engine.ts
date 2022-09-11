import { World } from './world';
import * as history from './history';
import { applyPartialDiff, getPartialDiff } from './util';

export const FRAME_RATE = 30;
export const perSecond = (constant: number) => constant / FRAME_RATE;

export type SystemFn<T = World> = (state: T) => T;
export interface System {
  fn: SystemFn;
  name?: string;
  order?: number;
  path?: string;
}

export type DebugState = {
  debugging: boolean;
  step: number;
  paused: boolean;
  recording: boolean;
  history: history.History<World>;
};
export const initDebugState = (world: World): DebugState => ({
  debugging: false,
  step: 1,
  paused: false,
  recording: false,
  history: history.generate(world),
});

/**
 * Runs a list of systems in order, and returns the new world state and the list of systems (if debug, they'll have debug info).
 */
export async function tick(
  world: World,
  systems: System[],
  debug: DebugState
): Promise<{ world: World; debug: DebugState }> {
  const transactions: Partial<World>[] = await Promise.all(
    systems.map(async (system) =>
      getPartialDiff(world, system.fn(structuredClone(world)))
    )
  );

  const newWorld = transactions.reduce<World>(
    (world, transaction) => applyPartialDiff(world, transaction),
    world
  );

  return { world: newWorld, debug };
}

export function calcPerformance(world: World, diff: number) {
  const { performance } = world;

  performance.ms = Date.now() - performance.lastTS;
  performance.fps = Math.round(1000 / (Date.now() - performance.lastTS));
  performance.lastTS = Date.now();

  const ms = performance.ms;
  const percentOfMs = (diff / ms) * 100;
  performance.tick = `${diff}ms (${percentOfMs.toFixed(2)}% of frame)`;

  return { ...world, performance };
}

/**
 * Creates a system
 */
export function system(name: string, fn: SystemFn): System {
  return { fn, name, path: name };
}

/**
 * Pepends a group name the path of systems
 */
export function group(name: string, systems: System[]): System[] {
  return systems.map((s) => ({
    ...s,
    path: `${name}.${s.path}`,
  }));
}

export function stableInterval(fn: () => void, interval: number) {
  let last = Date.now();
  let timer = 0;

  const loop = () => {
    const now = Date.now();
    const delta = now - last;

    if (delta > interval) {
      last = now;
      fn();
    }

    timer = requestAnimationFrame(loop);
  };

  loop();

  return () => cancelAnimationFrame(timer);
}
