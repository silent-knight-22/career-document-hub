/**
 * Shared loading indicator for Suspense / route transitions.
 */
export default function PageLoader({ label = 'Loading page', minHeight = '40vh' }) {
  return (
    <div
      className="page-loader"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight,
      }}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div
        className="animate-spin"
        style={{
          width: 32,
          height: 32,
          border: '3px solid var(--border-color)',
          borderTopColor: 'var(--brand-primary)',
          borderRadius: '50%',
        }}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
