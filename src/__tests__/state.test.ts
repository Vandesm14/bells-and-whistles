import { KV } from '../lib/state';

describe('kv', () => {
  describe('create', () => {
    it('should set and get a value', () => {
      let kv = KV();

      kv = kv.set('foo', 'bar');
      expect(kv.get('foo')).toBe('bar');
    });

    it('should allow setting objects', () => {
      let kv = KV();

      kv = kv
        .set('test/a', { b: 1 })
        .set('test/a/b', 2)
        .set('test/c', { d: { e: 3 } });

      expect(kv.get('test')).toEqual({ a: { b: 2 }, c: { d: { e: 3 } } });
    });

    it('should persist with non-chained calls', () => {
      let kv = KV();

      kv = kv.set('foo', 'bar');
      kv = kv.set('test/a', { b: 1 });

      expect(kv.get()).toEqual({ foo: 'bar', test: { a: { b: 1 } } });
    });

    it('should be immutable when setting values', () => {
      let obj = { a: 1 };
      let kv = KV(obj);

      kv = kv.set('foo', 'bar');
      obj['a'] = 2;

      expect(obj).toEqual({ a: 2 });
      expect(kv.get()).toEqual({ foo: 'bar', a: 1 });
    });

    it('should allow bulk setting', () => {
      let kv = KV();

      kv = kv.bulkSet([
        ['foo', 'bar'],
        ['test/a', { b: 1 }],
      ]);

      expect(kv.get()).toEqual({ foo: 'bar', test: { a: { b: 1 } } });
    });
  });

  describe('get', () => {
    it('should get a nested property', () => {
      let kv = KV();

      kv = kv.set('test/a', 1).set('test/b', 2);

      expect(kv.get('test/a')).toEqual(1);
      expect(kv.get('test/b')).toEqual(2);
    });

    it('should get all nested properties', () => {
      let kv = KV();

      kv = kv.set('test/a', 1).set('test/b', 2).set('test/c/c', 3);

      expect(kv.get()).toEqual({ test: { a: 1, b: 2, c: { c: 3 } } });
    });

    it('should support dots as separators', () => {
      let kv = KV();

      kv = kv.set('test.a', 1).set('test.b', 2).set('test.c.c', 3);

      expect(kv.get('test.c')).toEqual({ c: 3 });
    });
  });

  describe('update', () => {
    it('should overwrite a property', () => {
      let kv = KV();

      kv = kv.set('test/a', 1).set('test/a', 2);

      expect(kv.get('test/a')).toEqual(2);
    });

    it('should allow partial updates', () => {
      let kv = KV();

      kv = kv
        .set('test/a', { b: 1 })
        .set('test/a', { c: 2 }, { partial: true });

      expect(kv.get('test/a')).toEqual({ b: 1, c: 2 });
    });
  });

  describe('delete', () => {
    it('should delete a property', () => {
      let kv = KV();

      kv = kv.set('test/a', 1).delete('test/a');

      expect(kv.get('test')).toEqual({});
    });

    it('should deep delete a property', () => {
      let kv = KV();

      kv = kv.set('test/a', 1).set('test/b', 2).delete('test');

      expect(kv.get()).toEqual({});
    });

    it('should be immutable when deleting values', () => {
      let obj = { a: 1 };
      let kv = KV(obj);

      kv = kv.delete('a');
      obj['a'] = 2;

      expect(obj).toEqual({ a: 2 });
      expect(kv.get()).toEqual({});
    });
  });
});

describe('kvmut', () => {
  it('should create a value', () => {
    let kv = KV();
    kv.set('foo', 'bar');
    expect(kv.get('foo')).toBe('bar');
  });

  it('should get all values', () => {
    let kv = KV();
    kv.set('foo', 'bar');
    expect(kv.get()).toEqual({ foo: 'bar' });
  });

  it('should update a value', () => {
    let kv = KV();
    kv.set('foo', 'bar');
    kv.set('foo', 'baz');
    expect(kv.get('foo')).toBe('baz');
  });

  it('should delete a value', () => {
    let kv = KV();
    kv.set('foo', 'bar');
    kv.delete('foo');
    expect(kv.get('foo')).toBe(undefined);
  });
});
