import React from 'react';
import { Brain, CheckCheck } from 'lucide-react';

export default function AnalysisSkeleton({ step }) {
  const steps = [
    'Preparing document...',
    'Sending to Groq 1.5 Flash...',
    'Running deep analysis...',
    'Parsing results...',
    'Done!',
  ];
  return (
    <div className="ai-skeleton-wrap">
      <div className="ai-skeleton-spinner">
        <Brain size={28} className="ai-brain-pulse" />
      </div>
      <p className="ai-skeleton-step">{step?.label || 'Analysing document...'}</p>
      <p className="ai-skeleton-hint">
        Groq is performing a comprehensive analysis — extracting all sections, entities, dates, and risks.
        This takes 10–30 seconds for complex documents.
      </p>
      <div className="ai-skeleton-bars">
        {[100, 80, 60, 90, 70].map((w, i) => (
          <div key={i} className="ai-skeleton-bar" style={{ width: `${w}%`, animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
      <div className="ai-progress-steps">
        {steps.map((s, i) => (
          <div
            key={i}
            className={`ai-progress-step ${(step?.step || 0) > i ? 'done' : (step?.step || 0) === i ? 'active' : ''}`}
          >
            {(step?.step || 0) > i ? <CheckCheck size={12} /> : <span>{i + 1}</span>}
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}
