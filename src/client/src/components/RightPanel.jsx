import './RightPanel.css';

function deriveQuickInsights(sections) {
  const all = Object.values(sections).join(' ').toLowerCase();
  return {
    rootCause:  /root cause identified|confirmed cause/.test(all) ? 'Identified' : 'Under Investigation',
    healthTrend:/improving|positive trend|getting better/.test(all) ? 'Improving' : /declining|worsening/.test(all) ? 'Declining' : 'Stable',
    readiness:  /fully prepared|all gaps closed|ready/.test(all) ? 'Ready' : /partial|some gaps/.test(all) ? 'Partial' : 'Not Ready',
    escalation: /critical|escalated|urgent/.test(all) ? 'Escalated' : /elevated/.test(all) ? 'Moderate' : 'None',
  };
}

const BADGE_MAP = {
  Identified: 'low', 'Under Investigation': 'medium',
  Improving: 'low', Stable: 'neutral', Declining: 'high',
  Ready: 'low', Partial: 'medium', 'Not Ready': 'high',
  Escalated: 'high', Moderate: 'medium', None: 'low',
};

export default function RightPanel({ sections }) {
  const qi = deriveQuickInsights(sections);

  return (
    <aside className="right-panel">
      <div className="right-panel__block">
        <div className="right-panel__block-title">Quick Insights</div>
        <div className="qi-grid">
          {[
            { label: 'Root Cause Status',    value: qi.rootCause },
            { label: 'Health Trend',         value: qi.healthTrend },
            { label: 'Resolution Readiness', value: qi.readiness },
            { label: 'Escalation Level',     value: qi.escalation },
          ].map(({ label, value }) => (
            <div key={label} className="qi-row">
              <span className="qi-row__label">{label}</span>
              <span className={`qi-badge qi-badge--${(BADGE_MAP[value] ?? 'neutral').toLowerCase()}`}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
