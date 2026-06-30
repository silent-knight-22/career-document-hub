import React from 'react';
import { Brain, FileText, ChevronRight, Archive, RefreshCw, AlertCircle, CheckCheck, Key } from 'lucide-react';
import Button from '../common/Button/Button';
import { getCachedAnalysis } from '../../services/groqService';

function formatBytes(b) {
  if (!b) return '';
  const k = 1024, i = Math.floor(Math.log(b) / Math.log(k));
  return `${(b / Math.pow(k, i)).toFixed(1)} ${['B','KB','MB'][i]}`;
}

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60)   return 'just now';
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400)return `${Math.floor(s/3600)}h ago`;
  return new Date(ts).toLocaleDateString();
}

export default function DocListPanel({
  docTab,
  setDocTab,
  vaultDocs,
  signDocs,
  allDocs,
  selectedDoc,
  handleSelectDoc,
  analysis,
  analysisState,
  handleAnalyse,
  handleReanalyse,
  errorMsg,
  setKeyModal
}) {
  return (
    <div className="ai-left-panel">
      <div className="ai-left-header">
        <span className="ai-header-title"><Brain size={15} /> AI Document Intelligence</span>
        <button className="ai-key-btn" onClick={() => setKeyModal(true)} title="Manage API key">
          <Key size={13} />
        </button>
      </div>

      <div className="ai-source-tabs">
        <button className={`ai-source-tab ${docTab === 'vault' ? 'active' : ''}`} onClick={() => setDocTab('vault')}>
          <Archive size={13} /> Vault ({vaultDocs.length})
        </button>
        <button className={`ai-source-tab ${docTab === 'sign' ? 'active' : ''}`} onClick={() => setDocTab('sign')}>
          <FileText size={13} /> Documents ({signDocs.length})
        </button>
      </div>

      <div className="ai-doc-list">
        {allDocs.length === 0 ? (
          <p className="ai-no-docs">
            No documents found. Upload documents to your {docTab === 'vault' ? 'Document Vault' : 'Sign Documents'} first.
          </p>
        ) : (
          allDocs.map((doc) => (
            <button key={doc.id} className={`ai-doc-item ${selectedDoc?.id === doc.id ? 'selected' : ''}`} onClick={() => handleSelectDoc(doc)}>
              <div className="ai-doc-item-icon">{doc.type === 'pdf' ? '📄' : '🖼️'}</div>
              <div className="ai-doc-item-info">
                <p className="ai-doc-item-name">{doc.name}</p>
                <p className="ai-doc-item-meta">
                  {formatBytes(doc.size)}
                  {getCachedAnalysis(doc.id) && <span className="ai-analysed-badge">✓ Analysed</span>}
                </p>
              </div>
              <ChevronRight size={13} className="ai-doc-item-arrow" />
            </button>
          ))
        )}
      </div>

      {selectedDoc && (
        <div className="ai-left-actions">
          <div className="ai-selected-doc-card">
            <p className="ai-selected-name">{selectedDoc.name}</p>
            <p className="ai-selected-meta">{formatBytes(selectedDoc.size)}</p>
            {analysis?._cachedAt && (
              <p className="ai-cache-note">
                <CheckCheck size={11} /> Analysed {timeAgo(analysis._cachedAt)}
              </p>
            )}
          </div>

          {analysisState !== 'loading' && (
            <>
              {analysisState !== 'done' ? (
                <Button icon={Brain} onClick={handleAnalyse} style={{ width: '100%' }}>
                  Generate Deep Analysis
                </Button>
              ) : (
                <button className="ai-reanalyse-btn" onClick={handleReanalyse}>
                  <RefreshCw size={13} /> Re-analyse document
                </button>
              )}
            </>
          )}

          {analysisState === 'error' && (
            <div className="ai-error-box">
              <AlertCircle size={14} />
              <p>{errorMsg}</p>
              {errorMsg.includes('key') && <button onClick={() => setKeyModal(true)}>Update API key</button>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
