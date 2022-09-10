import {
  generate,
  push,
  toIndex,
  forward,
  backward,
  assemble,
} from '../lib/history';

const base = {
  a: 1,
  b: 2,
  c: {
    d: 3,
    e: {
      f: 4,
    },
  },
};

describe('history', () => {
  it('should create a history object', () => {
    const history = generate(base);

    expect(history).toEqual({
      list: [],
      base,
      value: base,
      index: 0,
    });
  });

  describe('push', () => {
    it('should push a new state to the history', () => {
      let history = generate(base);
      const newState = {
        ...base,
        a: 2,
      };

      history = push(history, newState);

      expect(history).toEqual({
        list: [{ a: 2 }],
        base,
        value: newState,
        index: 1,
      });
    });

    it('should push a new deep state to the history', () => {
      let history = generate(base);
      const newState = {
        ...base,
        c: {
          ...base.c,
          e: {
            ...base.c.e,
            f: 5,
          },
        },
      };

      history = push(history, newState);

      expect(history).toEqual({
        list: [{ c: { e: { f: 5 } } }],
        base,
        value: newState,
        index: 1,
      });
    });
  });

  describe('assemble', () => {
    it('should assemble the history', () => {
      let history = generate(base);
      const newState = {
        ...base,
        a: 2,
      };

      history = push(history, newState);

      const assembled = assemble(history);

      expect(assembled).toEqual(newState);
      expect(history.value).toEqual(newState);
    });

    it('should assemble the history with multiple states', () => {
      let history = generate(base);

      history = push(history, { ...base, a: 2 });
      history = push(history, { ...base, a: 3 });
      history = push(history, { ...base, a: 4 });

      const assembled = assemble(history);

      expect(assembled).toEqual({ ...base, a: 4 });
      expect(history.value).toEqual({ ...base, a: 4 });
    });
  });

  describe('toIndex', () => {
    it('should treat 0 as the base value', () => {
      let history = generate(base);
      const newState = {
        ...base,
        a: 2,
      };

      history = push(history, newState);
      history = toIndex(history, 0);

      expect(history).toEqual({
        list: [{ a: 2 }],
        base,
        value: base,
        index: 0,
      });
    });

    it('should clamp the index to the list length', () => {
      let history = generate(base);
      const newState = {
        ...base,
        a: 2,
      };

      history = push(history, newState);
      history = toIndex(history, 2);

      expect(history).toEqual({
        list: [{ a: 2 }],
        base,
        value: newState,
        index: 1,
      });
    });

    it('should assemble the history to the index', () => {
      let history = generate(base);

      history = push(history, { ...base, a: 2 });
      history = push(history, { ...base, a: 3 });
      history = push(history, { ...base, a: 4 });

      history = toIndex(history, 1);
      expect(history).toEqual({
        list: [{ a: 2 }, { a: 3 }, { a: 4 }],
        base,
        value: { ...base, a: 2 },
        index: 1,
      });

      history = toIndex(history, 2);
      expect(history).toEqual({
        list: [{ a: 2 }, { a: 3 }, { a: 4 }],
        base,
        value: { ...base, a: 3 },
        index: 2,
      });
    });
  });

  describe('backward', () => {
    it('should go backward', () => {
      let history = generate(base);

      history = push(history, { ...base, a: 2 });
      history = push(history, { ...base, a: 3 });
      history = push(history, { ...base, a: 4 });

      history = backward(history);

      expect(history).toEqual({
        list: [{ a: 2 }, { a: 3 }, { a: 4 }],
        base,
        value: { ...base, a: 3 },
        index: 2,
      });
    });

    it('should not go backward if at the beginning', () => {
      let history = generate(base);

      history = push(history, { ...base, a: 2 });
      history = push(history, { ...base, a: 3 });
      history = push(history, { ...base, a: 4 });

      history.index = 0;
      history = backward(history);

      expect(history).toEqual({
        list: [{ a: 2 }, { a: 3 }, { a: 4 }],
        base,
        value: base,
        index: 0,
      });
    });
  });

  describe('forward', () => {
    it('should go forward', () => {
      let history = generate(base);

      history = push(history, { ...base, a: 2 });
      history = push(history, { ...base, a: 3 });
      history = push(history, { ...base, a: 4 });

      history.index = 0;
      history = forward(history);

      expect(history).toEqual({
        list: [{ a: 2 }, { a: 3 }, { a: 4 }],
        base,
        value: { ...base, a: 2 },
        index: 1,
      });
    });

    it('should not go forward at the end', () => {
      let history = generate(base);

      history = push(history, { ...base, a: 2 });
      history = push(history, { ...base, a: 3 });
      history = push(history, { ...base, a: 4 });
      history = forward(history);

      expect(history).toEqual({
        list: [{ a: 2 }, { a: 3 }, { a: 4 }],
        base,
        value: { ...base, a: 4 },
        index: 3,
      });
    });
  });
});
