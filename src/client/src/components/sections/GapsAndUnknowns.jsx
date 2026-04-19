import { useState } from 'react';
import { extractBullets } from '../../utils/parseBriefingUtils.js';
import './sections.css';

export default function GapsAndUnknowns({ text }) {
  const [open, setOpen] = useState(true);
  const [expanded, setExpanded] = useState({});
  const items = extractBullets(text);
  const questions = items.length > 0 ? items : (text ? [text] : []);

  function toggle(i) {
    setExpanded(prev => ({ ...prev, [i]: !prev[i] }));
  }

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
            {questions.map((q, i) => (
              <div key={i} className="gap-item">
                <button className="gap-item__trigger" onClick={() => toggle(i)}>
                  <span className="gap-item__badge">Gap {i + 1}</span>
                  <span className="gap-item__text">{q.length > 100 ? q.slice(0, 100) + '…' : q}</span>
                  <span className="gap-item__chevron">{expanded[i] ? '▲' : '▼'}</span>
                </button>
                {expanded[i] && (
                  <div className="gap-item__detail">{q}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

