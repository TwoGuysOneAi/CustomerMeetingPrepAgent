import { useState } from 'react';
import './sections.css';

export default function RisksAndOpportunities({ risks, opportunities }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="section-card" id="section-risks-opportunities">
      <button className="section-card__header" onClick={() => setOpen(v => !v)} aria-expanded={open}>
        <span className="section-card__icon">⚖️</span>
        <span className="section-card__title">Top Risks &amp; Opportunities</span>
        <span className="section-card__chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="section-card__body">
          <div className="risks-opps-grid">
            <div className="risks-col">
              <div className="risks-col__heading">⚠ Risks</div>
              {risks.length > 0
                ? risks.map((r, i) => <div key={i} className="risk-card">{r}</div>)
                : <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>None identified</span>}
            </div>
            <div className="opps-col">
              <div className="opps-col__heading">✦ Opportunities</div>
              {opportunities.length > 0
                ? opportunities.map((o, i) => <div key={i} className="opp-card">{o}</div>)
                : <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>None identified</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
