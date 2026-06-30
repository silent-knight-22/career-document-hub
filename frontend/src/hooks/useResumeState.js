import { useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import toast from 'react-hot-toast';
import { getResume, saveResume } from '../services/resumeService';

export default function useResumeState(userId, printRef) {
  const [data, setData] = useState(() => getResume(userId));
  const [openSections, setOpen] = useState({
    personal: true,
    education: true,
    experience: true,
    projects: true,
    skills: true,
    certifications: false
  });
  const [autosaveState, setAutosave] = useState('idle');

  useEffect(() => {
    setAutosave('saving');
    const t = setTimeout(() => {
      try {
        saveResume(userId, data);
        setAutosave('saved');
        setTimeout(() => setAutosave('idle'), 2000);
      } catch (e) {
        setAutosave('idle');
      }
    }, 1500);
    return () => clearTimeout(t);
  }, [data, userId]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `${data.personal.name || 'Resume'}_CV`,
    onAfterPrint: () => toast.success('PDF ready — check your Downloads!'),
  });

  const handleManualSave = () => {
    saveResume(userId, data);
    toast.success('Resume saved!');
    setAutosave('saved');
    setTimeout(() => setAutosave('idle'), 2000);
  };

  const toggleSection = (id) =>
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  const expandAll = () =>
    setOpen({
      personal: true,
      education: true,
      experience: true,
      projects: true,
      skills: true,
      certifications: true
    });

  const collapseAll = () =>
    setOpen({
      personal: false,
      education: false,
      experience: false,
      projects: false,
      skills: false,
      certifications: false
    });

  const setPersonal = (k) => (e) =>
    setData((d) => ({ ...d, personal: { ...d.personal, [k]: e.target.value } }));

  const setSkills = (k) => (e) =>
    setData((d) => ({ ...d, skills: { ...d.skills, [k]: e.target.value } }));

  const addItem = (section, defaults) =>
    setData((d) => ({ ...d, [section]: [...d[section], { ...defaults }] }));

  const updateItem = (section, idx, key, value) =>
    setData((d) => ({
      ...d,
      [section]: d[section].map((item, i) => (i === idx ? { ...item, [key]: value } : item))
    }));

  const removeItem = (section, idx) =>
    setData((d) => ({ ...d, [section]: d[section].filter((_, i) => i !== idx) }));

  return {
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
  };
}
