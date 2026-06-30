import React from 'react';
import { Wrench } from 'lucide-react';
import { Section, F, isSectionComplete } from './FormFields';

export default function SkillsSection({ data, open, onToggle, setSkills }) {
  return (
    <Section
      id="skills"
      icon={Wrench}
      title="Skills"
      open={open}
      onToggle={onToggle}
      complete={isSectionComplete('skills', data)}
    >
      <div className="resume-fields-grid">
        <F label="Technical Skills"  value={data.skills.technical} onChange={setSkills('technical')} placeholder="React, Java, Python, Spring Boot, SQL..." />
        <F label="Tools & Platforms" value={data.skills.tools}     onChange={setSkills('tools')}     placeholder="Git, Docker, AWS, Figma, Postman..." />
        <F label="Languages"         value={data.skills.languages} onChange={setSkills('languages')} placeholder="Hindi (Native), English (Professional)..." />
        <F label="Soft Skills"       value={data.skills.soft}      onChange={setSkills('soft')}      placeholder="Team leadership, Problem solving, Communication..." />
      </div>
    </Section>
  );
}
