import { KV, Store } from '../lib/state';
import type React from 'react';

export interface MomentaryProps {
  text: string;
  setState: React.Dispatch<React.SetStateAction<Store>>;
}

export function Momentary({ setState, text }: MomentaryProps) {
  const setDown = () =>
    setState((world) => KV(world).set('momentary.test.curr', true).get());
  const setUp = () =>
    setState((world) => KV(world).set('momentary.test.curr', false).get());
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
