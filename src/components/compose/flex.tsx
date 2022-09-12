import { center } from './css';

export interface FlexProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  center?: boolean;
  align?: 'center' | 'right' | 'left' | 'top' | 'bottom';
  justify?: 'center' | 'right' | 'left' | 'top' | 'bottom';
  maxContent?: boolean;
}

export function Flex(props: FlexProps & { direction: 'row' | 'column' }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: props.direction,
        ...(props.center ? center : {}),
        ...(props.align ? { alignItems: props.align } : {}),
        ...(props.justify ? { justifyContent: props.justify } : {}),
        ...(props.maxContent ? { width: 'max-content' } : {}),
        ...props.style,
      }}
    >
      {props.children}
    </div>
  );
}

export function Column(props: FlexProps) {
  return (
    <Flex direction="column" {...props}>
      {props.children}
    </Flex>
  );
}

export function Row(props: FlexProps) {
  return (
    <Flex direction="row" {...props}>
      {props.children}
    </Flex>
  );
}
