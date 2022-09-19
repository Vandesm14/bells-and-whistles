export interface Detector<T> {
  value: T;
  didChange: boolean;
}

export function generate<T>(initial: T): Detector<T> {
  return {
    value: initial,
    didChange: false,
  };
}

export function detect<T>(detector: Detector<T>, newValue: T) {
  detector.didChange = detector.value !== newValue;
  detector.value = newValue;
  return detector;
}
