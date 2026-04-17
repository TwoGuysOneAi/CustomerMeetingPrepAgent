import { useState } from 'react';
import './BriefingSection.css';

/**
 * @param {{ icon: string, title: string, children: React.ReactNode, defaultOpen?: boolean }} props
 */
export default function BriefingSection({ icon, title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`briefing-section ${open ? 'briefing-section--open' : ''}`}>
      <button
        className="briefing-section__header"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="briefing-section__icon">{icon}</span>
        <span className="briefing-section__title">{title}</span>
        <span className="briefing-section__chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="briefing-section__body">
          {children}
        </div>
      )}
    </div>
  );
}

