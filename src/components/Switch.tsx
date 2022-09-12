import colors from './compose/colors';
import { Column } from './compose/flex';

export interface SwitchProps {
  label?: string;
  top?: {
    text?: string;
    color?: string;
    on: boolean;
  };
  bottom?: {
    text?: string;
    color?: string;
    on: boolean;
  };
  value: boolean;
  onChange: (value: boolean) => void;
}

export function Switch({ label, top, bottom, value, onChange }: SwitchProps) {
  const toggle = () => {
    onChange(!value);
  };

  const bottomValue = bottom !== undefined ? bottom.on : value;

  const SIZE = 50;

  return (
    <Column
      style={{
        color: 'white',
      }}
      center
      maxContent
    >
      {label ? <span>{label.toUpperCase()}</span> : null}
      <Column
        style={{
          border: '2px solid white',
          backgroundColor: 'black',
          width: SIZE,
          height: SIZE,
        }}
        center
      >
        <b
          style={{
            height: SIZE / 2 - 2,
            color: top?.color || colors.status.orange,
          }}
        >
          {top?.on ? String(top.text || 'fault').toUpperCase() : null}
        </b>
        <hr
          style={{
            width: SIZE - 4,
            height: 2,
            backgroundColor: 'white',
            margin: 0,
          }}
        />
        <b
          style={{
            height: SIZE / 2 - 2,
            // border: '2px solid white',
            color: bottom?.color || colors.white,
          }}
        >
          {!bottomValue ? String(bottom?.text || 'off').toUpperCase() : null}
        </b>
        <input
          type="checkbox"
          onChange={toggle}
          checked={value}
          style={{
            position: 'absolute',
            opacity: 0,
            width: SIZE,
            height: SIZE,
            margin: 0,
          }}
        />
      </Column>
    </Column>
  );
}
