import { useState } from 'react';
import './sections.css';

export default function GapsAndUnknowns({ gaps }) {
  const [open, setOpen] = useState(true);
  const [expanded, setExpanded] = useState({});

  function toggle(i) { setExpanded(prev => ({ ...prev, [i]: !prev[i] })); }

  return (
    <div className="section-card" id="section-gaps">
      <button className="section-card__header" onClick={() => setOpen(v => !v)} aria-expanded={open}>
        <span className="section-card__icon">❓</span>
        <span className="section-card__title">Gaps &amp; Unknowns</span>
        <span className="section-card__chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="section-card__body">
          <div className="gap-list">
            {gaps.map((gap, i) => {
              const q = typeof gap === 'string' ? gap : gap.question ?? '—';
              const why = typeof gap === 'object' ? gap.why_it_matters : null;
              const approach = typeof gap === 'object' ? gap.suggested_approach : null;
              return (
                <div key={i} className="gap-item">
                  <button className="gap-item__trigger" onClick={() => toggle(i)}>
                    <span className="gap-item__badge">Gap {i + 1}</span>
                    <span className="gap-item__text">{q.length > 100 ? q.slice(0, 100) + '…' : q}</span>
                    <span className="gap-item__chevron">{expanded[i] ? '▲' : '▼'}</span>
                  </button>
                  {expanded[i] && (
                    <div className="gap-item__detail">
                      <p><strong>Question:</strong> {q}</p>
                      {why && <p><strong>Why it matters:</strong> {why}</p>}
                      {approach && <p><strong>Suggested approach:</strong> {approach}</p>}
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
