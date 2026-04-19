import './BriefingHeader.css';

const BADGE_LABELS = { Normal: 'Normal', Elevated: 'Elevated', Critical: 'Critical', Blocked: 'Blocked' };
const HEALTH_LABELS = {
  riskLevel: 'Risk', sentiment: 'Sentiment', engagementLevel: 'Engagement',
  businessImpact: 'Impact', renewalRisk: 'Renewal',
};

export default function BriefingHeader({ customerName, meetingContext, statusBadge, healthIndicators, onReset, onExport, exporting }) {
  return (
    <header className="briefing-header">
      <div className="briefing-header__identity">
        <h1 className="briefing-header__name">{customerName}</h1>
        {meetingContext && <p className="briefing-header__sub">{meetingContext}</p>}
      </div>

      <span className={`status-badge status-badge--${statusBadge.toLowerCase()}`}>
        {BADGE_LABELS[statusBadge] ?? statusBadge}
      </span>

      <div className="briefing-header__health">
        {Object.entries(healthIndicators).map(([key, val]) => (
          <span key={key} className={`health-chip health-chip--${val}`}>
            <span className="health-chip__label">{HEALTH_LABELS[key]}:</span>
            {val.charAt(0).toUpperCase() + val.slice(1)}
          </span>
        ))}
      </div>

      <div className="briefing-header__actions">
        <button className="hdr-btn hdr-btn--primary" onClick={() => alert('Meeting mode — coming soon!')}>▶ Start Meeting</button>
        <button className="hdr-btn" onClick={onExport} disabled={exporting}>{exporting ? 'Exporting…' : '⬇ Export'}</button>
        <button className="hdr-btn" onClick={onReset}>↩ New Briefing</button>
      </div>
    </header>
  );
}

