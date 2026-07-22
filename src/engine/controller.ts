import { detectPage } from '../selectors/page';
import type { PageKind } from '../selectors/types';
import { getSettings, watchSettings } from '../settings/storage';
import type { Settings } from '../settings/defaults';
import { runExpandPass, type ExpandPassResult } from './pass';
import { RateLimiter } from './rateLimit';
import { onNavigate } from './navigation';

export interface ControllerHooks {
  /** Notified after each pass that expanded at least one thing. */
  onExpanded?: (result: ExpandPassResult, page: PageKind) => void;
}

const DEBOUNCE_MS = 250;
/** Timed follow-up passes to catch content that streams in after load. */
const BURST_DELAYS_MS = [0, 400, 1000, 2000];

/**
 * Orchestrates auto-expansion across a page's lifetime.
 *
 * On each navigation it resets per-nav state (the actioned set, pass counter),
 * runs a burst of timed passes to catch async/streamed content, and observes
 * the DOM to react to lazily-loaded batches — all bounded by `settings.maxPasses`.
 */
export class ExpandController {
  private settings: Settings;
  private readonly hooks: ControllerHooks;
  private observer: MutationObserver | null = null;
  private disposeNav: (() => void) | null = null;
  private unwatchSettings: (() => void) | null = null;

  private actioned = new WeakSet<Element>();
  private rateLimiter: RateLimiter;
  private passCount = 0;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private burstTimers: ReturnType<typeof setTimeout>[] = [];
  private running = false;

  constructor(settings: Settings, hooks: ControllerHooks = {}) {
    this.settings = settings;
    this.hooks = hooks;
    this.rateLimiter = new RateLimiter(settings.rateLimitMs);
  }

  static async create(hooks: ControllerHooks = {}): Promise<ExpandController> {
    return new ExpandController(await getSettings(), hooks);
  }

  start(): void {
    if (this.running) return;
    this.running = true;

    this.unwatchSettings = watchSettings((next) => {
      this.settings = next;
      this.rateLimiter = new RateLimiter(next.rateLimitMs);
      if (next.autoExpand) this.scheduleBurst();
    });

    this.disposeNav = onNavigate(() => this.onNavigation());

    this.observer = new MutationObserver(() => this.scheduleDebouncedPass());
    this.observer.observe(document.documentElement, { childList: true, subtree: true });

    this.onNavigation();
  }

  stop(): void {
    this.running = false;
    this.observer?.disconnect();
    this.observer = null;
    this.disposeNav?.();
    this.disposeNav = null;
    this.unwatchSettings?.();
    this.unwatchSettings = null;
    this.clearTimers();
  }

  private onNavigation(): void {
    this.actioned = new WeakSet<Element>();
    this.passCount = 0;
    this.clearTimers();
    if (this.settings.autoExpand) this.scheduleBurst();
  }

  private scheduleBurst(): void {
    this.clearTimers();
    for (const delay of BURST_DELAYS_MS) {
      this.burstTimers.push(setTimeout(() => void this.runPass(), delay));
    }
  }

  private scheduleDebouncedPass(): void {
    if (!this.settings.autoExpand) return;
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => void this.runPass(), DEBOUNCE_MS);
  }

  private async runPass(): Promise<void> {
    if (!this.settings.autoExpand) return;
    if (this.passCount >= this.settings.maxPasses) return;
    const page = detectPage();
    if (!page) return;

    this.passCount += 1;
    const result = await runExpandPass(document, this.settings, page, {
      rateLimiter: this.rateLimiter,
      actioned: this.actioned,
    });
    if (result.expanded > 0) this.hooks.onExpanded?.(result, page);
  }

  private clearTimers(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = null;
    for (const t of this.burstTimers) clearTimeout(t);
    this.burstTimers = [];
  }
}
