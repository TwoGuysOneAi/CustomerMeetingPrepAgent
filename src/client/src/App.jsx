import { useState, useRef, useCallback } from 'react';
import InputPanel from './components/InputPanel.jsx';
import AgentProgress, { TOTAL_STEPS } from './components/AgentProgress.jsx';
import BriefingSection from './components/BriefingSection.jsx';
import RefineSidebar from './components/RefineSidebar.jsx';
import { exportElementToPdf } from './utils/pdfExportUtils.js';
import './App.css';

const PHASE = { IDLE: 'idle', RUNNING: 'running', COMPLETE: 'complete', ERROR: 'error' };
const STEP_DURATION_MS = 1400;

async function callAnalysisApi({ problemUrl, contextUrls }) {
  const response = await fetch('/api/analysis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ problemUrl, contextUrls }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error ${response.status}: ${text}`);
  }
  const data = await response.json();
  return data.output;
}

export default function App() {
  const [phase, setPhase] = useState(PHASE.IDLE);
  const [currentStep, setCurrentStep] = useState(0);
  const [briefing, setBriefing] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const briefingRef = useRef(null);

  const runAgent = useCallback(async (data) => {
    setPhase(PHASE.RUNNING);
    setCurrentStep(0);
    setErrorMessage('');

    // Advance progress steps while the API call runs in parallel
    let stepIndex = 0;
    const stepInterval = setInterval(() => {
      stepIndex = Math.min(stepIndex + 1, TOTAL_STEPS - 1);
      setCurrentStep(stepIndex);
    }, STEP_DURATION_MS);

    try {
      const output = await callAnalysisApi({
        problemUrl: data.problemUrl,
        contextUrls: data.urls,
      });
      clearInterval(stepInterval);
      setBriefing({ customerName: data.customerName, meetingContext: data.meetingContext, problemUrl: data.problemUrl, urls: data.urls, output });
      setPhase(PHASE.COMPLETE);
    } catch (err) {
      clearInterval(stepInterval);
      setErrorMessage(err.message ?? 'An unexpected error occurred.');
      setPhase(PHASE.ERROR);
    }
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
    setErrorMessage('');
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

        {phase === PHASE.ERROR && (
          <div className="error-banner">
            <strong>Error:</strong> {errorMessage}
            <button className="nav-btn nav-btn--ghost" onClick={handleReset} style={{ marginLeft: '1rem' }}>
              ↩ Try again
            </button>
          </div>
        )}

        {phase === PHASE.COMPLETE && briefing && (
          <div className="briefing" ref={briefingRef}>
            <div className="briefing__meta">
              <h1 className="briefing__title">{briefing.customerName}</h1>
              <p className="briefing__context">{briefing.meetingContext}</p>
              {briefing.problemUrl && (
                <div className="briefing__urls">
                  <a href={briefing.problemUrl} target="_blank" rel="noreferrer" className="briefing__url">
                    🔗 Problem: {briefing.problemUrl}
                  </a>
                </div>
              )}
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
              <BriefingSection icon="🤖" title="Analysis">
                <pre className="llm-output">{briefing.output}</pre>
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
