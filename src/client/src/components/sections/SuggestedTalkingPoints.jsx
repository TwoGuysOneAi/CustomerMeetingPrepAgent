import { useState } from 'react';
import { parseTalkingPhases } from '../../utils/parseBriefingUtils.js';
import './sections.css';

export default function SuggestedTalkingPoints({ text }) {
  const [open, setOpen] = useState(true);
  const [expandedPhases, setExpandedPhases] = useState({ 0: true });
  const phases = parseTalkingPhases(text);

  function togglePhase(i) {
    setExpandedPhases(prev => ({ ...prev, [i]: !prev[i] }));
  }

  function copyPhase(content) {
    navigator.clipboard?.writeText(content);
  }

  return (
    <div className="section-card" id="section-talking-points">
      <button className="section-card__header" onClick={() => setOpen(v => !v)} aria-expanded={open}>
        <span className="section-card__icon">🗣️</span>
        <span className="section-card__title">Suggested Talking Points</span>
        <span className="section-card__chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="section-card__body">
          <div className="phases-list">
            {phases.map((phase, i) => (
              <div key={i} className="phase-block">
                <button className="phase-block__header" onClick={() => togglePhase(i)}>
                  <span className="phase-block__label">{phase.label}</span>
                  {phase.time && <span className="phase-block__time">{phase.time}</span>}
                  <button
                    className="phase-block__copy"
                    onClick={e => { e.stopPropagation(); copyPhase(phase.content); }}
                    title="Copy to clipboard"
                  >
                    📋 Copy
                  </button>
                  <span className="section-card__chevron">{expandedPhases[i] ? '▲' : '▼'}</span>
                </button>
                {expandedPhases[i] && (
                  <div className="phase-block__content">{phase.content}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

