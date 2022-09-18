import { Column, Row } from '../compose/flex';

export interface LCDProps {
  value: number | string;
  label?: string;
  ch: number;
  center?: boolean;
  color?: string;
}

export default function LCD({ value, label, ch, color }: LCDProps) {
  const PADDING_W = 4;
  const PADDING_H = 2;
  const SIZE = 50;

  color = color || 'white';

  return (
    <Column
      style={{
        color: 'white',
      }}
      center
      maxContent
    >
      {label ? <span>{label.toUpperCase()}</span> : null}
      <Row
        style={{
          border: '2px solid #f6c29a',
          backgroundColor: 'black',
          height: SIZE,
          padding: `${PADDING_H}px ${PADDING_W}px`,
          fontSize: `${SIZE * 0.5}px`,
          color,
        }}
        center
      >
        {/* create equally spaced digits based on "ch" and if there are any leading 0's in the value, make the digits blank */}
        {Array(ch)
          .fill(0)
          .map((_, i) => {
            const digit = String(value).padStart(ch, ' ')[i];
            return (
              <Column
                key={i}
                style={{
                  width: ch * 3,
                  height: SIZE,
                  margin: '0 1px',
                }}
                center
              >
                {digit === '.' ? (
                  <span
                    style={{
                      display: 'block',
                      width: 2,
                      height: 2,
                      backgroundColor: 'white',
                    }}
                  />
                ) : (
                  <span>{digit.toUpperCase()}</span>
                )}
              </Column>
            );
          })}
      </Row>
    </Column>
  );
}
