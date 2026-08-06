import Navbar from '../Navbar/Navbar';

/**
 * Standard page frame inside AppShell (navbar + content wrapper).
 * @param {{ title: string, children: import('react').ReactNode, className?: string }} props
 * Defaults to `page-container`. Pass a custom layout class (e.g. `sign-layout`) for full-bleed pages.
 */
export default function PageLayout({ title, children, className = 'page-container' }) {
  return (
    <>
      <Navbar title={title} />
      <div className={className}>{children}</div>
    </>
  );
}
