import { NAST_SERVICE } from './services';

describe('Services Configuration', () => {
  it('should define NAST_SERVICE constant', () => {
    expect(NAST_SERVICE).toBeDefined();
    expect(typeof NAST_SERVICE).toBe('string');
  });

  it('should have correct NAST_SERVICE value', () => {
    expect(NAST_SERVICE).toBe('NAST_SERVICE');
  });

  it('should be a non-empty string', () => {
    expect(NAST_SERVICE.length).toBeGreaterThan(0);
  });
});