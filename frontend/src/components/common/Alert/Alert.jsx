import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

/**
 * Inline success / error / warning / info feedback.
 * @param {{ tone?: 'success'|'error'|'warning'|'info', children: import('react').ReactNode, className?: string }} props
 */
export default function Alert({ tone = 'info', children, className = '' }) {
  const Icon = ICONS[tone] || Info;
  return (
    <div className={`ui-alert ui-alert-${tone}${className ? ` ${className}` : ''}`} role="alert">
      <Icon size={16} className="ui-alert-icon" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
