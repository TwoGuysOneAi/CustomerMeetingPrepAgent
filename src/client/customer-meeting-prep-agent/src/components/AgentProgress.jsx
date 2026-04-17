import { useEffect, useState } from 'react';
import './AgentProgress.css';

const STEPS = [
  { id: 'gather',     label: 'Gathering company data',      detail: 'Fetching public filings, website, news sources…' },
  { id: 'changes',   label: 'Detecting recent changes',     detail: 'Scanning for earnings, leadership, product updates…' },
  { id: 'stake',     label: 'Analysing stakeholders',       detail: 'Mapping decision-makers and influence networks…' },
  { id: 'insights',  label: 'Generating insights',          detail: 'Correlating signals and identifying opportunities…' },
  { id: 'compile',   label: 'Compiling briefing',           detail: 'Structuring sections and formatting output…' },
];

/**
 * @param {{ currentStep: number, complete: boolean }} props
 * currentStep is 0-based index of the active step.
 */
export default function AgentProgress({ currentStep, complete }) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (complete) return;
    const t = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '' : d + '.'));
    }, 400);
    return () => clearInterval(t);
  }, [complete]);

  return (
    <div className="agent-progress">
      <div className="agent-progress__header">
        <span className={`agent-progress__pulse ${complete ? 'done' : 'running'}`} />
        <span className="agent-progress__status">
          {complete ? '✓ Briefing ready' : `Working${dots}`}
        </span>
      </div>
      <ol className="agent-progress__steps">
        {STEPS.map((step, i) => {
          const state = complete || i < currentStep ? 'done' : i === currentStep ? 'active' : 'pending';
          return (
            <li key={step.id} className={`step step--${state}`}>
              <span className="step__icon">
                {state === 'done' ? '✓' : state === 'active' ? <span className="step__spinner" /> : '○'}
              </span>
              <span className="step__content">
                <span className="step__label">{step.label}</span>
                {state === 'active' && (
                  <span className="step__detail">{step.detail}</span>
                )}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export const TOTAL_STEPS = STEPS.length;

