import { useState } from 'react';
import './sections.css';

function splitPreviousCurrent(text) {
  if (!text) return { previous: '', current: '', events: [] };

  const lines = text.split('\n').filter(l => l.trim());
  let previous = '', current = '';
  const events = [];
  let mode = 'events';

  for (const line of lines) {
    if (/previous state|initial state|baseline/i.test(line)) { mode = 'previous'; continue; }
    if (/current state|updated state|current understanding/i.test(line)) { mode = 'current'; continue; }
    if (/transition|milestone|event|key change/i.test(line)) { mode = 'events'; continue; }
    if (mode === 'previous') previous += line + '\n';
    else if (mode === 'current') current += line + '\n';
    else events.push(line.replace(/^[-•*]\s*/, '').trim());
  }

  // Fallback: use full text in current state
  if (!previous && !current) return { previous: '', current: text, events: [] };
  return { previous: previous.trim(), current: current.trim(), events };
}

export default function ContextChanges({ text }) {
  const [open, setOpen] = useState(true);
  const { previous, current, events } = splitPreviousCurrent(text);

  return (
    <div className="section-card" id="section-context-changes">
      <button className="section-card__header" onClick={() => setOpen(v => !v)} aria-expanded={open}>
        <span className="section-card__icon">🔄</span>
        <span className="section-card__title">What Changed Since Last Meeting</span>
        <span className="section-card__chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="section-card__body">
          <div className="timeline">
            {previous && (
              <div className="timeline-event timeline-event--previous">
                <div className="timeline-event__label">Previous State</div>
                <div className="timeline-event__content">{previous}</div>
              </div>
            )}
            {events.map((e, i) => (
              <div key={i} className="timeline-event">
                <div className="timeline-event__label">Event {i + 1}</div>
                <div className="timeline-event__content">{e}</div>
              </div>
            ))}
            <div className="timeline-event timeline-event--current">
              <div className="timeline-event__label">Current State</div>
              <div className="timeline-event__content">{current || text || '—'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

