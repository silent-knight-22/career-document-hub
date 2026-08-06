/** Central localStorage key prefixes for Career Document Hub. */
export const STORAGE_KEYS = {
  USERS: 'cdh_users',
  SESSION: 'cdh_session',
  REMEMBER: 'cdh_remember',
  VAULT: 'cdh_vault_',
  DOCUMENTS: 'cdh_documents_',
  CERTIFICATES: 'cdh_certs_',
  SIGNATURES: 'cdh_signatures_',
  RESUME: 'cdh_resume_',
  ANALYSIS: 'cdh_analysis_',
  CHAT: 'cdh_chat_',
  GROQ_API_KEY: 'cdh_groq_api_key',
};

/**
 * Removes all persisted data owned by a user (cascade delete).
 * @param {string} userId
 * @param {{ documentIds?: string[] }} [options]
 */
export function clearUserLocalData(userId, { documentIds = [] } = {}) {
  if (!userId) return;

  const ownedKeys = [
    `${STORAGE_KEYS.VAULT}${userId}`,
    `${STORAGE_KEYS.DOCUMENTS}${userId}`,
    `${STORAGE_KEYS.CERTIFICATES}${userId}`,
    `${STORAGE_KEYS.SIGNATURES}${userId}`,
    `${STORAGE_KEYS.RESUME}${userId}`,
  ];

  ownedKeys.forEach((key) => localStorage.removeItem(key));

  documentIds.forEach((docId) => {
    localStorage.removeItem(`${STORAGE_KEYS.ANALYSIS}${docId}`);
    localStorage.removeItem(`${STORAGE_KEYS.CHAT}${docId}`);
  });
}
