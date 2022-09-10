import { backward, forward, History, rollback } from '../lib/history';

describe('history', () => {
  it('should be able to forward', () => {
    const history: History<{ a: number }> = [{ a: 1 }];
    const newHistory = forward(history, { a: 2 });
    expect(newHistory).toEqual([{ a: 1 }, { a: 2 }]);
  });

  it('should decrease history when going backward', () => {
    const history: History<{ a: number }> = [{ a: 1 }, { a: 2 }];
    const newHistory = backward(history);
    expect(newHistory).toEqual([{ a: 1 }]);
  });

  it('should not decrease history when going backward at the beginning', () => {
    const history: History<{ a: number }> = [{ a: 1 }];
    const newHistory = backward(history);
    expect(newHistory).toEqual([{ a: 1 }]);
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
      b: 3, // changed
    });

    history = forward(history, {
      a: 2, // changed
      b: 3,
    });

    expect(rollback(history)).toEqual({ a: 1, b: 3 });
  });

  it('should rollback deep and apply partials recursively', () => {
    const initial = {
      a: 1,
      b: {
        c: 2,
        d: 3,
      },
    };
    let history: History<typeof initial> = [initial];

    history = forward(history, {
      a: 1,
      b: {
        c: 2,
        d: 4, // changed
      },
    });

    history = forward(history, {
      a: 2, // changed
      b: {
        c: 2,
        d: 4,
      },
    });

    expect(rollback(history)).toEqual({
      a: 1,
      b: {
        c: 2,
        d: 4,
      },
    });
  });

  it('random history rollback', () => {
    const randomOrSame = (value: number) =>
      Math.random() > 0.5 ? value : Math.random() * 100;

    const initial = {
      a: 1,
      b: 2,
      c: {
        d: 4,
        e: 5,
      },
    };

    let history: History<typeof initial> = [initial];
    const index = Math.floor(Math.random() * 98) + 2;

    let snapshot: typeof initial = initial;

    for (let i = 0; i < 100; i++) {
      const current = rollback(history);
      if (i === index) {
        snapshot = current;
      }
      history = forward(history, {
        a: randomOrSame(current.a),
        b: randomOrSame(current.b),
        c: {
          d: randomOrSame(current.c.d),
          e: randomOrSame(current.c.e),
        },
      });
    }

    expect(rollback(history, index)).toEqual(snapshot);
  });
});
