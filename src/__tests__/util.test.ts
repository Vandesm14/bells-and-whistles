import {
  comparePathSpecificity,
  getPartialDiff,
  structureIsEqual,
} from '../lib/util';

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

    // @ts-expect-error: we know these are not equal
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

    // @ts-expect-error: we know these are not equal
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

describe('getPartialDiff', () => {
  it('should return an empty object for equal objects', () => {
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

    expect(getPartialDiff(a, b)).toEqual({});
  });

  it('should return an empty object for deep equal objects', () => {
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

    expect(getPartialDiff(a, b)).toEqual({});
  });

  it('should return the diff for unequal objects', () => {
    const a = {
      a: 1,
      b: 2,
      c: 3,
    };
    const b = {
      a: 1,
      b: 2,
      c: 4,
    };

    expect(getPartialDiff(a, b)).toEqual({
      c: 4,
    });
  });

  it('should return the diff for deep unequal objects', () => {
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
        d: 5,
      },
    };

    expect(getPartialDiff(a, b)).toEqual({
      c: {
        d: 5,
      },
    });
  });
});

describe('comparePathSpecificity', () => {
  it('should return 0 if the paths are equal', () => {
    expect(comparePathSpecificity('a.b.c', 'a.b.c')).toBe(0);
  });

  it('should return 0 if the paths are unrelated', () => {
    expect(comparePathSpecificity('a.b', 'c.d')).toBe(0);
    expect(comparePathSpecificity('a.b', 'a.c')).toBe(0);
  });

  it('should return 1 if the first path is more specific', () => {
    expect(comparePathSpecificity('a.b.c', 'a.b')).toBe(1);
    expect(comparePathSpecificity('a.b.c', 'a')).toBe(1);
  });

  it('should return -1 if the second path is more specific', () => {
    expect(comparePathSpecificity('a.b', 'a.b.c')).toBe(-1);
    expect(comparePathSpecificity('a', 'a.b.c')).toBe(-1);
  });

  it('should sort an array of paths by specificity', () => {
    const paths = ['a.b.c', 'a.b', 'a.g', 'a', 'a.b.c.d', 'a.b.c.e', 'a.b.c.e'];
    const sorted = [
      'a',
      'a.b',
      'a.b.c',
      'a.b.c.d',
      'a.b.c.e',
      'a.b.c.e',
      'a.g',
    ];

    expect(paths.sort().sort(comparePathSpecificity)).toEqual(sorted);
  });
});
