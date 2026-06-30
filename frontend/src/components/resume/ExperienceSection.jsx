import React from 'react';
import { Briefcase, Plus } from 'lucide-react';
import { Section, ItemRow, F, isSectionComplete } from './FormFields';

export default function ExperienceSection({ data, open, onToggle, addItem, updateItem, removeItem }) {
  return (
    <Section
      id="experience"
      icon={Briefcase}
      title="Experience"
      open={open}
      onToggle={onToggle}
      complete={isSectionComplete('experience', data)}
    >
      {data.experience.map((ex, i) => (
        <ItemRow key={i} onDelete={() => removeItem('experience', i)}>
          <div className="resume-fields-grid-4">
            <F label="Role"       value={ex.role}      onChange={(e) => updateItem('experience', i, 'role', e.target.value)}      placeholder="SDE Intern" />
            <F label="Company"    value={ex.company}   onChange={(e) => updateItem('experience', i, 'company', e.target.value)}   placeholder="Google" />
            <F label="Location"   value={ex.location}  onChange={(e) => updateItem('experience', i, 'location', e.target.value)}  placeholder="Remote / Bengaluru" />
            <F label="Start Date" value={ex.startDate} onChange={(e) => updateItem('experience', i, 'startDate', e.target.value)} placeholder="Jun 2024" />
            <F label="End Date"   value={ex.endDate}   onChange={(e) => updateItem('experience', i, 'endDate', e.target.value)}   placeholder="Aug 2024 / Present" />
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <F
              label="Responsibilities (one per line, start with •)"
              value={ex.description}
              onChange={(e) => updateItem('experience', i, 'description', e.target.value)}
              placeholder="• Built a feature that improved load time by 30%..."
              multiline
            />
          </div>
        </ItemRow>
      ))}
      <button
        className="resume-add-btn"
        onClick={() => addItem('experience', { role: '', company: '', location: '', startDate: '', endDate: '', description: '' })}
      >
        <Plus size={14} /> Add Experience
      </button>
    </Section>
  );
}
