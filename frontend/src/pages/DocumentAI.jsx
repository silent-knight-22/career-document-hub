import React from 'react';
import { Brain, Sparkles, MessageSquare, BookOpen, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getVaultItems } from '../services/vaultService';
import { getDocuments } from '../services/documentService';
import {
  getAvailableModels,
  clearApiKey,
  setSelectedModel,
  getAnalysedDocIdSet,
} from '../services/groqService';
import { useLocalSnapshot } from '../hooks/useLocalSnapshot';
import PageLayout from '../components/layout/PageLayout/PageLayout';
import ApiKeySetup from '../components/documentAI/ApiKeySetup';
import AnalysisSkeleton from '../components/documentAI/AnalysisSkeleton';
import SummaryTab from '../components/documentAI/SummaryTab';
import InsightsTab from '../components/documentAI/InsightsTab';
import ChatTab from '../components/documentAI/ChatTab';
import ApiKeyModal from '../components/documentAI/ApiKeyModal';
import DocListPanel from '../components/documentAI/DocListPanel';
import useDocumentAIState from '../hooks/useDocumentAIState';
import './DocumentAI.css';

const AI_TABS = [
  { id: 'summary', label: 'Summary', icon: BookOpen },
  { id: 'insights', label: 'Insights', icon: Sparkles },
  { id: 'chat', label: 'Chat Q&A', icon: MessageSquare },
];

const EMPTY_FEATURES = [
  'Comprehensive section summaries',
  'Source-cited key points',
  'Legal restriction extraction',
  'Risk & penalty detection',
  'Financial info extraction',
  'Natural language Q&A',
];

export default function DocumentAI() {
  const { user } = useAuth();
  const userId = user?.userId || '';
  const availableModels = useLocalSnapshot(() => getAvailableModels(), userId);
  const {
    apiReady,
    setApiReady,
    selectedDoc,
    analysisState,
    analysis,
    progress,
    errorMsg,
    activeTab,
    setActiveTab,
    showKeyModal,
    setKeyModal,
    newKey,
    setNewKey,
    modalKeyError,
    setModalKeyError,
    modalSaving,
    selectedModel,
    setSelectedModelLocal,
    docTab,
    setDocTab,
    handleSelectDoc,
    handleAnalyse,
    handleReanalyse,
    handleSaveKey,
  } = useDocumentAIState();

  const vaultDocs = useLocalSnapshot(() => getVaultItems(userId), userId);
  const signDocs = useLocalSnapshot(
    () => getDocuments(userId).filter((d) => d.dataUrl),
    userId,
  );
  const allDocs = docTab === 'vault' ? vaultDocs : signDocs;

  // Re-read analysis badges when docs change or a new analysis is cached/cleared
  const analysedIds = useLocalSnapshot(() => {
    const ids = [...getVaultItems(userId), ...getDocuments(userId).filter((d) => d.dataUrl)].map(
      (d) => d.id,
    );
    return getAnalysedDocIdSet(ids);
  }, `${userId}:${analysisState}:${analysis?._cachedAt ?? ''}`);

  if (!apiReady) {
    return (
      <PageLayout title="AI Insights">
        <ApiKeySetup onSaved={() => setApiReady(true)} />
      </PageLayout>
    );
  }

  return (
    <PageLayout title="AI Insights" className="ai-page-layout">
      <DocListPanel
        docTab={docTab}
        setDocTab={setDocTab}
        vaultDocs={vaultDocs}
        signDocs={signDocs}
        allDocs={allDocs}
        analysedIds={analysedIds}
        selectedDoc={selectedDoc}
        handleSelectDoc={handleSelectDoc}
        analysis={analysis}
        analysisState={analysisState}
        handleAnalyse={handleAnalyse}
        handleReanalyse={handleReanalyse}
        errorMsg={errorMsg}
        setKeyModal={setKeyModal}
      />
      <div className="ai-right-panel">
        {!selectedDoc && (
          <div className="ai-empty-state">
            <div className="ai-empty-icon animate-float"><Brain size={40} /></div>
            <h3>Select a document to analyse</h3>
            <p>
              Choose any document from your Vault or Sign Documents.
              Groq will perform a deep, section-by-section analysis —
              extracting all dates, obligations, risks, benefits, and legal restrictions
              with source citations.
            </p>
            <div className="ai-empty-features">
              {EMPTY_FEATURES.map((f) => (
                <span key={f} className="ai-empty-feature"><CheckCircle2 size={13} /> {f}</span>
              ))}
            </div>
          </div>
        )}
        {selectedDoc && analysisState === 'idle' && (
          <div className="ai-empty-state">
            <div className="ai-empty-icon"><Sparkles size={36} /></div>
            <h3>Ready to analyse</h3>
            <p>
              Click <strong>Generate Deep Analysis</strong> to start.
              The AI will read the full document and produce a comprehensive
              section-wise analysis with source citations for every finding.
            </p>
          </div>
        )}
        {selectedDoc && analysisState === 'loading' && <AnalysisSkeleton step={progress} />}
        {selectedDoc && analysisState === 'done' && analysis && (
          <>
            <div className="ai-tabs">
              {AI_TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  className={`ai-tab ${activeTab === id ? 'active' : ''}`}
                  onClick={() => setActiveTab(id)}
                >
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>
            <div className="ai-tab-scroll">
              {activeTab === 'summary' && <SummaryTab analysis={analysis} />}
              {activeTab === 'insights' && <InsightsTab analysis={analysis} />}
              {activeTab === 'chat' && <ChatTab analysis={analysis} docId={selectedDoc.id} />}
            </div>
          </>
        )}
      </div>
      <ApiKeyModal
        show={showKeyModal}
        onClose={() => { setKeyModal(false); setModalKeyError(''); }}
        newKey={newKey}
        setNewKey={setNewKey}
        modalKeyError={modalKeyError}
        setModalKeyError={setModalKeyError}
        modalSaving={modalSaving}
        handleSaveKey={handleSaveKey}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        setSelectedModelLocal={setSelectedModelLocal}
        availableModels={availableModels}
        clearApiKey={clearApiKey}
        setApiReady={setApiReady}
      />
    </PageLayout>
  );
}
