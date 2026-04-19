import { useState, useEffect, useRef } from 'react';
import { parseBriefing } from '../utils/parseBriefingUtils.js';
import BriefingHeader from './BriefingHeader.jsx';
import LeftNav from './LeftNav.jsx';
import CustomerSnapshot from './sections/CustomerSnapshot.jsx';
import MeetingGoals from './sections/MeetingGoals.jsx';
import GapsAndUnknowns from './sections/GapsAndUnknowns.jsx';
import ContextChanges from './sections/ContextChanges.jsx';
import KeyInsights from './sections/KeyInsights.jsx';
import ProblemAnalysis from './sections/ProblemAnalysis.jsx';
import RisksAndOpportunities from './sections/RisksAndOpportunities.jsx';
import SuggestedTalkingPoints from './sections/SuggestedTalkingPoints.jsx';
import ActionPlan from './sections/ActionPlan.jsx';
import './BriefingLayout.css';

const SECTION_IDS = [
  'section-customer-snapshot', 'section-meeting-goals', 'section-gaps',
  'section-context-changes', 'section-key-insights', 'section-problem-analysis',
  'section-risks-opportunities', 'section-talking-points', 'section-action-plan',
];

export default function BriefingLayout({ briefing, onReset, onExport, exporting }) {
  const [activeSection, setActiveSection] = useState(SECTION_IDS[0]);
  const mainRef = useRef(null);

  const sections = parseBriefing(briefing.output);

  // Scroll-spy: highlight active nav item
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length > 0) {
          // Pick the topmost visible section
          const topmost = visible.reduce((a, b) =>
            a.boundingClientRect.top < b.boundingClientRect.top ? a : b
          );
          setActiveSection(topmost.target.id);
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    );

    SECTION_IDS.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="briefing-layout">
      <BriefingHeader
        customerName={briefing.customerName}
        meetingContext={briefing.meetingContext}
        onReset={onReset}
        onExport={onExport}
        exporting={exporting}
      />
      <div className="briefing-layout__body">
        <LeftNav activeSection={activeSection} />
        <main className="briefing-layout__main" ref={mainRef}>
          <CustomerSnapshot text={sections.customerSnapshot} />
          <MeetingGoals text={sections.meetingGoals} />
          <GapsAndUnknowns text={sections.gaps} />
          <ContextChanges text={sections.contextChanges} />
          <KeyInsights text={sections.keyInsights} />
          <ProblemAnalysis summaryText={sections.problemSummary} mappingText={sections.problemMapping} />
          <RisksAndOpportunities text={sections.risksOpportunities} />
          <SuggestedTalkingPoints text={sections.talkingPoints} />
          <ActionPlan text={sections.actionPlan} />
        </main>
      </div>
    </div>
  );
}
