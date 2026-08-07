/**
 * Apply a local optimistic state update, run the mutation, roll back on failure.
 *
 * @template T
 * @param {{
 *   getSnapshot: () => T,
 *   setSnapshot: (next: T) => void,
 *   optimistic: (current: T) => T,
 *   commit: () => void | Promise<void>,
 *   onError?: (err: unknown) => void,
 * }} args
 */
export async function withOptimisticUpdate({
  getSnapshot,
  setSnapshot,
  optimistic,
  commit,
  onError,
}) {
  const previous = getSnapshot();
  setSnapshot(optimistic(previous));
  try {
    await commit();
  } catch (err) {
    setSnapshot(previous);
    onError?.(err);
    throw err;
  }
}
