export interface Detector<T> {
  value: T;
  last: T;
  didChange: boolean;
}

export function generate<T>(initial: T): Detector<T> {
  return {
    value: initial,
    last: initial,
    didChange: false,
  };
}

export function detect<T>(detector: Detector<T>, newValue: T) {
  detector.didChange = detector.value !== newValue;
  detector.last = detector.value;
  detector.value = newValue;
  return detector;
}
