import { useMemo } from 'react';

/**
 * Memoize a sync localStorage-backed snapshot so pages don't re-parse
 * multi-MB JSON on every parent re-render.
 *
 * @template T
 * @param {() => T} loader
 * @param {string | number | boolean | null | undefined} depsKey — usually userId
 * @returns {T}
 */
export function useLocalSnapshot(loader, depsKey) {
  // loader is recreated each render by callers; depsKey is the real invalidation signal
  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional
  return useMemo(() => loader(), [depsKey]);
}
