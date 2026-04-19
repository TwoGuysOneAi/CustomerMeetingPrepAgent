import './LeftNav.css';

const NAV_ITEMS = [
  { id: 'section-customer-snapshot', icon: '🏢', label: 'Customer Snapshot' },
  { id: 'section-meeting-goals',     icon: '🎯', label: 'Meeting Goals' },
  { id: 'section-gaps',              icon: '❓', label: 'Gaps & Unknowns' },
  { id: 'section-context-changes',   icon: '🔄', label: 'Context Changes' },
  { id: 'section-key-insights',      icon: '💡', label: 'What Matters Now' },
  { id: 'section-problem-analysis',  icon: '🔍', label: 'Problem Analysis' },
  { id: 'section-risks-opportunities', icon: '⚖️', label: 'Risks & Opportunities' },
  { id: 'section-talking-points',    icon: '🗣️', label: 'Talking Points' },
  { id: 'section-action-plan',       icon: '📋', label: 'Action Plan' },
];

export default function LeftNav({ activeSection }) {
  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <nav className="left-nav" aria-label="Briefing navigation">
      <div className="left-nav__label">Briefing Sections</div>
      {NAV_ITEMS.map(item => (
        <button
          key={item.id}
          className={`left-nav__item${activeSection === item.id ? ' left-nav__item--active' : ''}`}
          onClick={() => scrollTo(item.id)}
        >
          <span className="left-nav__item-icon">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </nav>
  );
}

