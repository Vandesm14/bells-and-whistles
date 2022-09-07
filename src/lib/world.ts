export type World = typeof init;

export type System = (state: World) => World;

export const pipe =
  (...fns: System[]) =>
  (state: World) =>
    fns.reduce((val, fn) => fn(structuredClone(val)), state);

export const init = {
  framecount: 0,
  apu: {
    master: false,
    rpm: 0,
    flow: 0,
    temp: 0,
    ignition: false,
    starter: false,
  },
};
