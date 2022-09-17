import { changeDetector, interpolation } from './blocks';
import { group, performanceInit, perSecond, system, System } from './engine';

export const constants = {};

export type World = typeof initial;
export const initial = {
  performance: performanceInit,
  input: {
    battery: false,
    reactor: {
      master: false,
    },
  },
  reactor: {
    temperature: interpolation.generate(),
    power: 0,
    onState: changeDetector.generate(false),
  },
};

const queries = {
  reactor: {
    isOn: (world: World) =>
      world.input.reactor.master &&
      (world.input.battery || world.reactor.power > 1),
  },
};

const C = constants;
export const systems: System[] = [
  ...group('reactor', [
    system('detect change', (world: World) => {
      const isOn = queries.reactor.isOn(world);
      world.reactor.onState = changeDetector.detect(
        world.reactor.onState,
        isOn
      );
      return world;
    }),
    system('temperature', (world) => {
      const didChange = world.reactor.onState.didChange;
      const isOn = world.reactor.onState.value;

      if (didChange) {
        world.reactor.temperature = interpolation.begin(
          world.reactor.temperature,
          world.reactor.temperature.value,
          Number(isOn) * 100
        );
      } else {
        world.reactor.temperature = interpolation.update(
          world.reactor.temperature,
          perSecond(1)
        );
      }

      return world;
    }),
    system('power', (world) => {
      world.reactor.power = world.reactor.temperature.value / 10;
      return world;
    }),
  ]),
];
