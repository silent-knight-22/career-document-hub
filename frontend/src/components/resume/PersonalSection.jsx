import React from 'react';
import { User } from 'lucide-react';
import { Section, F, isSectionComplete } from './FormFields';

export default function PersonalSection({ data, open, onToggle, setPersonal }) {
  return (
    <Section
      id="personal"
      icon={User}
      title="Personal Info"
      open={open}
      onToggle={onToggle}
      complete={isSectionComplete('personal', data)}
    >
      <div className="resume-fields-grid">
        <F label="Full Name *"   value={data.personal.name}     onChange={setPersonal('name')}     placeholder="Preeti Tewatia" />
        <F label="Email *"       value={data.personal.email}    onChange={setPersonal('email')}    placeholder="you@example.com" type="email" />
        <F label="Phone"         value={data.personal.phone}    onChange={setPersonal('phone')}    placeholder="+91 98765 43210" />
        <F label="Location"      value={data.personal.location} onChange={setPersonal('location')} placeholder="Bengaluru, India" />
        <F label="LinkedIn URL"  value={data.personal.linkedin} onChange={setPersonal('linkedin')} placeholder="https://linkedin.com/in/..." />
        <F label="GitHub URL"    value={data.personal.github}   onChange={setPersonal('github')}   placeholder="https://github.com/..." />
        <F label="Portfolio URL" value={data.personal.website}  onChange={setPersonal('website')}  placeholder="https://yoursite.com" />
      </div>
      <F
        label="Professional Summary"
        value={data.personal.summary}
        onChange={setPersonal('summary')}
        placeholder="Passionate B.Tech student with experience in full-stack development..."
        multiline
      />
    </Section>
  );
}
