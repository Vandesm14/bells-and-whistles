import { render } from 'preact';
import { useState, useEffect } from 'preact/hooks';

const world = {
  state: {},
};

function power(state: State): State {
  return state;
}

const systems: Reducer[] = [power];

type State = typeof world['state'];
type Reducer = (state: State) => State;

const pipe =
  (...fns: Reducer[]) =>
  (arg: State) =>
    fns.reduce((val, fn) => fn(val), arg);

function tick(state: State): State {
  state = structuredClone(state);

  state = pipe(...systems)(state);
  console.log(state);

  return state;
}

setInterval(() => tick(world.state), 0);
tick(world.state);

const App = () => {
  return <h1>Hey</h1>;
};

render(<App />, document.body);
