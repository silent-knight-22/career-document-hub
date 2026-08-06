import { STORAGE_KEYS } from '../api/storage/keys';
import { readJson, writeJson } from '../utils/jsonStorage';

const keyFor = (userId) => `${STORAGE_KEYS.RESUME}${userId}`;

export const RESUME_DEFAULTS = {
  personal: {
    name: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    website: '',
    summary: '',
  },
  education: [],
  experience: [],
  projects: [],
  skills: { technical: '', soft: '', languages: '', tools: '' },
  certifications: [],
};

export const getResume = (userId) =>
  readJson(keyFor(userId), structuredClone(RESUME_DEFAULTS));

export const saveResume = (userId, resumeData) => writeJson(keyFor(userId), resumeData);

export const clearResume = (userId) => localStorage.removeItem(keyFor(userId));
