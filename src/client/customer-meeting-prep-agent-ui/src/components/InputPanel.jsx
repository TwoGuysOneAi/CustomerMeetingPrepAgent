import React, { useState } from 'react';
import './InputPanel.css';

export default function InputPanel({ onSubmit, isLoading }) {
  const [customerName, setCustomerName] = useState('');
  const [meetingContext, setMeetingContext] = useState('');
  const [urls, setUrls] = useState(['']);

  const addUrl = () => setUrls([...urls, '']);

  const removeUrl = (index) => {
    const updated = urls.filter((_, i) => i !== index);
    setUrls(updated.length ? updated : ['']);
  };

  const updateUrl = (index, value) => {
    const updated = [...urls];
    updated[index] = value;
    setUrls(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerName.trim()) return;
    onSubmit({
      customerName,
      meetingContext,
      urls: urls.filter((u) => u.trim() !== ''),
    });
  };

  return (
    <form className="input-panel" onSubmit={handleSubmit}>
      <h2 className="panel-title">Meeting Prep</h2>

      {/* Customer Name */}
      <div className="field-group">
        <label className="field-label">Customer Name <span className="required">*</span></label>
        <input
          className="field-input"
          type="text"
          placeholder="e.g. Acme Corporation"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          required
        />
      </div>

      {/* Meeting Context */}
      <div className="field-group">
        <label className="field-label">Meeting Context</label>
        <textarea
          className="field-input field-textarea"
          placeholder="Describe the purpose of the meeting, key topics, goals…"
          value={meetingContext}
          onChange={(e) => setMeetingContext(e.target.value)}
          rows={4}
        />
      </div>

      {/* URL Attachments */}
      <div className="field-group">
        <label className="field-label">Attach URLs <span className="field-hint">(optional)</span></label>
        <div className="url-list">
          {urls.map((url, index) => (
            <div className="url-row" key={index}>
              <span className="url-icon">🔗</span>
              <input
                className="field-input url-input"
                type="url"
                placeholder="https://example.com/article"
                value={url}
                onChange={(e) => updateUrl(index, e.target.value)}
              />
              <button
                type="button"
                className="url-remove-btn"
                onClick={() => removeUrl(index)}
                title="Remove URL"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button type="button" className="add-url-btn" onClick={addUrl}>
          + Add URL
        </button>
      </div>

      <button
        type="submit"
        className={`submit-btn ${isLoading ? 'submit-btn--loading' : ''}`}
        disabled={isLoading || !customerName.trim()}
      >
        {isLoading ? 'Generating…' : '⚡ Generate Briefing'}
      </button>
    </form>
  );
}

