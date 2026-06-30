import React from 'react';
import { GraduationCap, Plus } from 'lucide-react';
import { Section, ItemRow, F, isSectionComplete } from './FormFields';

export default function EducationSection({ data, open, onToggle, addItem, updateItem, removeItem }) {
  return (
    <Section
      id="education"
      icon={GraduationCap}
      title="Education"
      open={open}
      onToggle={onToggle}
      complete={isSectionComplete('education', data)}
    >
      {data.education.map((ed, i) => (
        <ItemRow key={i} onDelete={() => removeItem('education', i)}>
          <div className="resume-fields-grid-4">
            <F label="Degree"      value={ed.degree}      onChange={(e) => updateItem('education', i, 'degree', e.target.value)}      placeholder="B.Tech" />
            <F label="Field"       value={ed.field}       onChange={(e) => updateItem('education', i, 'field', e.target.value)}       placeholder="Computer Science" />
            <F label="Institution" value={ed.institution} onChange={(e) => updateItem('education', i, 'institution', e.target.value)} placeholder="IIT Delhi" />
            <F label="GPA / %"     value={ed.gpa}         onChange={(e) => updateItem('education', i, 'gpa', e.target.value)}         placeholder="8.5 / 10" />
            <F label="Start Year"  value={ed.startYear}   onChange={(e) => updateItem('education', i, 'startYear', e.target.value)}   placeholder="2020" />
            <F label="End Year"    value={ed.endYear}     onChange={(e) => updateItem('education', i, 'endYear', e.target.value)}     placeholder="2024 / Present" />
          </div>
        </ItemRow>
      ))}
      <button
        className="resume-add-btn"
        onClick={() => addItem('education', { degree: '', field: '', institution: '', gpa: '', startYear: '', endYear: '' })}
      >
        <Plus size={14} /> Add Education
      </button>
    </Section>
  );
}
