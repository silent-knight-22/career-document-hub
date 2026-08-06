/**
 * Reusable empty-state block (uses global .empty-state styles).
 * @param {{
 *   icon?: import('react').ReactNode,
 *   title: string,
 *   description?: string,
 *   action?: import('react').ReactNode,
 *   compact?: boolean,
 * }} props
 */
export default function EmptyState({ icon, title, description, action, compact = false }) {
  return (
    <div className="empty-state" style={compact ? { padding: '2rem' } : undefined}>
      {icon != null && (
        <div className={`empty-state-icon${compact ? '' : ' animate-float'}`}>{icon}</div>
      )}
      <h3>{title}</h3>
      {description ? <p>{description}</p> : null}
      {action || null}
    </div>
  );
}
