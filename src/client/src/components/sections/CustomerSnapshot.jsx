import { useState } from 'react';
import './sections.css';

const LEVEL_CLASS = { Low: 'low', Medium: 'medium', High: 'high', Critical: 'high' };

const SIGNAL_LABELS = {
  risk_level:      'Risk Level',
  business_impact: 'Business Impact',
  renewal_risk:    'Renewal Risk',
};

export default function CustomerSnapshot({ customer, healthSignals, summary }) {
  const [open, setOpen] = useState(true);

  const pills = Object.entries(SIGNAL_LABELS)
    .map(([key, label]) => ({ key, label, value: healthSignals[key] }))
    .filter(({ value }) => value);

  return (
    <div className="section-card" id="section-customer-snapshot">
      <button className="section-card__header" onClick={() => setOpen(v => !v)} aria-expanded={open}>
        <span className="section-card__icon">🏢</span>
        <span className="section-card__title">Customer Snapshot</span>
        <span className="section-card__chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="section-card__body">
          {/* Relationship stage + health pills */}
          <div className="snapshot-meta">
            <div className="signal-grid">
              {pills.map(({ key, label, value }) => (
                <span key={key} className={`signal-pill signal-pill--${LEVEL_CLASS[value] ?? 'medium'}`}>
                  <span className="signal-pill__label">{label}:</span>
                  <span className="signal-pill__value">{value}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Risk alert banner */}
          {healthSignals.risk_alert && (
            <div className="risk-alert-banner">⚠ {healthSignals.risk_alert}</div>
          )}

          <p className="section-prose">{summary}</p>
        </div>
      )}
    </div>
  );
}
