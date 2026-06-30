// ============================================
// RESUME SERVICE — localStorage layer
// ============================================

const getKey = (userId) => `cdh_resume_${userId}`;

export const RESUME_DEFAULTS = {
  personal: { name: '', email: '', phone: '', location: '', linkedin: '', github: '', website: '', summary: '' },
  education: [],
  experience: [],
  projects: [],
  skills: { technical: '', soft: '', languages: '', tools: '' },
  certifications: [],
};

export const getResume = (userId) =>
  JSON.parse(localStorage.getItem(getKey(userId)) || JSON.stringify(RESUME_DEFAULTS));

export const saveResume = (userId, resumeData) =>
  localStorage.setItem(getKey(userId), JSON.stringify(resumeData));

export const clearResume = (userId) =>
  localStorage.removeItem(getKey(userId));
