import { sanitizeExternalUrl } from '../../../utils/sanitize';

/**
 * Renders an external <a> only when the href is a safe http(s) URL.
 * Always opens in a new tab with noopener/noreferrer.
 */
export default function SafeExternalLink({
  href,
  children,
  className,
  title,
  ...rest
}) {
  const safeHref = sanitizeExternalUrl(href);
  if (!safeHref) return null;

  return (
    <a
      href={safeHref}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      title={title}
      {...rest}
    >
      {children}
    </a>
  );
}
