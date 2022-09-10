import { forward, History, rollback } from '../lib/history';

describe('history', () => {
  it('should be able to forward', () => {
    const history: History<{ a: number }> = [{ a: 1 }];
    const newHistory = forward(history, { a: 2 });
    expect(newHistory).toEqual([{ a: 1 }, { a: 2 }]);
  });

  it('should keep a partial of each transaction', () => {
    const initial = { a: 1, b: 2, c: 3 };
    const history: History<typeof initial> = [initial];
    const newHistory = forward(history, { a: 1, b: 2, c: 4 });

    expect(newHistory).toEqual([{ a: 1, b: 2, c: 3 }, { c: 4 }]);
  });

  it('should rollback', () => {
    const initial = {
      a: 1,
      b: 2,
    };
    let history: History<typeof initial> = [initial];

    history = forward(history, {
      a: 1,
      b: 3,
    });

    history = forward(history, {
      a: 2,
      b: 3,
    });

    expect(rollback(history)).toEqual({ a: 1, b: 3 });
  });

  it('should rollback deep', () => {
    const initial = {
      a: 1,
      b: 2,
      c: {
        d: 4,
      },
    };
    let history: History<typeof initial> = [initial];

    history = forward(history, {
      a: 1,
      b: 3,
      c: {
        d: 4,
      },
    });

    history = forward(history, {
      a: 2,
      b: 3,
      c: {
        d: 4,
      },
    });

    expect(rollback(history)).toEqual({
      a: 1,
      b: 3,
      c: {
        d: 4,
      },
    });
  });
});
