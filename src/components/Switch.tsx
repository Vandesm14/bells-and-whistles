import colors from './compose/colors';
import { Column } from './compose/flex';
import { Clickable } from './compose/interact';

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
    // <label>
    //   <input type="checkbox" onChange={handleChange} checked={value} />
    //   {label}
    // </label>
    <Column
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
      }}
    >
      {label ? <span>{label.toUpperCase()}</span> : null}
      <Clickable onClick={toggle}>
        <Column
          style={{
            border: '2px solid white',
            backgroundColor: 'black',
            width: SIZE,
            height: SIZE,
            justifyContent: 'center',
            alignItems: 'center',
          }}
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
        </Column>
      </Clickable>
    </Column>
  );
}
