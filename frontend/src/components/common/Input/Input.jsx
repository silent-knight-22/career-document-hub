import { forwardRef, useId } from 'react';
import './Input.css';

const Input = forwardRef(function Input(
  { label, error, hint, icon: Icon, iconRight, className = '', id, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = error ? `${inputId}-error` : undefined;
  const hintId = hint && !error ? `${inputId}-hint` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`input-field ${error ? 'input-error' : ''} ${className}`}>
      {label && (
        <label className="input-label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <div className="input-wrapper">
        {Icon && (
          <span className="input-icon-left" aria-hidden="true">
            <Icon size={16} />
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`input-el ${Icon ? 'has-icon-left' : ''} ${iconRight ? 'has-icon-right' : ''}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...props}
        />
        {iconRight && (
          <span className="input-icon-right" aria-hidden="true">
            {iconRight}
          </span>
        )}
      </div>
      {error && (
        <span className="input-error-msg" id={errorId} role="alert">
          {error}
        </span>
      )}
      {hint && !error && (
        <span className="input-hint" id={hintId}>
          {hint}
        </span>
      )}
    </div>
  );
});

export default Input;
