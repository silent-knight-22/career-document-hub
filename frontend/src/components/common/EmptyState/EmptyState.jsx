/**
 * Reusable empty-state block.
 */
export default function EmptyState({
  icon,
  title,
  description,
  action,
  compact = false,
}) {
  return (
    <div
      className={`empty-state${compact ? ' empty-state-compact' : ''}`}
      role="status"
    >
      {icon != null && (
        <div className={`empty-state-icon${compact ? '' : ' animate-float'}`} aria-hidden="true">
          {icon}
        </div>
      )}
      <h3>{title}</h3>
      {description ? <p>{description}</p> : null}
      {action || null}
    </div>
  );
}
