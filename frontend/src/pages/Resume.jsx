import { useState, useEffect, useRef, useCallback } from 'react';
import { useReactToPrint } from 'react-to-print';
import {
  User, GraduationCap, Briefcase, FolderGit2,
  Wrench, Award, Plus, Trash2, Save, Download,
  ChevronDown, ChevronUp, Check, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getResume, saveResume, RESUME_DEFAULTS } from '../services/resumeService';
import Navbar from '../components/layout/Navbar/Navbar';
import Sidebar from '../components/layout/Sidebar/Sidebar';
import Button from '../components/common/Button/Button';
import './Resume.css';

// ── Section list (drives accordion order) ─────────────────────
const SECTIONS = ['personal', 'education', 'experience', 'projects', 'skills', 'certifications'];

// ── Helpers ───────────────────────────────────────────────────

/** Returns true if a section has at least one non-empty value */
function isSectionComplete(section, data) {
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

// ── Section accordion ─────────────────────────────────────────
function Section({ id, icon: Icon, title, open, onToggle, complete, children }) {
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

// ── Repeatable item row ───────────────────────────────────────
function ItemRow({ children, onDelete }) {
  return (
    <div className="resume-item-row">
      <div className="resume-item-fields">{children}</div>
      <button className="resume-item-delete" onClick={onDelete} title="Remove entry">
        <Trash2 size={14} />
      </button>
    </div>
  );
}

// ── Field ─────────────────────────────────────────────────────
function F({ label, value, onChange, placeholder, multiline, type = 'text' }) {
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

// ── Live preview (printable) ──────────────────────────────────
const ResumePreview = ({ data }) => {
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
};

// ════════════════════════════════════════════════════════════════
// Main Resume Builder
// ════════════════════════════════════════════════════════════════
export default function ResumeBuilder() {
  const { user } = useAuth();
  const printRef = useRef(null);

  const [data, setData]           = useState(() => getResume(user?.userId || ''));
  const [openSections, setOpen]   = useState({ personal: true, education: true, experience: true, projects: true, skills: true, certifications: false });
  const [autosaveState, setAutosave] = useState('idle'); // 'idle' | 'saving' | 'saved'

  // ── Autosave: debounced, fires 1.5s after last keystroke ──
  useEffect(() => {
    setAutosave('saving');
    const t = setTimeout(() => {
      try {
        saveResume(user?.userId || '', data);
        setAutosave('saved');
        setTimeout(() => setAutosave('idle'), 2000);
      } catch (e) {
        setAutosave('idle');
      }
    }, 1500);
    return () => clearTimeout(t);
  }, [data]);

  // ── Print / PDF ──
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `${data.personal.name || 'Resume'}_CV`,
    onAfterPrint: () => toast.success('PDF ready — check your Downloads!'),
  });

  // ── Manual save ──
  const handleManualSave = () => {
    saveResume(user?.userId || '', data);
    toast.success('Resume saved!');
    setAutosave('saved');
    setTimeout(() => setAutosave('idle'), 2000);
  };

  // ── Accordion toggle ──
  const toggleSection = (id) =>
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  const expandAll  = () => setOpen(Object.fromEntries(SECTIONS.map((s) => [s, true])));
  const collapseAll = () => setOpen(Object.fromEntries(SECTIONS.map((s) => [s, false])));

  // ── State helpers ──
  const setPersonal = (k) => (e) =>
    setData((d) => ({ ...d, personal: { ...d.personal, [k]: e.target.value } }));

  const setSkills = (k) => (e) =>
    setData((d) => ({ ...d, skills: { ...d.skills, [k]: e.target.value } }));

  const addItem = (section, defaults) =>
    setData((d) => ({ ...d, [section]: [...d[section], { ...defaults }] }));

  const updateItem = (section, idx, key, value) =>
    setData((d) => ({
      ...d,
      [section]: d[section].map((item, i) =>
        i === idx ? { ...item, [key]: value } : item
      ),
    }));

  const removeItem = (section, idx) =>
    setData((d) => ({ ...d, [section]: d[section].filter((_, i) => i !== idx) }));

  // ── Autosave indicator label ──
  const autosaveLabel =
    autosaveState === 'saving' ? 'Saving...' :
    autosaveState === 'saved'  ? 'All changes saved' :
    'Changes will autosave';

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Navbar title="Resume Builder" />

        <div className="resume-builder-layout">

          {/* ── LEFT: Form Panel ── */}
          <div className="resume-form-panel">

            <div className="resume-form-header">
              <p className="resume-form-hint">
                Fill in your details — the preview updates live.
              </p>
              <div className="resume-form-actions">
                <Button variant="secondary" size="sm" icon={Save} onClick={handleManualSave}>
                  Save
                </Button>
                <Button size="sm" icon={Download} onClick={handlePrint}>
                  PDF
                </Button>
              </div>
            </div>

            {/* Autosave status */}
            <div className={`resume-autosave-indicator ${autosaveState === 'saved' ? 'saved' : ''}`}>
              {autosaveState === 'saved'
                ? <Check size={12} />
                : <Clock size={12} />
              }
              {autosaveLabel}
            </div>

            {/* Expand / Collapse all */}
            <div className="resume-expand-controls" style={{ paddingLeft: '0.75rem', paddingRight: '0.75rem' }}>
              <button className="resume-expand-btn" onClick={expandAll}>Expand all</button>
              <span style={{ color: 'var(--text-tertiary)', fontSize: '0.72rem' }}>·</span>
              <button className="resume-expand-btn" onClick={collapseAll}>Collapse all</button>
            </div>

            {/* Scrollable sections */}
            <div className="resume-form-sections">

              {/* Personal Info */}
              <Section id="personal" icon={User} title="Personal Info"
                open={openSections.personal} onToggle={toggleSection}
                complete={isSectionComplete('personal', data)}>
                <div className="resume-fields-grid">
                  <F label="Full Name *"   value={data.personal.name}     onChange={setPersonal('name')}     placeholder="Preeti Tewatia" />
                  <F label="Email *"       value={data.personal.email}    onChange={setPersonal('email')}    placeholder="you@example.com" type="email" />
                  <F label="Phone"         value={data.personal.phone}    onChange={setPersonal('phone')}    placeholder="+91 98765 43210" />
                  <F label="Location"      value={data.personal.location} onChange={setPersonal('location')} placeholder="Bengaluru, India" />
                  <F label="LinkedIn URL"  value={data.personal.linkedin} onChange={setPersonal('linkedin')} placeholder="https://linkedin.com/in/..." />
                  <F label="GitHub URL"    value={data.personal.github}   onChange={setPersonal('github')}   placeholder="https://github.com/..." />
                  <F label="Portfolio URL" value={data.personal.website}  onChange={setPersonal('website')}  placeholder="https://yoursite.com" />
                </div>
                <F label="Professional Summary"
                  value={data.personal.summary}
                  onChange={setPersonal('summary')}
                  placeholder="Passionate B.Tech student with experience in full-stack development..."
                  multiline />
              </Section>

              {/* Education */}
              <Section id="education" icon={GraduationCap} title="Education"
                open={openSections.education} onToggle={toggleSection}
                complete={isSectionComplete('education', data)}>
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
                <button className="resume-add-btn"
                  onClick={() => addItem('education', { degree:'', field:'', institution:'', gpa:'', startYear:'', endYear:'' })}>
                  <Plus size={14} /> Add Education
                </button>
              </Section>

              {/* Experience */}
              <Section id="experience" icon={Briefcase} title="Experience"
                open={openSections.experience} onToggle={toggleSection}
                complete={isSectionComplete('experience', data)}>
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
                      <F label="Responsibilities (one per line, start with •)"
                        value={ex.description}
                        onChange={(e) => updateItem('experience', i, 'description', e.target.value)}
                        placeholder="• Built a feature that improved load time by 30%..."
                        multiline />
                    </div>
                  </ItemRow>
                ))}
                <button className="resume-add-btn"
                  onClick={() => addItem('experience', { role:'', company:'', location:'', startDate:'', endDate:'', description:'' })}>
                  <Plus size={14} /> Add Experience
                </button>
              </Section>

              {/* Projects */}
              <Section id="projects" icon={FolderGit2} title="Projects"
                open={openSections.projects} onToggle={toggleSection}
                complete={isSectionComplete('projects', data)}>
                {data.projects.map((p, i) => (
                  <ItemRow key={i} onDelete={() => removeItem('projects', i)}>
                    <div className="resume-fields-grid-4">
                      <F label="Project Name" value={p.name}   onChange={(e) => updateItem('projects', i, 'name', e.target.value)}   placeholder="Career Document Hub" />
                      <F label="Tech Stack"   value={p.tech}   onChange={(e) => updateItem('projects', i, 'tech', e.target.value)}   placeholder="React, Spring Boot, Redis" />
                      <F label="GitHub URL"   value={p.github} onChange={(e) => updateItem('projects', i, 'github', e.target.value)} placeholder="https://github.com/..." />
                      <F label="Live URL"     value={p.url}    onChange={(e) => updateItem('projects', i, 'url', e.target.value)}    placeholder="https://..." />
                    </div>
                    <div style={{ marginTop: '0.5rem' }}>
                      <F label="Description (one bullet per line)"
                        value={p.description}
                        onChange={(e) => updateItem('projects', i, 'description', e.target.value)}
                        placeholder="• Full-stack career document hub with PDF signing, vault, and resume builder..."
                        multiline />
                    </div>
                  </ItemRow>
                ))}
                <button className="resume-add-btn"
                  onClick={() => addItem('projects', { name:'', tech:'', github:'', url:'', description:'' })}>
                  <Plus size={14} /> Add Project
                </button>
              </Section>

              {/* Skills */}
              <Section id="skills" icon={Wrench} title="Skills"
                open={openSections.skills} onToggle={toggleSection}
                complete={isSectionComplete('skills', data)}>
                <div className="resume-fields-grid">
                  <F label="Technical Skills"  value={data.skills.technical} onChange={setSkills('technical')} placeholder="React, Java, Python, Spring Boot, SQL..." />
                  <F label="Tools & Platforms" value={data.skills.tools}     onChange={setSkills('tools')}     placeholder="Git, Docker, AWS, Figma, Postman..." />
                  <F label="Languages"         value={data.skills.languages} onChange={setSkills('languages')} placeholder="Hindi (Native), English (Professional)..." />
                  <F label="Soft Skills"       value={data.skills.soft}      onChange={setSkills('soft')}      placeholder="Team leadership, Problem solving, Communication..." />
                </div>
              </Section>

              {/* Certifications */}
              <Section id="certifications" icon={Award} title="Certifications"
                open={openSections.certifications} onToggle={toggleSection}
                complete={isSectionComplete('certifications', data)}>
                {data.certifications.map((c, i) => (
                  <ItemRow key={i} onDelete={() => removeItem('certifications', i)}>
                    <div className="resume-fields-grid-4">
                      <F label="Certificate" value={c.name}   onChange={(e) => updateItem('certifications', i, 'name', e.target.value)}   placeholder="AWS Cloud Practitioner" />
                      <F label="Issuer"      value={c.issuer} onChange={(e) => updateItem('certifications', i, 'issuer', e.target.value)} placeholder="Amazon Web Services" />
                      <F label="Year"        value={c.year}   onChange={(e) => updateItem('certifications', i, 'year', e.target.value)}   placeholder="2024" />
                    </div>
                  </ItemRow>
                ))}
                <button className="resume-add-btn"
                  onClick={() => addItem('certifications', { name:'', issuer:'', year:'' })}>
                  <Plus size={14} /> Add Certification
                </button>
              </Section>

              {/* Bottom padding so last section isn't cut off */}
              <div style={{ height: '1rem', flexShrink: 0 }} />

            </div>
          </div>

          {/* ── RIGHT: Preview Panel ── */}
          <div className="resume-preview-panel">
            <div className="resume-preview-header">
              <p className="resume-preview-label">Live Preview</p>
              <Button size="sm" icon={Download} onClick={handlePrint}>Download PDF</Button>
            </div>
            <div className="resume-preview-scroll">
              {/* printRef wraps only the white resume doc */}
              <div ref={printRef} className="resume-preview-wrapper">
                <ResumePreview data={data} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
