import { useRef } from 'react';
import { Save, Download, Check, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar/Navbar';
import Sidebar from '../components/layout/Sidebar/Sidebar';
import Button from '../components/common/Button/Button';
import ResumePreview from '../components/resume/ResumePreview';
import PersonalSection from '../components/resume/PersonalSection';
import EducationSection from '../components/resume/EducationSection';
import ExperienceSection from '../components/resume/ExperienceSection';
import ProjectsSection from '../components/resume/ProjectsSection';
import SkillsSection from '../components/resume/SkillsSection';
import CertificationsSection from '../components/resume/CertificationsSection';
import useResumeState from '../hooks/useResumeState';
import './Resume.css';export default function ResumeBuilder() {
  const { user } = useAuth();
  const printRef = useRef(null);
  const {
    data,
    openSections,
    autosaveState,
    handlePrint,
    handleManualSave,
    toggleSection,
    expandAll,
    collapseAll,
    setPersonal,
    setSkills,
    addItem,
    updateItem,
    removeItem
  } = useResumeState(user?.userId || '', printRef);
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
              {autosaveState === 'saved' ? <Check size={12} /> : <Clock size={12} />}
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
              <PersonalSection data={data} open={openSections.personal} onToggle={toggleSection} setPersonal={setPersonal} />
              <EducationSection data={data} open={openSections.education} onToggle={toggleSection} addItem={addItem} updateItem={updateItem} removeItem={removeItem} />
              <ExperienceSection data={data} open={openSections.experience} onToggle={toggleSection} addItem={addItem} updateItem={updateItem} removeItem={removeItem} />
              <ProjectsSection data={data} open={openSections.projects} onToggle={toggleSection} addItem={addItem} updateItem={updateItem} removeItem={removeItem} />
              <SkillsSection data={data} open={openSections.skills} onToggle={toggleSection} setSkills={setSkills} />
              <CertificationsSection data={data} open={openSections.certifications} onToggle={toggleSection} addItem={addItem} updateItem={updateItem} removeItem={removeItem} />
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
