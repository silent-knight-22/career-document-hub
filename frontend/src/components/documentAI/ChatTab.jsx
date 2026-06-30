import React from 'react';
import { Send, Brain, Copy, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useChatState from '../../hooks/useChatState';

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => toast.success('Copied!'));
}

export default function ChatTab({ analysis, docId }) {
  const {
    history,
    input,
    setInput,
    loading,
    sendMessage,
    handleClear,
    suggested,
    bottomRef,
    inputRef
  } = useChatState(analysis, docId);

  const formatAnswer = (text) => {
    if (!text) return text;
    const parts = text.split(/(📍 Source:[^\n]+)/g);
    return parts.map((p, i) =>
      p.startsWith('📍 Source:')
        ? <span key={i} className="ai-chat-source">{p}</span>
        : <span key={i}>{p}</span>
    );
  };

  return (
    <div className="ai-chat-wrap">
      {history.length === 0 && (
        <div className="ai-suggested-wrap">
          <p className="ai-suggested-label">Suggested questions:</p>
          <div className="ai-suggested-chips">
            {suggested.slice(0, 6).map((q, i) => (
              <button key={i} className="ai-suggested-chip" onClick={() => sendMessage(q)}>
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="ai-chat-messages">
        {history.map((h, i) => (
          <div key={i} className="ai-chat-turn">
            <div className="ai-chat-user">
              <span className="ai-chat-user-bubble">{h.question}</span>
            </div>
            {h.answer !== null ? (
              <div className="ai-chat-ai">
                <div className="ai-chat-ai-icon"><Brain size={14} /></div>
                <div className="ai-chat-ai-bubble">
                  <div className="ai-chat-ai-text">{formatAnswer(h.answer)}</div>
                  <button className="ai-chat-copy" onClick={() => copyToClipboard(h.answer)} title="Copy answer">
                    <Copy size={11} />
                  </button>
                </div>
              </div>
            ) : loading && i === history.length - 1 ? (
              <div className="ai-chat-ai">
                <div className="ai-chat-ai-icon"><Brain size={14} /></div>
                <div className="ai-chat-thinking">
                  <span /><span /><span />
                </div>
              </div>
            ) : null}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="ai-chat-input-wrap">
        {history.length > 0 && (
          <button className="ai-chat-clear" onClick={handleClear} title="Clear conversation">
            <X size={13} /> Clear
          </button>
        )}
        {history.length > 0 && (
          <div className="ai-suggested-chips ai-chat-followup">
            {suggested.slice(0, 4).map((q, i) => (
              <button key={i} className="ai-suggested-chip sm" onClick={() => sendMessage(q)}>
                {q}
              </button>
            ))}
          </div>
        )}
        <div className="ai-chat-input-row">
          <textarea
            ref={inputRef}
            className="ai-chat-input"
            placeholder="Ask anything about this document..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            rows={2}
            disabled={loading}
          />
          <button className="ai-chat-send" onClick={() => sendMessage(input)} disabled={loading || !input.trim()}>
            {loading ? <Loader2 size={18} className="ai-spin" /> : <Send size={18} />}
          </button>
        </div>
        <p className="ai-chat-hint">Enter to send · Shift+Enter for new line · Answers always include source citations</p>
      </div>
    </div>
  );
}
