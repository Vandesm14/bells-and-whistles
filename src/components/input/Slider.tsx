import { KV } from '../../lib/kv';
import { World } from '../../lib/world';

export interface SliderProps {
  state: World;
  setState: (world: World) => void;
  path: string;
  label: string;
}

export function Slider({ state, setState, path, label }: SliderProps) {
  const change: React.ChangeEventHandler<HTMLInputElement> = (e) =>
    setState(KV(state).set(path, Number(e.target.value)).get());
  return (
    <label>
      {label}
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        onChange={change}
        value={KV(state).get(path) ?? 0}
      />
    </label>
  );
}
