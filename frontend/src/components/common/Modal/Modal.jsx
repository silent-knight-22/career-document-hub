import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import './Modal.css';

/**
 * Accessible modal with focus trap and Escape-to-close.
 */
export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const overlayRef = useRef(null);
  const dialogRef = useRef(null);
  const previouslyFocused = useRef(null);
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return undefined;

    previouslyFocused.current = document.activeElement;
    document.body.style.overflow = 'hidden';

    const dialog = dialogRef.current;
    const focusable = () =>
      dialog?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ) ?? [];

    const nodes = focusable();
    (nodes[0] || dialog)?.focus?.();

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !dialog) return;

      const list = [...focusable()];
      if (list.length === 0) {
        e.preventDefault();
        return;
      }
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
      previouslyFocused.current?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay animate-fade-in"
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div
        ref={dialogRef}
        className={`modal-box modal-${size} animate-scale-in`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div className="modal-header">
          <h3 className="modal-title" id={titleId}>
            {title}
          </h3>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
