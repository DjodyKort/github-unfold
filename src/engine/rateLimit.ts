/**
 * Enforces a minimum gap between successive actions.
 *
 * Used to space out network-triggering clicks (Load-more pagination) so a long
 * thread doesn't hammer GitHub. Clock and sleep are injectable so the behavior
 * is deterministically testable.
 */
export class RateLimiter {
  private last = -Infinity;

  constructor(
    private readonly minGapMs: number,
    private readonly now: () => number = () => Date.now(),
    private readonly sleep: (ms: number) => Promise<void> = (ms) =>
      new Promise((r) => setTimeout(r, ms)),
  ) {}

  async wait(): Promise<void> {
    const elapsed = this.now() - this.last;
    if (elapsed < this.minGapMs) {
      await this.sleep(this.minGapMs - elapsed);
    }
    this.last = this.now();
  }
}
