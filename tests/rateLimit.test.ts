import { describe, expect, it } from 'vitest';
import { RateLimiter } from '../src/engine/rateLimit';

describe('RateLimiter', () => {
  it('does not wait on the first call', async () => {
    const clock = 1000;
    const sleeps: number[] = [];
    const rl = new RateLimiter(
      400,
      () => clock,
      async (ms) => void sleeps.push(ms),
    );
    await rl.wait();
    expect(sleeps).toEqual([]);
  });

  it('sleeps for the remaining gap when called too soon', async () => {
    let clock = 1000;
    const sleeps: number[] = [];
    const rl = new RateLimiter(
      400,
      () => clock,
      async (ms) => {
        sleeps.push(ms);
        clock += ms;
      },
    );
    await rl.wait(); // t=1000, no sleep
    clock += 100; // 100ms later
    await rl.wait(); // needs 300ms more
    expect(sleeps).toEqual([300]);
  });

  it('does not sleep when enough time has already passed', async () => {
    let clock = 1000;
    const sleeps: number[] = [];
    const rl = new RateLimiter(
      400,
      () => clock,
      async (ms) => void sleeps.push(ms),
    );
    await rl.wait();
    clock += 500;
    await rl.wait();
    expect(sleeps).toEqual([]);
  });
});
