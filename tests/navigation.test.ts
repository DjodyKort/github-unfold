import { describe, expect, it, vi } from 'vitest';
import { onNavigate } from '../src/engine/navigation';

describe('onNavigate', () => {
  it('fires on a Turbo navigation event', () => {
    const cb = vi.fn();
    const dispose = onNavigate(cb);
    window.dispatchEvent(new Event('turbo:load'));
    expect(cb).toHaveBeenCalledTimes(1);
    dispose();
  });

  it('fires on history.pushState and restores it on dispose', () => {
    const cb = vi.fn();
    const original = window.history.pushState;
    const dispose = onNavigate(cb);
    window.history.pushState({}, '', '/python/cpython/pull/1');
    expect(cb).toHaveBeenCalledTimes(1);
    dispose();
    expect(window.history.pushState).toBe(original);
  });

  it('stops firing after dispose', () => {
    const cb = vi.fn();
    const dispose = onNavigate(cb);
    dispose();
    window.dispatchEvent(new Event('turbo:load'));
    expect(cb).not.toHaveBeenCalled();
  });
});
