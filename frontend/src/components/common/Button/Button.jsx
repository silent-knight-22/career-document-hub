import { isValidElement, cloneElement, createElement } from 'react';
import './Button.css';

function renderIcon(IconOrNode, size) {
  if (!IconOrNode) return null;
  if (isValidElement(IconOrNode)) {
    return cloneElement(IconOrNode, {
      size: IconOrNode.props.size ?? size,
      'aria-hidden': true,
    });
  }
  return createElement(IconOrNode, { size, 'aria-hidden': true });
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  iconRight,
  fullWidth = false,
  className = '',
  disabled,
  type = 'button',
  ...props
}) {
  const iconSize = size === 'sm' ? 14 : 16;

  return (
    <button
      type={type}
      className={`btn btn-${variant} btn-${size} ${fullWidth ? 'btn-full' : ''} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <span className="btn-spinner" aria-hidden="true" /> : renderIcon(Icon, iconSize)}
      {children}
      {!loading && renderIcon(iconRight, iconSize)}
    </button>
  );
}
