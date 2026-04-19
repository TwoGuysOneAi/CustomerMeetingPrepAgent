import { useState } from 'react';
import './sections.css';

export default function SuggestedTalkingPoints({ phases }) {
  const [open, setOpen] = useState(true);
  const [expandedPhases, setExpandedPhases] = useState({ 0: true });

  function togglePhase(i) { setExpandedPhases(prev => ({ ...prev, [i]: !prev[i] })); }

  function copyPhase(phase) {
    const text = [
      phase.objective && `Objective: ${phase.objective}`,
      phase.key_messages?.length && `Key messages:\n${phase.key_messages.map(m => `- ${m}`).join('\n')}`,
      phase.suggested_phrasing && `Suggested phrasing: ${phase.suggested_phrasing}`,
    ].filter(Boolean).join('\n\n');
    navigator.clipboard?.writeText(text);
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
            {phases.map((phase, i) => {
              const label = typeof phase === 'string' ? `Phase ${i + 1}` : (phase.phase ?? `Phase ${i + 1}`);
              const timeRange = typeof phase === 'object' ? phase.time_range : null;
              const objective = typeof phase === 'object' ? phase.objective : null;
              const keyMessages = typeof phase === 'object' ? (phase.key_messages ?? []) : [];
              const phrasing = typeof phase === 'object' ? phase.suggested_phrasing : null;

              return (
                <div key={i} className="phase-block">
                  <div
                    className="phase-block__header"
                    onClick={() => togglePhase(i)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && togglePhase(i)}
                  >
                    <span className="phase-block__label">{label}</span>
                    {timeRange && <span className="phase-block__time">{timeRange}</span>}
                    <button
                      className="phase-block__copy"
                      onClick={e => { e.stopPropagation(); copyPhase(phase); }}
                      title="Copy to clipboard"
                    >
                      📋 Copy
                    </button>
                    <span className="section-card__chevron">{expandedPhases[i] ? '▲' : '▼'}</span>
                  </div>
                  {expandedPhases[i] && (
                    <div className="phase-block__content">
                      {objective && <p><strong>Objective:</strong> {objective}</p>}
                      {keyMessages.length > 0 && (
                        <div>
                          <strong>Key messages:</strong>
                          <ul style={{ margin: '6px 0 0 0', paddingLeft: 18 }}>
                            {keyMessages.map((m, j) => <li key={j}>{m}</li>)}
                          </ul>
                        </div>
                      )}
                      {phrasing && <p style={{ marginTop: 10 }}><strong>Suggested phrasing:</strong> "{phrasing}"</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
