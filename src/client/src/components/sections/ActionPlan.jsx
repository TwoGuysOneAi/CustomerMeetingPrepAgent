import { useState } from 'react';
import { parseActionColumns } from '../../utils/parseBriefingUtils.js';
import './sections.css';

const COLUMNS = [
  { key: 'immediate', label: 'Immediate',   sub: '0–24h',     mod: 'kanban-col--immediate' },
  { key: 'shortTerm', label: 'Short-Term',  sub: '1–7 days',  mod: 'kanban-col--short' },
  { key: 'mediumTerm',label: 'Medium-Term', sub: '8–30 days', mod: 'kanban-col--medium' },
  { key: 'longTerm',  label: 'Long-Term',   sub: '30+ days',  mod: 'kanban-col--long' },
];

export default function ActionPlan({ text }) {
  const [open, setOpen] = useState(true);
  const cols = parseActionColumns(text);

  return (
    <div className="section-card" id="section-action-plan">
      <button className="section-card__header" onClick={() => setOpen(v => !v)} aria-expanded={open}>
        <span className="section-card__icon">📋</span>
        <span className="section-card__title">Recommended Next Actions</span>
        <span className="section-card__chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="section-card__body">
          <div className="kanban-board">
            {COLUMNS.map(col => (
              <div key={col.key} className={`kanban-col ${col.mod}`}>
                <div className="kanban-col__heading">{col.label}<br /><span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>{col.sub}</span></div>
                {cols[col.key].length === 0
                  ? <div className="kanban-empty">No actions</div>
                  : cols[col.key].map((item, i) => (
                      <div key={i} className="kanban-card">{item}</div>
                    ))
                }
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

