import { expect } from 'https://deno.land/x/expect@v0.2.9/mod.ts';
import { describe, it, run } from 'https://deno.land/x/machiatto@v0.1.3/mod.ts';
import { db as store } from './db.ts';

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

describe('db', () => {
  it('inits empty db', () => {
    const db = store();
    expect(db.data).toEqual({});
  });

  it('inits a predefined db', () => {
    const db = store({ a: 1, b: 2 });
    expect(db.data).toEqual({ a: 1, b: 2 });
  });

  it('handles an addition', () => {
    const db = store();
    db.pure(() => ({ a: 1 }));
    expect(db.data).toEqual({ a: 1 });
    expect(db.stamps.has('a')).toBe(true);
  });

  it('handles a deletion', () => {
    const db = store({ a: 1 });
    db.pure(() => ({}));
    expect(db.data).toEqual({});
    expect(db.stamps.size).toBe(0);
  });

  it('handles an update', async () => {
    const db = store({ a: 1, b: 2 });
    const timestamp1 = db.stamps.get('a');
    await sleep(10);
    db.pure(() => ({ a: 2 }));
    const timestamp2 = db.stamps.get('a');
    if (!timestamp1 || !timestamp2) throw new Error('Missing a timestamp');
    expect(timestamp2?.getTime()).toBeGreaterThan(timestamp1?.getTime());
  });
});

await run();
