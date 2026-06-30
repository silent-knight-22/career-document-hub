import React from 'react';
import { FolderGit2, Plus } from 'lucide-react';
import { Section, ItemRow, F, isSectionComplete } from './FormFields';

export default function ProjectsSection({ data, open, onToggle, addItem, updateItem, removeItem }) {
  return (
    <Section
      id="projects"
      icon={FolderGit2}
      title="Projects"
      open={open}
      onToggle={onToggle}
      complete={isSectionComplete('projects', data)}
    >
      {data.projects.map((p, i) => (
        <ItemRow key={i} onDelete={() => removeItem('projects', i)}>
          <div className="resume-fields-grid-4">
            <F label="Project Name" value={p.name}   onChange={(e) => updateItem('projects', i, 'name', e.target.value)}   placeholder="Career Document Hub" />
            <F label="Tech Stack"   value={p.tech}   onChange={(e) => updateItem('projects', i, 'tech', e.target.value)}   placeholder="React, Spring Boot, Redis" />
            <F label="GitHub URL"   value={p.github} onChange={(e) => updateItem('projects', i, 'github', e.target.value)} placeholder="https://github.com/..." />
            <F label="Live URL"     value={p.url}    onChange={(e) => updateItem('projects', i, 'url', e.target.value)}    placeholder="https://..." />
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <F
              label="Description (one bullet per line)"
              value={p.description}
              onChange={(e) => updateItem('projects', i, 'description', e.target.value)}
              placeholder="• Full-stack career document hub with PDF signing, vault, and resume builder..."
              multiline
            />
          </div>
        </ItemRow>
      ))}
      <button
        className="resume-add-btn"
        onClick={() => addItem('projects', { name: '', tech: '', github: '', url: '', description: '' })}
      >
        <Plus size={14} /> Add Project
      </button>
    </Section>
  );
}
