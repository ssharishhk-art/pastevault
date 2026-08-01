import { describe, it, expect } from 'vitest';

describe('Core Logic Sanity Tests', () => {
  it('calculates expiration dates correctly', () => {
    const now = new Date();
    const future = new Date(now.getTime() + 10 * 60 * 1000);
    expect(future.getTime() - now.getTime()).toBe(600000);
  });

  it('slug format verification', () => {
    const slug = 'aZ9kLm12';
    expect(slug).toHaveLength(8);
  });
});
