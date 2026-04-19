import { useState, useRef, useCallback } from 'react';
import InputPanel from './components/InputPanel.jsx';
import AgentProgress, { TOTAL_STEPS } from './components/AgentProgress.jsx';
import BriefingLayout from './components/BriefingLayout.jsx';
import { exportElementToPdf } from './utils/pdfExportUtils.js';
import './App.css';

const PHASE = { IDLE: 'idle', RUNNING: 'running', COMPLETE: 'complete', ERROR: 'error' };
const STEP_DURATION_MS = 1400;

async function callAnalysisApi({ customerName, meetingContext, previousMeetingNotes, problemUrl, contextUrls }) {
  const response = await fetch('/api/analysis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customerName, meetingContext, previousMeetingNotes, problemUrl, contextUrls }),
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
        customerName: data.customerName,
        meetingContext: data.meetingContext,
        previousMeetingNotes: data.previousMeetingNotes,
        problemUrl: data.problemUrl,
        contextUrls: data.urls,
      });
      clearInterval(stepInterval);
      setBriefing({ customerName: data.customerName, meetingContext: data.meetingContext, previousMeetingNotes: data.previousMeetingNotes, problemUrl: data.problemUrl, urls: data.urls, output });
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
    setCurrentStep(0);
    setErrorMessage('');
  }

  // Full-screen briefing layout — no outer chrome
  if (phase === PHASE.COMPLETE && briefing) {
    return (
      <div ref={briefingRef}>
        <BriefingLayout
          briefing={briefing}
          onReset={handleReset}
          onExport={handleExportPdf}
          exporting={exporting}
        />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-nav">
        <span className="app-nav__brand">🤝 Meeting Prep Agent</span>
      </header>
      <main className="app-main">
        {(phase === PHASE.IDLE || phase === PHASE.RUNNING) && (
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
      </main>
    </div>
  );
}
