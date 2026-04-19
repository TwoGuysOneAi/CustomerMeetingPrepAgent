import { useState } from 'react';
import './InputPanel.css';

export default function InputPanel({ onSubmit, isDisabled }) {
  const [customerName, setCustomerName] = useState('');
  const [meetingContext, setMeetingContext] = useState('');
  const [problemUrl, setProblemUrl] = useState('');
  const [urls, setUrls] = useState(['']);

  function addUrl() {
    setUrls((prev) => [...prev, '']);
  }

  function removeUrl(index) {
    setUrls((prev) => prev.filter((_, i) => i !== index));
  }

  function updateUrl(index, value) {
    setUrls((prev) => prev.map((u, i) => (i === index ? value : u)));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const validUrls = urls.filter((u) => u.trim() !== '');
    onSubmit({ customerName: customerName.trim(), meetingContext: meetingContext.trim(), problemUrl: problemUrl.trim(), urls: validUrls });
  }

  const canSubmit =
    customerName.trim().length > 0 &&
    urls.length > 0 &&
    problemUrl.trim().length > 0 &&
    !isDisabled;

  return (
    <form className="input-panel" onSubmit={handleSubmit}>
      <h2 className="input-panel__title">Meeting Setup</h2>

      <div className="input-panel__field">
        <label htmlFor="customer-name">Customer / Company Name</label>
        <input
          id="customer-name"
          type="text"
          placeholder="e.g. Acme Corp"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          disabled={isDisabled}
          required
        />
      </div>

      <div className="input-panel__field">
        <label htmlFor="meeting-context">Meeting Context &amp; Goals</label>
        <textarea
          id="meeting-context"
          placeholder="Describe the purpose of the meeting, key topics, relationship stage, any prior context…"
          rows={5}
          value={meetingContext}
          onChange={(e) => setMeetingContext(e.target.value)}
          disabled={isDisabled}
          required
        />
      </div>

      <div className="input-panel__field">
        <label htmlFor="problem-url">Problem URL</label>
        <input
          id="problem-url"
          type="url"
          placeholder="https://… (link to the problem document)"
          value={problemUrl}
          onChange={(e) => setProblemUrl(e.target.value)}
          disabled={isDisabled}
          required
        />
      </div>

      <div className="input-panel__field">
        <label>Context URLs <span className="optional">(optional)</span></label>
        <div className="url-list">
          {urls.map((url, i) => (
            <div key={i} className="url-row">
              <input
                type="url"
                placeholder="https://…"
                value={url}
                onChange={(e) => updateUrl(i, e.target.value)}
                disabled={isDisabled}
              />
              {urls.length > 1 && (
                <button
                  type="button"
                  className="url-remove"
                  onClick={() => removeUrl(i)}
                  disabled={isDisabled}
                  aria-label="Remove URL"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="url-add"
            onClick={addUrl}
            disabled={isDisabled}
          >
            + Add URL
          </button>
        </div>
      </div>

      <button type="submit" className="submit-btn" disabled={!canSubmit}>
        Generate Briefing
      </button>
    </form>
  );
}

