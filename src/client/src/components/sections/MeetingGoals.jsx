import { useState } from 'react';
import './sections.css';

export default function MeetingGoals({ goals }) {
  const [open, setOpen] = useState(true);
  const [checked, setChecked] = useState(() => goals.map(() => false));

  function toggle(i) {
    setChecked(prev => prev.map((v, idx) => idx === i ? !v : v));
  }

  const doneCount = checked.filter(Boolean).length;
  const pct = goals.length > 0 ? Math.round((doneCount / goals.length) * 100) : 0;

  return (
    <div className="section-card" id="section-meeting-goals">
      <button className="section-card__header" onClick={() => setOpen(v => !v)} aria-expanded={open}>
        <span className="section-card__icon">🎯</span>
        <span className="section-card__title">Meeting Goals</span>
        <span className="section-card__chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="section-card__body">
          <div className="goals-list">
            {goals.map((g, i) => (
              <div key={i} className={`goal-item${checked[i] ? ' goal-item--done' : ''}`} onClick={() => toggle(i)}>
                <div className={`goal-checkbox${checked[i] ? ' goal-checkbox--checked' : ''}`}>{checked[i] && '✓'}</div>
                <span className="goal-text">{g}</span>
              </div>
            ))}
          </div>
          {goals.length > 0 && (
            <div className="goals-progress">
              <span>{doneCount} / {goals.length} complete</span>
              <div className="goals-progress-bar">
                <div className="goals-progress-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
