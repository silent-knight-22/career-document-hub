import { forwardRef } from 'react';
import './Input.css';

const Input = forwardRef(function Input(
  { label, error, hint, icon: Icon, iconRight, className = '', ...props },
  ref
) {
  return (
    <div className={`input-field ${error ? 'input-error' : ''} ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <div className="input-wrapper">
        {Icon && <span className="input-icon-left"><Icon size={16} /></span>}
        <input
          ref={ref}
          className={`input-el ${Icon ? 'has-icon-left' : ''} ${iconRight ? 'has-icon-right' : ''}`}
          {...props}
        />
        {iconRight && <span className="input-icon-right">{iconRight}</span>}
      </div>
      {error && <span className="input-error-msg">{error}</span>}
      {hint && !error && <span className="input-hint">{hint}</span>}
    </div>
  );
});

export default Input;
