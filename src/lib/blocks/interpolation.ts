import { lerp } from '../util';

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
   * The amount of units to move per update
   */
  rate: number;
  /**
   * The percentage from start to end
   */
  t: number;
}

export function generate(): Interpolation {
  return {
    start: 0,
    end: 0,
    value: 0,
    t: 1,
    rate: 0,
  };
}

export function begin(
  interpolation: Interpolation,
  start: number,
  end: number,
  rate: number
): Interpolation {
  interpolation.start = start;
  interpolation.end = end;
  interpolation.t = 0;
  interpolation.value = start;
  interpolation.rate = rate;
  return interpolation;
}

export function update(
  interpolation: Interpolation,
  curve?: (a: number, b: number, t: number) => number
): Interpolation {
  const curveFn = curve ?? lerp;

  const { start, end, rate, t, value } = interpolation;
  const length = Math.abs(start - end);
  const rateToPercent = rate / length;

  // if
  //   - overshoot
  //   - t is greater than or equal to 1
  //   - the next value will overshoot
  if (rate > length || t >= 1 || Math.abs(value - end) < rate) {
    interpolation.value = end;
    interpolation.t = 1;
  } else {
    interpolation.value = curveFn(start, end, t + rateToPercent);
    interpolation.t += rateToPercent;
  }
  return interpolation;
}
