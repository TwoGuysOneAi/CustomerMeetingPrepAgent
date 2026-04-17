import { useState, useRef, useCallback } from 'react';
import InputPanel from './components/InputPanel.jsx';
import AgentProgress, { TOTAL_STEPS } from './components/AgentProgress.jsx';
import BriefingSection from './components/BriefingSection.jsx';
import RefineSidebar from './components/RefineSidebar.jsx';
import { exportElementToPdf } from './utils/pdfExportUtils.js';
import './App.css';

const PHASE = { IDLE: 'idle', RUNNING: 'running', COMPLETE: 'complete' };
const STEP_DURATION_MS = 1400;

function buildMockBriefing({ customerName, meetingContext, urls }) {
  return {
    customerName,
    meetingContext,
    urls,
    overview: {
      summary: `${customerName} is a mid-market technology firm operating across North America and Europe. Founded in 2008, they employ ~3,200 people and reported $420M ARR in their most recent fiscal year.`,
      highlights: [
        'Public company (NASDAQ: placeholder)',
        'Primary verticals: FinTech, HealthTech, and Retail',
        'Recently completed acquisition of DataBridge Inc.',
      ],
    },
    recentChanges: [
      'New CTO appointed Q1 2026 — Jane Holloway, previously at Palantir.',
      'Announced 12% workforce restructuring in February; engineering largely unaffected.',
      'Launched "Apex" platform at industry conference last month — major product pivot to AI-native workflows.',
      'Share price down ~18% YTD; analyst consensus is cautiously optimistic pending next earnings call.',
    ],
    stakeholders: [
      { name: 'Jane Holloway', role: 'CTO', notes: 'New to role; known for data-platform expertise. Likely evaluating the full vendor stack.' },
      { name: 'Marcus Reid', role: 'VP Engineering', notes: 'Day-to-day technical buyer. Pragmatic, prefers demos over decks.' },
      { name: 'Sofia Chen', role: 'Head of Procurement', notes: 'Controls budget approval. ROI and compliance are her primary concerns.' },
    ],
    objectives: meetingContext
      ? meetingContext.split('.').filter(Boolean).map((s) => s.trim())
      : ['Validate solution fit', 'Identify evaluation criteria', 'Agree on next steps'],
    talkingPoints: [
      `Lead with the Apex integration story — ${customerName} is invested in AI-native workflows; show how you accelerate that roadmap.`,
      'Reference the DataBridge acquisition: ask about integration challenges — this is likely a pain point and an entry opportunity.',
      "Highlight compliance posture (SOC 2 Type II, GDPR) — Sofia Chen's main concern.",
      'Offer a technical proof-of-concept scoped to one engineering team; Marcus Reid responds well to hands-on evaluation.',
      'Keep the deck to 10 minutes max — leave room for discovery questions.',
    ],
    risks: [
      { level: 'high',   text: 'Budget freeze risk following restructuring — confirm budget availability early.' },
      { level: 'medium', text: 'New CTO may restart vendor evaluation from scratch — requalify promptly.' },
      { level: 'medium', text: 'Competing evaluation underway with a hyperscaler — differentiate on specialisation.' },
      { level: 'low',    text: 'DataBridge acquisition may introduce a competing internal solution in 6–12 months.' },
    ],
  };
}

export default function App() {
  const [phase, setPhase] = useState(PHASE.IDLE);
  const [currentStep, setCurrentStep] = useState(0);
  const [briefing, setBriefing] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const briefingRef = useRef(null);

  const runAgent = useCallback(async (data) => {
    setPhase(PHASE.RUNNING);
    setCurrentStep(0);
    for (let i = 0; i < TOTAL_STEPS; i++) {
      setCurrentStep(i);
      await new Promise((r) => setTimeout(r, STEP_DURATION_MS));
    }
    setBriefing(buildMockBriefing(data));
    setPhase(PHASE.COMPLETE);
  }, []);

  async function handleExportPdf() {
    if (!briefingRef.current) return;
    setExporting(true);
    try {
      await exportElementToPdf(briefingRef.current, `${briefing.customerName}-meeting-briefing`);
    } finally {
      setExporting(false);
    }
  }

  function handleReset() {
    setPhase(PHASE.IDLE);
    setBriefing(null);
    setSidebarOpen(false);
    setCurrentStep(0);
  }

  return (
    <div className={`app-shell ${sidebarOpen ? 'app-shell--sidebar-open' : ''}`}>
      <header className="app-nav">
        <span className="app-nav__brand">🤝 Meeting Prep Agent</span>
        <div className="app-nav__actions">
          {phase === PHASE.COMPLETE && (
            <>
              <button className="nav-btn nav-btn--secondary" onClick={() => setSidebarOpen((v) => !v)}>
                ✏️ Refine
              </button>
              <button className="nav-btn nav-btn--secondary" onClick={handleExportPdf} disabled={exporting}>
                {exporting ? 'Exporting…' : '⬇ Export PDF'}
              </button>
              <button className="nav-btn nav-btn--ghost" onClick={handleReset}>
                ↩ New briefing
              </button>
            </>
          )}
        </div>
      </header>

      <main className="app-main">
        {phase !== PHASE.COMPLETE && (
          <InputPanel onSubmit={runAgent} isDisabled={phase === PHASE.RUNNING} />
        )}

        {phase === PHASE.RUNNING && (
          <AgentProgress currentStep={currentStep} complete={false} />
        )}

        {phase === PHASE.COMPLETE && briefing && (
          <div className="briefing" ref={briefingRef}>
            <div className="briefing__meta">
              <h1 className="briefing__title">{briefing.customerName}</h1>
              <p className="briefing__context">{briefing.meetingContext}</p>
              {briefing.urls.length > 0 && (
                <div className="briefing__urls">
                  {briefing.urls.map((u, i) => (
                    <a key={i} href={u} target="_blank" rel="noreferrer" className="briefing__url">
                      🔗 {u}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="briefing__sections">
              <BriefingSection icon="🏢" title="Company Overview">
                <p>{briefing.overview.summary}</p>
                <ul>{briefing.overview.highlights.map((h, i) => <li key={i}>{h}</li>)}</ul>
              </BriefingSection>

              <BriefingSection icon="📰" title="Recent Changes & News">
                <ul>{briefing.recentChanges.map((c, i) => <li key={i}>{c}</li>)}</ul>
              </BriefingSection>

              <BriefingSection icon="👥" title="Key Stakeholders">
                <div className="stakeholder-list">
                  {briefing.stakeholders.map((s, i) => (
                    <div key={i} className="stakeholder-card">
                      <span className="stakeholder-card__name">{s.name}</span>
                      <span className="stakeholder-card__role">{s.role}</span>
                      <span className="stakeholder-card__notes">{s.notes}</span>
                    </div>
                  ))}
                </div>
              </BriefingSection>

              <BriefingSection icon="🎯" title="Meeting Objectives">
                <ul>{briefing.objectives.map((o, i) => <li key={i}>{o}</li>)}</ul>
              </BriefingSection>

              <BriefingSection icon="💬" title="Recommended Talking Points">
                <ul>{briefing.talkingPoints.map((t, i) => <li key={i}>{t}</li>)}</ul>
              </BriefingSection>

              <BriefingSection icon="⚠️" title="Risks & Watch-outs" defaultOpen={false}>
                {briefing.risks.map((r, i) => (
                  <div key={i} className="risk-item">
                    <span className={`badge badge--${r.level}`}>{r.level.toUpperCase()}</span>
                    <span>{r.text}</span>
                  </div>
                ))}
              </BriefingSection>
            </div>
          </div>
        )}
      </main>

      <RefineSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        customerName={briefing?.customerName ?? ''}
      />

      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}
