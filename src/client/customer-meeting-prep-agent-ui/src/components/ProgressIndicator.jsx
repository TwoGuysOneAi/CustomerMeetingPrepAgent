import React, { useEffect, useState } from 'react';
import './ProgressIndicator.css';

const STEPS = [
  { id: 1, label: 'Gathering data', icon: '🔍' },
  { id: 2, label: 'Detecting changes', icon: '📡' },
  { id: 3, label: 'Generating insights', icon: '🧠' },
  { id: 4, label: 'Finalizing briefing', icon: '📋' },
];

export default function ProgressIndicator({ isVisible }) {
  const [activeStep, setActiveStep] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!isVisible) {
      setActiveStep(0);
      return;
    }

    const stepTimer = setInterval(() => {
      setActiveStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 1800);

    const dotTimer = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '' : d + '.'));
    }, 450);

    return () => {
      clearInterval(stepTimer);
      clearInterval(dotTimer);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="progress-indicator">
      <div className="progress-header">
        <span className="progress-spinner" />
        <span className="progress-headline">
          {STEPS[activeStep].icon} {STEPS[activeStep].label}{dots}
        </span>
      </div>

      <div className="progress-steps">
        {STEPS.map((step, index) => {
          const status =
            index < activeStep ? 'done' : index === activeStep ? 'active' : 'pending';
          return (
            <div key={step.id} className={`progress-step progress-step--${status}`}>
              <div className="step-dot">
                {status === 'done' ? '✓' : status === 'active' ? step.icon : ''}
              </div>
              <span className="step-label">{step.label}</span>
              {index < STEPS.length - 1 && <div className={`step-connector ${status === 'done' ? 'step-connector--done' : ''}`} />}
            </div>
          );
        })}
      </div>

      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{ width: `${((activeStep + 1) / STEPS.length) * 100}%` }}
        />
      </div>
    </div>
  );
}

