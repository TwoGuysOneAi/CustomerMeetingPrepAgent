import { useState } from 'react';
import './sections.css';

export default function KeyInsights({ data }) {
  const [open, setOpen] = useState(true);
  const { headline, detail } = data;

  return (
    <div className="section-card" id="section-key-insights">
      <button className="section-card__header" onClick={() => setOpen(v => !v)} aria-expanded={open}>
        <span className="section-card__icon">💡</span>
        <span className="section-card__title">What Matters Now</span>
        <span className="section-card__chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="section-card__body">
          {headline && (
            <div className="insight-card">
              <div className="insight-card__title">{headline}</div>
              {detail && <div className="insight-card__body">{detail}</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
