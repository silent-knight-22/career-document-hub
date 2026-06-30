import React from 'react';
import { Award, Plus } from 'lucide-react';
import { Section, ItemRow, F, isSectionComplete } from './FormFields';

export default function CertificationsSection({ data, open, onToggle, addItem, updateItem, removeItem }) {
  return (
    <Section
      id="certifications"
      icon={Award}
      title="Certifications"
      open={open}
      onToggle={onToggle}
      complete={isSectionComplete('certifications', data)}
    >
      {data.certifications.map((c, i) => (
        <ItemRow key={i} onDelete={() => removeItem('certifications', i)}>
          <div className="resume-fields-grid-4">
            <F label="Certificate" value={c.name}   onChange={(e) => updateItem('certifications', i, 'name', e.target.value)}   placeholder="AWS Cloud Practitioner" />
            <F label="Issuer"      value={c.issuer} onChange={(e) => updateItem('certifications', i, 'issuer', e.target.value)} placeholder="Amazon Web Services" />
            <F label="Year"        value={c.year}   onChange={(e) => updateItem('certifications', i, 'year', e.target.value)}   placeholder="2024" />
          </div>
        </ItemRow>
      ))}
      <button
        className="resume-add-btn"
        onClick={() => addItem('certifications', { name: '', issuer: '', year: '' })}
      >
        <Plus size={14} /> Add Certification
      </button>
    </Section>
  );
}
