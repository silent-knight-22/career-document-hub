/**
 * Defer Google script fonts until the Type-signature UI mounts.
 * Keeps Inter (UI font) on the critical path; signature fonts are optional.
 */

const LINK_ID = 'cdh-signature-fonts';
const HREF =
  'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;600;700&family=Pacifico&family=Satisfy&family=Alex+Brush&family=Great+Vibes&family=Allura&family=Arizonia&family=Pinyon+Script&family=Sacramento&family=Mrs+Saint+Delafield&family=Monsieur+La+Doulaise&display=swap';

/** @type {Promise<void> | null} */
let pending = null;

/** @returns {Promise<void>} */
export function loadSignatureFonts() {
  if (typeof document === 'undefined') return Promise.resolve();
  if (document.getElementById(LINK_ID)) return Promise.resolve();
  if (pending) return pending;

  pending = new Promise((resolve) => {
    const link = document.createElement('link');
    link.id = LINK_ID;
    link.rel = 'stylesheet';
    link.href = HREF;
    link.media = 'print';
    link.onload = () => {
      link.media = 'all';
      resolve();
    };
    link.onerror = () => resolve();
    document.head.appendChild(link);
  });

  return pending;
}
