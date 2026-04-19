import { useState } from 'react';
import './sections.css';

const TIMEFRAME_MAP = {
  immediate: 'immediate', short_term: 'short', medium_term: 'medium', long_term: 'long',
};
const COLUMNS = [
  { key: 'immediate',  label: 'Immediate',   sub: '0–24h',     mod: 'kanban-col--immediate' },
  { key: 'short_term', label: 'Short-Term',  sub: '1–7 days',  mod: 'kanban-col--short' },
  { key: 'medium_term',label: 'Medium-Term', sub: '8–30 days', mod: 'kanban-col--medium' },
  { key: 'long_term',  label: 'Long-Term',   sub: '30+ days',  mod: 'kanban-col--long' },
];

const PRIORITY_CLASS = { High: 'high', Medium: 'medium', Low: 'low' };

export default function ActionPlan({ actions }) {
  const [open, setOpen] = useState(true);

  // Bucket actions by timeframe
  const cols = { immediate: [], short_term: [], medium_term: [], long_term: [] };
  actions.forEach(a => {
    const tf = typeof a === 'object' ? a.timeframe : null;
    const key = Object.keys(cols).find(k => k === tf) ?? 'immediate';
    cols[key].push(a);
  });

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
                <div className="kanban-col__heading">
                  {col.label}<br />
                  <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>{col.sub}</span>
                </div>
                {cols[col.key].length === 0
                  ? <div className="kanban-empty">No actions</div>
                  : cols[col.key].map((item, i) => {
                      const action = typeof item === 'string' ? item : item.action ?? item;
                      const owner = typeof item === 'object' ? item.owner : null;
                      const priority = typeof item === 'object' ? item.priority : null;
                      return (
                        <div key={i} className="kanban-card">
                          <div>{action}</div>
                          {(owner || priority) && (
                            <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                              {owner && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>👤 {owner}</span>}
                              {priority && (
                                <span className={`badge badge--${PRIORITY_CLASS[priority] ?? 'medium'}`}>{priority}</span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                }
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
