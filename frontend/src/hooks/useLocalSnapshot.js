import { useMemo } from 'react';

/**
 * Memoize a sync localStorage-backed list so pages don't re-parse
 * multi-MB JSON on every parent re-render.
 *
 * @template T
 * @param {() => T} loader
 * @param {unknown[]} deps
 * @returns {T}
 */
export function useLocalSnapshot(loader, deps) {
  // eslint-disable-next-line react-hooks/exhaustive-deps -- caller owns deps
  return useMemo(loader, deps);
}
