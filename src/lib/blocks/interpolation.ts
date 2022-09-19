import { lerp } from '../math';

export interface Interpolation {
  /**
   * [onBegin] The value to start at
   */
  start: number;
  /**
   * The value to end at
   */
  end: number;
  /**
   * The current value (for use elsewhere)
   */
  value: number;
  /**
   * The percentage from start to end
   */
  percent: number;
}

export function generate(): Interpolation {
  return {
    start: 0,
    end: 0,
    value: 0,
    percent: 1,
  };
}

export function begin(
  interpolation: Interpolation,
  start: number,
  end: number
): Interpolation {
  interpolation.start = start;
  interpolation.end = end;
  interpolation.percent = 0;
  interpolation.value = start;
  return interpolation;
}

export function update(
  interpolation: Interpolation,
  rate: number,
  curve?: (a: number, b: number, percent: number) => number
): Interpolation {
  const curveFn = curve ?? lerp;

  const { start, end, percent, value } = interpolation;
  const length = Math.abs(start - end);
  const rateToPercent = rate / length;

  // if
  //   - overshoot
  //   - percent is greater than or equal to 1
  //   - the next value will overshoot
  if (rate > length || percent >= 1 || Math.abs(value - end) < rate) {
    interpolation.value = end;
    interpolation.percent = 1;
  } else {
    interpolation.value = curveFn(start, end, percent + rateToPercent);
    interpolation.percent += rateToPercent;
  }
  return interpolation;
}
