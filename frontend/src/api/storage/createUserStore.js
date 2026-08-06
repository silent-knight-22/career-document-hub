import { readJson, writeJson } from '../../utils/jsonStorage';

/**
 * Generic per-user array store backed by localStorage.
 * Swap this implementation for HTTP later without changing service facades.
 *
 * @template {{ id: string }} T
 * @param {string} keyPrefix - e.g. "cdh_vault_"
 */
export function createUserStore(keyPrefix) {
  const keyFor = (userId) => `${keyPrefix}${userId}`;

  /** @param {string} userId @returns {T[]} */
  const getAll = (userId) => readJson(keyFor(userId), /** @type {T[]} */ ([]));

  /** @param {string} userId @param {T[]} items */
  const setAll = (userId, items) => writeJson(keyFor(userId), items);

  return {
    getAll,
    setAll,

    /**
     * @param {string} userId
     * @param {string} id
     * @returns {T | null}
     */
    getById(userId, id) {
      return getAll(userId).find((item) => item.id === id) ?? null;
    },

    /**
     * @param {string} userId
     * @param {T} item
     * @param {{ prepend?: boolean }} [options]
     * @returns {T}
     */
    insert(userId, item, { prepend = false } = {}) {
      const items = getAll(userId);
      setAll(userId, prepend ? [item, ...items] : [...items, item]);
      return item;
    },

    /**
     * @param {string} userId
     * @param {string} id
     * @param {Partial<T>} updates
     * @returns {T | null}
     */
    update(userId, id, updates) {
      let updated = null;
      const items = getAll(userId).map((item) => {
        if (item.id !== id) return item;
        updated = { ...item, ...updates };
        return updated;
      });
      setAll(userId, items);
      return updated;
    },

    /**
     * @param {string} userId
     * @param {(item: T) => T} mapper
     * @returns {T[]}
     */
    mapAll(userId, mapper) {
      const items = getAll(userId).map(mapper);
      setAll(userId, items);
      return items;
    },

    /**
     * @param {string} userId
     * @param {string} id
     */
    remove(userId, id) {
      setAll(
        userId,
        getAll(userId).filter((item) => item.id !== id),
      );
    },
  };
}
