import { useState, useRef, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  askQuestion,
  getChatHistory,
  saveChatHistory,
  clearChatHistory,
  getSuggestedQuestions
} from '../services/groqService';

export default function useChatState(analysis, docId) {
  const [history, setHistory]   = useState(() => getChatHistory(docId));
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  const suggested = getSuggestedQuestions(analysis.document_type);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, loading]);

  const sendMessage = useCallback(async (question) => {
    if (!question.trim() || loading) return;
    const q = question.trim();
    setInput('');
    setLoading(true);

    const userEntry = { question: q, answer: null, ts: Date.now() };
    const newHistory = [...history, userEntry];
    setHistory(newHistory);

    try {
      const answer = await askQuestion(analysis, q, history);
      const finalHistory = newHistory.map((h, i) =>
        i === newHistory.length - 1 ? { ...h, answer } : h
      );
      setHistory(finalHistory);
      saveChatHistory(docId, finalHistory);
    } catch (err) {
      const finalHistory = newHistory.map((h, i) =>
        i === newHistory.length - 1
          ? { ...h, answer: `⚠️ Error: ${err.message}` }
          : h
      );
      setHistory(finalHistory);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [analysis, history, docId, loading]);

  const handleClear = () => {
    clearChatHistory(docId);
    setHistory([]);
    toast.success('Conversation cleared');
  };

  return {
    history,
    input,
    setInput,
    loading,
    sendMessage,
    handleClear,
    suggested,
    bottomRef,
    inputRef
  };
}
