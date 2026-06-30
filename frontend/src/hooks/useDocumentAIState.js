import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  hasApiKey,
  setApiKey,
  analyzeDocument,
  getCachedAnalysis,
  cacheAnalysis,
  clearAnalysis,
  verifyApiKey,
  getSelectedModel
} from '../services/groqService';

export default function useDocumentAIState() {
  const [apiReady, setApiReady]       = useState(hasApiKey());
  const [selectedDoc, setSelected]    = useState(null);
  const [analysisState, setAnaState]  = useState('idle'); // idle | loading | done | error
  const [analysis, setAnalysis]       = useState(null);
  const [progress, setProgress]       = useState(null);
  const [errorMsg, setErrorMsg]       = useState('');
  const [activeTab, setActiveTab]     = useState('summary');
  const [showKeyModal, setKeyModal]   = useState(false);
  const [newKey, setNewKey]           = useState('');
  const [modalKeyError, setModalKeyError] = useState('');
  const [modalSaving, setModalSaving] = useState(false);
  const [selectedModel, setSelectedModelLocal] = useState(getSelectedModel());
  const [docTab, setDocTab]           = useState('vault'); // 'vault' | 'sign'

  const handleSelectDoc = (doc) => {
    setSelected(doc);
    const cached = getCachedAnalysis(doc.id);
    if (cached) {
      setAnalysis(cached);
      setAnaState('done');
      setActiveTab('summary');
    } else {
      setAnalysis(null);
      setAnaState('idle');
    }
  };

  const handleAnalyse = async () => {
    if (!selectedDoc?.dataUrl) {
      toast.error('This document has no attached file. Please upload one first.');
      return;
    }
    setAnaState('loading');
    setProgress({ step: 0, label: 'Starting...' });
    setErrorMsg('');

    try {
      const result = await analyzeDocument(
        selectedDoc.dataUrl,
        (p) => setProgress(p)
      );
      cacheAnalysis(selectedDoc.id, result);
      setAnalysis(result);
      setAnaState('done');
      setActiveTab('summary');
      toast.success('Analysis complete!');
    } catch (err) {
      setAnaState('error');
      setErrorMsg(err.message);
      if (err.message === 'NO_API_KEY') {
        setApiReady(false);
      }
    }
  };

  const handleReanalyse = () => {
    clearAnalysis(selectedDoc.id);
    setAnalysis(null);
    setAnaState('idle');
  };

  const handleSaveKey = async () => {
    if (!newKey.trim()) return;
    setModalSaving(true);
    setModalKeyError('');
    const result = await verifyApiKey(newKey.trim());
    if (!result.ok) {
      setModalSaving(false);
      setModalKeyError(result.error);
      return;
    }
    setApiKey(newKey.trim());
    setApiReady(true);
    setModalSaving(false);
    setKeyModal(false);
    setNewKey('');
    setModalKeyError('');
    setSelectedModelLocal(getSelectedModel());
    toast.success('API key verified and updated!');
  };

  return {
    apiReady,
    setApiReady,
    selectedDoc,
    setSelected,
    analysisState,
    setAnaState,
    analysis,
    setAnalysis,
    progress,
    setProgress,
    errorMsg,
    setErrorMsg,
    activeTab,
    setActiveTab,
    showKeyModal,
    setKeyModal,
    newKey,
    setNewKey,
    modalKeyError,
    setModalKeyError,
    modalSaving,
    setModalSaving,
    selectedModel,
    setSelectedModelLocal,
    docTab,
    setDocTab,
    handleSelectDoc,
    handleAnalyse,
    handleReanalyse,
    handleSaveKey
  };
}
