import { KV } from '../lib/kv';
import { World } from '../lib/world';

export interface SliderProps {
  state: World;
  setState: React.Dispatch<React.SetStateAction<World>>;
  path: string;
  text: string;
}

export function Slider({ state, setState, path, text }: SliderProps) {
  const change: React.ChangeEventHandler<HTMLInputElement> = (e) =>
    setState((world) => KV(world).set(path, Number(e.target.value)).get());
  return (
    <label>
      {text}
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
