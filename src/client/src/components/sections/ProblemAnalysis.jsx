import { useState } from 'react';
import './sections.css';

export default function ProblemAnalysis({ summaryText, mappingText }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="section-card" id="section-problem-analysis">
      <button className="section-card__header" onClick={() => setOpen(v => !v)} aria-expanded={open}>
        <span className="section-card__icon">🔍</span>
        <span className="section-card__title">Problem Analysis</span>
        <span className="section-card__chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="section-card__body">
          <div className="flow-diagram">
            <div className="flow-node">
              <div className="flow-node__label">Problem Summary</div>
              <div className="flow-node__content">{summaryText || '—'}</div>
            </div>
            {mappingText && (
              <>
                <div className="flow-arrow">↓</div>
                <div className="flow-node">
                  <div className="flow-node__label">Context Mapping</div>
                  <div className="flow-node__content">{mappingText}</div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

