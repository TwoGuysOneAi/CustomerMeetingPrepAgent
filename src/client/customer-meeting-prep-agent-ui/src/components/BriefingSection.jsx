import React, { useState } from "react";
import "./BriefingSection.css";
export default function BriefingSection({ icon, title, children, defaultOpen = true }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className={`briefing-section ${isOpen ? "briefing-section--open" : ""}`}>
      <button className="briefing-header" onClick={() => setIsOpen((o) => !o)} aria-expanded={isOpen}>
        <span className="briefing-icon">{icon}</span>
        <span className="briefing-title">{title}</span>
        <span className={`briefing-chevron ${isOpen ? "briefing-chevron--open" : ""}`}>▾</span>
      </button>
      <div className={`briefing-body ${isOpen ? "briefing-body--open" : ""}`}>
        <div className="briefing-content">{children}</div>
      </div>
    </div>
  );
}
