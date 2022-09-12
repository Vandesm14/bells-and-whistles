import colors from './compose/colors';
import { Column } from './compose/flex';

export interface SwitchProps {
  label?: string;
  top?: {
    text?: string;
    color?: string;
    /**
     * Turns on the top indicator
     */
    on: boolean;
  };
  bottom?: {
    text?: string;
    color?: string;
    /**
     * Turns on the bottom indicator
     * Optional: Defaults to `value`
     */
    on?: boolean;
  };
  /**
   * The value of the switch (will also control the bottom indicator if `bottom.on` is not set)
   */
  value: boolean;
  onChange: (value: boolean) => void;
}

export function Switch({ label, top, bottom, value, onChange }: SwitchProps) {
  const toggle = () => {
    onChange(!value);
  };

  const bottomValue = bottom?.on !== undefined ? bottom.on : value;
  const bottomColor = bottom?.color || colors.white;

  const PADDING_W = 4;
  const PADDING_H = 2;
  const BORDER = 2;
  const SIZE = 50;
  const LINE_HEIGHT = 20;

  const TEXT_HEIGHT = SIZE / 2 - PADDING_H * 2 + 4;

  const commonText: React.CSSProperties = {
    display: 'block',
    width: '100%',
    height: `${TEXT_HEIGHT + 4}px`,
    textAlign: 'center',
    lineHeight: `${LINE_HEIGHT}px`,
  };

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
          border: '2px solid #f6c29a',
          backgroundColor: 'black',
          width: SIZE,
          height: SIZE,
          padding: `${PADDING_H}px ${PADDING_W}px`,
        }}
        center
      >
        <b
          style={{
            color: top?.color || colors.status.orange,
            margin: `${BORDER}px 0`, // compensating for the border
            ...commonText,
          }}
        >
          {top?.on ? String(top.text || 'fault').toUpperCase() : ''}
        </b>
        <b
          style={{
            color: bottomColor,
            border: bottomValue ? `${BORDER}px solid ${bottomColor}` : 'none',
            margin: !bottomValue ? `${BORDER}px 0` : '0', // compensating for the border
            ...commonText,
          }}
        >
          {bottomValue ? String(bottom?.text || 'off').toUpperCase() : null}
        </b>
        <input
          type="checkbox"
          onChange={toggle}
          checked={value}
          style={{
            position: 'absolute',
            opacity: 0,
            width: SIZE + PADDING_W * 2 + BORDER * 2,
            height: SIZE + PADDING_H * 2 + BORDER * 2,
            margin: 0,
          }}
        />
      </Column>
    </Column>
  );
}
