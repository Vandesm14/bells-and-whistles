import { KV } from '../lib/state';
import type React from 'react';
import { World } from '../lib/world';

export interface SwitchProps {
  setState: React.Dispatch<React.SetStateAction<World>>;
  path: string;
  text: string;
}

export function Switch({ setState, path, text }: SwitchProps) {
  const change: React.ChangeEventHandler<HTMLInputElement> = (e) =>
    setState((world) => KV(world).set(path, e.target.checked).get());
  return (
    <label>
      <input type="checkbox" onChange={change} />
      {text}
    </label>
  );
}
