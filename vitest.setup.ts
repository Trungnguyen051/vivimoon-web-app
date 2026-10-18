import '@testing-library/jest-dom/vitest';

/*
 * jsdom implements none of the layout/observer APIs embla reaches for on mount,
 * so without these stubs every carousel component (hero, collection, content)
 * throws on render. They are inert: nothing here simulates layout, which is
 * fine — these tests assert markup and identity, never scroll position.
 */

class NoopObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
}

// Assigned through a widened alias: the DOM lib declares these as always
// present, so an `in`/truthiness guard narrows `window` to `never` instead.
const globals = globalThis as unknown as Record<string, unknown>;
globals.IntersectionObserver ??= NoopObserver;
globals.ResizeObserver ??= NoopObserver;

// Embla reads matchMedia for its breakpoint options. Always non-matching, which
// hands embla its base (non-breakpoint) options.
if (!window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
}
