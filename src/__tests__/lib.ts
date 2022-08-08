import { memo } from '../lib';

// this needs to have some delay so we can verify that it's faster
const add = async (a: number, b: number): Promise<number> =>
  new Promise((res) => setTimeout(() => res(a + b), 50));

describe('memo', () => {
  let memoAdd = memo(add);

  beforeEach(() => {
    memoAdd = memo(add);
  });

  it('should run a function and return the result', async () => {
    const result = await memoAdd(2, 2);
    expect(result).toBe(4);
  });

  it('should be quicker when running with the same args', async () => {
    const first = Date.now();
    await memoAdd(2, 2);
    const second = Date.now();
    await memoAdd(2, 2);
    const third = Date.now();

    const initial = second - first;
    const withMemo = third - second;

    expect(withMemo).toBeLessThan(initial);
  });
});
