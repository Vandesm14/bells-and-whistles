import { KV } from '../lib/state';
import { World } from '../lib/world';

export interface SliderProps {
  setState: React.Dispatch<React.SetStateAction<World>>;
  path: string;
  text: string;
}

export function Slider({ setState, path, text }: SliderProps) {
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
        defaultValue="0"
      />
    </label>
  );
}
