import { lerp } from './world';

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

export function generateInterpolation(): Interpolation {
  return {
    start: 0,
    end: 0,
    value: 0,
    t: 1,
    rate: 0,
  };
}

export function beginInterpolation(
  interpolate: Interpolation,
  start: number,
  end: number,
  rate: number
): Interpolation {
  interpolate.start = start;
  interpolate.end = end;
  interpolate.t = 0;
  interpolate.value = start;
  interpolate.rate = rate;
  return interpolate;
}

export function updateInterpolation(
  interpolate: Interpolation,
  curve?: (a: number, b: number, t: number) => number
): Interpolation {
  curve = curve ?? lerp;

  const { start, end, rate, t, value } = interpolate;
  const length = Math.abs(start - end);
  const rateToPercent = rate / length;

  // if
  //   - overshoot
  //   - t is greater than or equal to 1
  //   - the next value will overshoot
  if (rate > length || t >= 1 || Math.abs(value - end) < rate) {
    interpolate.value = end;
    interpolate.t = 1;
  } else {
    console.log('before', {
      value: interpolate.value,
      t: interpolate.t,
      rateToPercent,
    });
    interpolate.value = curve(start, end, t + rateToPercent);
    interpolate.t += rateToPercent;
    console.log('after', {
      value: interpolate.value,
      t: interpolate.t,
      rateToPercent,
    });
  }
  console.log('update', interpolate);
  return interpolate;
}
