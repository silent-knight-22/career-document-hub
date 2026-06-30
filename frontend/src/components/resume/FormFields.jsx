import React from 'react';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

export function isSectionComplete(section, data) {
  switch (section) {
    case 'personal':
      return !!(data.personal.name && data.personal.email);
    case 'education':
      return data.education.length > 0 && !!(data.education[0].institution);
    case 'experience':
      return data.experience.length > 0 && !!(data.experience[0].company);
    case 'projects':
      return data.projects.length > 0 && !!(data.projects[0].name);
    case 'skills':
      return Object.values(data.skills).some((v) => v?.trim());
    case 'certifications':
      return data.certifications.length > 0;
    default:
      return false;
  }
}

export function Section({ id, icon: Icon, title, open, onToggle, complete, children }) {
  return (
    <div className={`resume-section ${complete ? 'complete' : ''}`}>
      <button
        className="resume-section-header"
        onClick={() => onToggle(id)}
        aria-expanded={open}
      >
        <span className="resume-section-title">
          <Icon size={16} />
          {title}
          {complete && <span className="resume-section-complete-dot" title="Section complete" />}
        </span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && <div className="resume-section-body">{children}</div>}
    </div>
  );
}

export function ItemRow({ children, onDelete }) {
  return (
    <div className="resume-item-row">
      <div className="resume-item-fields">{children}</div>
      <button className="resume-item-delete" onClick={onDelete} title="Remove entry">
        <Trash2 size={14} />
      </button>
    </div>
  );
}

export function F({ label, value, onChange, placeholder, multiline, type = 'text' }) {
  return (
    <div className="resume-field">
      <label className="resume-field-label">{label}</label>
      {multiline ? (
        <textarea
          className="resume-field-input"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={3}
        />
      ) : (
        <input
          className="resume-field-input"
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}
