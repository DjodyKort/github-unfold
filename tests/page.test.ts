import { describe, expect, it } from 'vitest';
import { detectPage } from '../src/selectors/page';

describe('detectPage', () => {
  it('detects PR pages', () => {
    expect(detectPage('/python/cpython/pull/148283')).toBe('pr');
    expect(detectPage('/python/cpython/pull/148283/files')).toBe('pr');
  });

  it('detects issue pages', () => {
    expect(detectPage('/rust-lang/rust/issues/20041')).toBe('issue');
  });

  it('ignores non-conversation pages', () => {
    expect(detectPage('/python/cpython')).toBeNull();
    expect(detectPage('/python/cpython/pulls')).toBeNull();
    expect(detectPage('/')).toBeNull();
  });
});
