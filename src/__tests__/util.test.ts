import { structureIsEqual } from '../lib/util';

describe('structureIsEqual', () => {
  it('should return true for equal objects', () => {
    const a = {
      a: 1,
      b: 2,
      c: 3,
    };
    const b = {
      a: 1,
      b: 2,
      c: 3,
    };

    expect(structureIsEqual(a, b)).toBe(true);
  });

  it('should return true for deep equal objects', () => {
    const a = {
      a: 1,
      b: 2,
      c: {
        d: 4,
      },
    };
    const b = {
      a: 1,
      b: 2,
      c: {
        d: 4,
      },
    };

    expect(structureIsEqual(a, b)).toBe(true);
  });

  it('should return false for unequal objects', () => {
    const a = {
      a: 1,
      b: 2,
      c: 3,
    };
    const b = {
      a: 1,
      b: 2,
      different: 3,
    };

    expect(structureIsEqual(a, b)).toBe(false);
  });

  it('should return false for deep unequal objects', () => {
    const a = {
      a: 1,
      b: 2,
      c: {
        d: 4,
      },
    };
    const b = {
      a: 1,
      b: 2,
      c: {
        different: 4,
      },
    };

    expect(structureIsEqual(a, b)).toBe(false);
  });

  it('should return true for equal objects with different values', () => {
    const a = {
      a: 1,
      b: 2,
    };
    const b = {
      a: 3,
      b: 4,
    };

    expect(structureIsEqual(a, b)).toBe(true);
  });

  it('should not treat arrays as objects', () => {
    const a = [1, 2, 3];
    const b = [1, 2, 3];

    expect(structureIsEqual(a, b)).toBe(false);
  });

  it('should not recurse into arrays', () => {
    const a = {
      a: [1, 2, 3],
    };
    const b = {
      a: [1, 2, 3],
    };

    expect(structureIsEqual(a, b)).toBe(true);
  });
});
