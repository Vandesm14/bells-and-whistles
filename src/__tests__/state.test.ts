import { KV } from '../lib/state';

describe('state', () => {
  it('should set and get a value', () => {
    const kv = new KV();

    kv.set('foo', 'bar');
    expect(kv.get('foo')).toBe('bar');
  });

  it('should allow setting objects', () => {
    const kv = new KV();

    kv.set('test/a', { b: 1 });
    kv.set('test/a/b', 2);
    kv.set('test/c', { d: { e: 3 } });

    expect(kv.get('test')).toEqual({ a: { b: 2 }, c: { d: { e: 3 } } });
  });

  it('should get a nested property', () => {
    const kv = new KV();

    kv.set('test/a', 1);
    kv.set('test/b', 2);

    expect(kv.get('test/a')).toEqual(1);
    expect(kv.get('test/b')).toEqual(2);
  });

  it('should get all nested properties', () => {
    const kv = new KV();

    kv.set('test/a', 1);
    kv.set('test/b', 2);
    kv.set('test/c/c', 3);

    expect(kv.get()).toEqual({ test: { a: 1, b: 2, c: { c: 3 } } });
  });

  it('should overwrite a property', () => {
    const kv = new KV();

    kv.set('test/a', 1);
    kv.set('test/a', 2);

    expect(kv.get('test/a')).toEqual(2);
  });

  it('should delete a property', () => {
    const kv = new KV();

    kv.set('test/a', 1);
    kv.delete('test/a');

    expect(kv.get('test')).toEqual({});
  });

  it('should deep delete a property', () => {
    const kv = new KV();

    kv.set('test/a', 1);
    kv.set('test/b', 2);
    kv.delete('test');

    expect(kv.get()).toEqual({});
  });
});
