import { useState } from 'react';
import { inferHealthIndicators } from '../../utils/parseBriefingUtils.js';
import './sections.css';

const SIGNAL_LABELS = {
  riskLevel:      'Risk Level',
  businessImpact: 'Business Impact',
  renewalRisk:    'Renewal Risk',
};

export default function CustomerSnapshot({ text }) {
  const [open, setOpen] = useState(true);
  const indicators = inferHealthIndicators(text);

  return (
    <div className="section-card" id="section-customer-snapshot">
      <button className="section-card__header" onClick={() => setOpen(v => !v)} aria-expanded={open}>
        <span className="section-card__icon">🏢</span>
        <span className="section-card__title">Customer Snapshot</span>
        <span className="section-card__chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="section-card__body">
          <div className="signal-grid">
            {Object.entries(indicators).map(([key, val]) => (
              <div key={key} className={`signal-pill signal-pill--${val}`}>
                <span className="signal-pill__label">{SIGNAL_LABELS[key]}</span>
                <span className="signal-pill__value">{val.charAt(0).toUpperCase() + val.slice(1)}</span>
              </div>
            ))}
          </div>
          <p className="section-prose">{text || '—'}</p>
        </div>
      )}
    </div>
  );
}

