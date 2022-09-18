import colors from '../components/compose/colors';
import { changeDetector, interpolation } from './blocks';
import { group, performanceInit, perSecond, system, System } from './engine';
import { smooth } from './math';

export const constants = {
  reactor: {
    SELF_POWER: 1,
  },
  battery: {
    KWATTS: 100,
  },
};
const C = constants;

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
    mwatts: 0,
    onState: changeDetector.generate(false),
  },
};

export const queries = {
  reactor: {
    isSelfPowered: (world: World) =>
      world.reactor.mwatts >= C.reactor.SELF_POWER,
    isOn: (world: World) =>
      world.input.reactor.master &&
      (world.input.battery || queries.reactor.isSelfPowered(world)),
    state: (world: World) => {
      // off, start, on
      const isOn = queries.reactor.isOn(world);
      const isSelfPowered = queries.reactor.isSelfPowered(world);

      if (!isOn) return 'off';
      if (isOn && !isSelfPowered) return 'start';
      return 'on';
    },
    stateColor: (world: World) => {
      const state = queries.reactor.state(world);
      if (state === 'off') return colors.status.red;
      if (state === 'start') return colors.status.orange;
      return colors.status.green;
    },
    canBePowered: (world: World) =>
      world.input.battery || queries.reactor.isSelfPowered(world),
  },
  power: {
    available: (world: World) => {
      const battery = C.battery.KWATTS * Number(world.input.battery);
      const reactor = world.reactor.mwatts;
      return battery + reactor;
    },
  },
};
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
          perSecond(4),
          smooth
        );
      }

      return world;
    }),
    system('power', (world) => {
      world.reactor.mwatts = world.reactor.temperature.value / 10;
      return world;
    }),
  ]),
];
