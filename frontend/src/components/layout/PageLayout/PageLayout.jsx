import Navbar from '../Navbar/Navbar';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';

/**
 * Standard page frame inside AppShell (navbar + content wrapper).
 * Also sets the browser tab title for SEO.
 *
 * @param {{
 *   title: string,
 *   children: import('react').ReactNode,
 *   className?: string,
 *   description?: string,
 * }} props
 */
export default function PageLayout({
  title,
  children,
  className = 'page-container',
  description,
}) {
  useDocumentTitle(title, { description });

  return (
    <>
      <Navbar title={title} />
      <div className={className}>{children}</div>
    </>
  );
}
