import { useState } from 'react';
import { extractBullets } from '../../utils/parseBriefingUtils.js';
import './sections.css';

export default function KeyInsights({ text }) {
  const [open, setOpen] = useState(true);
  const bullets = extractBullets(text);
  const insights = bullets.length > 0 ? bullets : (text ? [text] : []);

  return (
    <div className="section-card" id="section-key-insights">
      <button className="section-card__header" onClick={() => setOpen(v => !v)} aria-expanded={open}>
        <span className="section-card__icon">💡</span>
        <span className="section-card__title">What Matters Now</span>
        <span className="section-card__chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="section-card__body">
          <div className="insights-grid">
            {insights.map((insight, i) => {
              const [title, ...rest] = insight.split(':');
              const hasTitle = rest.length > 0 && title.length < 60;
              return (
                <div key={i} className="insight-card">
                  {hasTitle && <div className="insight-card__title">{title.trim()}</div>}
                  <div className="insight-card__body">{hasTitle ? rest.join(':').trim() : insight}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

