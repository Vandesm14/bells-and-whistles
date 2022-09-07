import { KV } from '../lib/state';
import type React from 'react';
import { World } from '../lib/world';

export interface MomentaryProps {
  setState: React.Dispatch<React.SetStateAction<World>>;
  path: string;
  text: string;
}

export function Momentary({ setState, path, text }: MomentaryProps) {
  const setDown = () => setState((world) => KV(world).set(path, true).get());
  const setUp = () => setState((world) => KV(world).set(path, false).get());
  return (
    <button
      onMouseDown={setDown}
      onMouseUp={setUp}
      onKeyDown={setDown}
      onKeyUp={setUp}
    >
      {text}
    </button>
  );
}
