import { normalize } from '../lib/world';

describe('World', () => {
  describe('normalize', () => {
    it('should normalize a value', () => {
      expect(normalize(0, 100, 0, 1, 50)).toBe(0.5);
      expect(normalize(0, 100, 0, 1, 0)).toBe(0);
      expect(normalize(0, 100, 0, 1, 100)).toBe(1);
    });
  });
});
