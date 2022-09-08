import { KV } from '../lib/state';
import type React from 'react';
import { World } from '../lib/world';

export interface SwitchProps {
  state: World;
  setState: React.Dispatch<React.SetStateAction<World>>;
  path: string;
  text: string;
}

export function Switch({ state, setState, path, text }: SwitchProps) {
  const change: React.ChangeEventHandler<HTMLInputElement> = (e) =>
    setState((world) => KV(world).set(path, e.target.checked).get());

  return (
    <label>
      <input
        type="checkbox"
        onChange={change}
        defaultChecked={KV(state).get(path)}
      />
      {text}
    </label>
  );
}
