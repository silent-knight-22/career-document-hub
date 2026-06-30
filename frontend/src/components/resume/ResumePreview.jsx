import React from 'react';

export default function ResumePreview({ data }) {
  const { personal, education, experience, projects, skills, certifications } = data;
  const hasSkill = Object.values(skills).some((v) => v?.trim());

  return (
    <div className="resume-doc">
      {/* Header */}
      <div className="rdoc-header">
        <h1 className="rdoc-name">{personal.name || 'Your Name'}</h1>
        <div className="rdoc-contact">
          {personal.email    && <span>{personal.email}</span>}
          {personal.phone    && <span>{personal.phone}</span>}
          {personal.location && <span>{personal.location}</span>}
          {personal.linkedin && <a href={personal.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>}
          {personal.github   && <a href={personal.github}   target="_blank" rel="noreferrer">GitHub</a>}
          {personal.website  && <a href={personal.website}  target="_blank" rel="noreferrer">Portfolio</a>}
        </div>
        {personal.summary && <p className="rdoc-summary">{personal.summary}</p>}
      </div>

      {/* Education */}
      {education.length > 0 && (
        <div className="rdoc-section">
          <h2 className="rdoc-section-title">Education</h2>
          {education.map((e, i) => (
            <div key={i} className="rdoc-item">
              <div className="rdoc-item-top">
                <div>
                  <p className="rdoc-item-title">
                    {e.degree}{e.field ? ` in ${e.field}` : ''}
                  </p>
                  <p className="rdoc-item-sub">{e.institution}</p>
                </div>
                <div className="rdoc-item-right">
                  {e.gpa && <p className="rdoc-item-gpa">GPA: {e.gpa}</p>}
                  <p className="rdoc-item-date">
                    {e.startYear}{e.endYear ? ` – ${e.endYear}` : ''}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className="rdoc-section">
          <h2 className="rdoc-section-title">Experience</h2>
          {experience.map((e, i) => (
            <div key={i} className="rdoc-item">
              <div className="rdoc-item-top">
                <div>
                  <p className="rdoc-item-title">{e.role}</p>
                  <p className="rdoc-item-sub">
                    {e.company}{e.location ? ` · ${e.location}` : ''}
                  </p>
                </div>
                <p className="rdoc-item-date">
                  {e.startDate}{e.endDate ? ` – ${e.endDate}` : ' – Present'}
                </p>
              </div>
              {e.description && (
                <ul className="rdoc-bullets">
                  {e.description.split('\n').filter(Boolean).map((l, j) => (
                    <li key={j}>{l.startsWith('•') ? l.slice(1).trim() : l}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div className="rdoc-section">
          <h2 className="rdoc-section-title">Projects</h2>
          {projects.map((p, i) => (
            <div key={i} className="rdoc-item">
              <div className="rdoc-item-top">
                <p className="rdoc-item-title">
                  {p.name}
                  {p.tech && <span className="rdoc-item-tech"> · {p.tech}</span>}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {p.github && <a href={p.github} target="_blank" rel="noreferrer" className="rdoc-link">GitHub</a>}
                  {p.url    && <a href={p.url}    target="_blank" rel="noreferrer" className="rdoc-link">Live</a>}
                </div>
              </div>
              {p.description && (
                <ul className="rdoc-bullets">
                  {p.description.split('\n').filter(Boolean).map((l, j) => (
                    <li key={j}>{l.startsWith('•') ? l.slice(1).trim() : l}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {hasSkill && (
        <div className="rdoc-section">
          <h2 className="rdoc-section-title">Skills</h2>
          <div className="rdoc-skills">
            {skills.technical && <p><strong>Technical:</strong> {skills.technical}</p>}
            {skills.tools     && <p><strong>Tools:</strong> {skills.tools}</p>}
            {skills.languages && <p><strong>Languages:</strong> {skills.languages}</p>}
            {skills.soft      && <p><strong>Soft Skills:</strong> {skills.soft}</p>}
          </div>
        </div>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <div className="rdoc-section">
          <h2 className="rdoc-section-title">Certifications</h2>
          {certifications.map((c, i) => (
            <div key={i} className="rdoc-cert-item">
              <p className="rdoc-item-title">{c.name}</p>
              <p className="rdoc-item-sub">{c.issuer}{c.year ? ` · ${c.year}` : ''}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
