import { useEffect } from 'react';
import { APP_NAME } from '../config/env';

/**
 * Sets document.title for SPA routes (SEO + browser tab).
 * @param {string} [title]
 * @param {{ description?: string }} [options]
 */
export function useDocumentTitle(title, { description } = {}) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title ? `${title} · ${APP_NAME}` : APP_NAME;

    let meta;
    let prevDescription;
    if (description) {
      meta = document.querySelector('meta[name="description"]');
      if (meta) {
        prevDescription = meta.getAttribute('content');
        meta.setAttribute('content', description);
      }
    }

    return () => {
      document.title = prevTitle;
      if (meta && prevDescription != null) {
        meta.setAttribute('content', prevDescription);
      }
    };
  }, [title, description]);
}
