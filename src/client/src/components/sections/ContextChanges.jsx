import { useState } from 'react';
import './sections.css';

export default function ContextChanges({ data }) {
  const [open, setOpen] = useState(true);
  const { previous_state, current_state, key_events = [] } = data;

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
            {previous_state && (
              <div className="timeline-event timeline-event--previous">
                <div className="timeline-event__label">Previous State</div>
                <div className="timeline-event__content">{previous_state}</div>
              </div>
            )}
            {key_events.map((e, i) => (
              <div key={i} className="timeline-event">
                <div className="timeline-event__label">Event {i + 1}</div>
                <div className="timeline-event__content">{e}</div>
              </div>
            ))}
            {current_state && (
              <div className="timeline-event timeline-event--current">
                <div className="timeline-event__label">Current State</div>
                <div className="timeline-event__content">{current_state}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
