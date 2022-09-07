import { KV, Store } from '../lib/state';
import type React from 'react';

export interface MomentaryProps {
  text: string;
  setState: React.Dispatch<React.SetStateAction<Store>>;
}

export function Momentary({ setState, text }: MomentaryProps) {
  return (
    <button
      onMouseDown={() =>
        setState((world) => KV(world).set('momentary.test.curr', true).get())
      }
      onMouseUp={() =>
        setState((world) => KV(world).set('momentary.test.curr', false).get())
      }
    >
      {text}
    </button>
  );
}
