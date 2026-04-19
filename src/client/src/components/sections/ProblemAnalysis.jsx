import { useState } from 'react';
import './sections.css';

export default function ProblemAnalysis({ summary, mapping }) {
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
              <div className="flow-node__content">{summary}</div>
            </div>
            {mapping.length > 0 && (
              <>
                <div className="flow-arrow">↓</div>
                <div className="flow-node">
                  <div className="flow-node__label">Context Mapping</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {mapping.map((item, i) => {
                      const source = typeof item === 'string' ? item : item.context_source ?? `Source ${i + 1}`;
                      const relevance = typeof item === 'object' ? item.relevance : null;
                      return (
                        <div key={i} style={{ paddingBottom: i < mapping.length - 1 ? 10 : 0, borderBottom: i < mapping.length - 1 ? '1px solid var(--border)' : 'none' }}>
                          <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 3 }}>{source}</div>
                          {relevance && <div className="flow-node__content">{relevance}</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
