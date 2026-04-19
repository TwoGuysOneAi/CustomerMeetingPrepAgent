/** Maps numbered section headings from the LLM output to named keys. */
const SECTION_DEFS = [
  { key: 'customerSnapshot',   pattern: /\b1\.\s+Customer Snapshot/i },
  { key: 'meetingGoals',       pattern: /\b2\.\s+Meeting Goals/i },
  { key: 'gaps',               pattern: /\b3\.\s+Gaps/i },
  { key: 'problemSummary',     pattern: /\b4\.\s+Problem Summary/i },
  { key: 'contextChanges',     pattern: /\b5\.\s+What Changed Since Last Meeting/i },
  { key: 'keyInsights',        pattern: /\b6\.\s+What Matters Now/i },
  { key: 'problemMapping',     pattern: /\b7\.\s+Mapping of Context to Problem/i },
  { key: 'risksOpportunities', pattern: /\b8\.\s+Top Risks\s*\/\s*Opportunities/i },
  { key: 'talkingPoints',      pattern: /\b9\.\s+Suggested Talking Points/i },
  { key: 'actionPlan',         pattern: /\b10\.\s+Recommended Next Actions/i },
];

/** Parse raw LLM text into named section blocks. */
export function parseBriefing(rawText) {
  if (!rawText) return {};

  const positions = [];
  for (const { key, pattern } of SECTION_DEFS) {
    const match = rawText.match(pattern);
    if (match) positions.push({ key, index: match.index });
  }
  positions.sort((a, b) => a.index - b.index);

  const sections = {};
  for (let i = 0; i < positions.length; i++) {
    const start = positions[i].index;
    const end = i + 1 < positions.length ? positions[i + 1].index : rawText.length;
    const raw = rawText.slice(start, end).trim();
    sections[positions[i].key] = raw.replace(/^\d+\.\s+[^\n]+\n?/, '').trim();
  }

  // Fallback: if no sections found, treat whole text as a single block
  if (Object.keys(sections).length === 0) {
    sections.customerSnapshot = rawText;
  }

  return sections;
}

/** Extract a clean bullet list from a text block. */
export function extractBullets(text) {
  if (!text) return [];
  return text
    .split('\n')
    .map(l => l.replace(/^[-•*]|\b\d+[.)]\s*/g, '').trim())
    .filter(l => l.length > 4);
}

/** Split a text block into Risks and Opportunities arrays. */
export function splitRisksOpportunities(text) {
  if (!text) return { risks: [], opportunities: [] };

  const lines = text.split('\n');
  let mode = 'risks';
  const risks = [];
  const opportunities = [];

  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    if (/^(\*\*)?opportunit(y|ies)(\*\*)?:?$/i.test(t)) { mode = 'opportunities'; continue; }
    if (/^(\*\*)?risks?(\*\*)?:?$/i.test(t)) { mode = 'risks'; continue; }
    const item = t.replace(/^[-•*]|\b\d+[.)]\s*/g, '').trim();
    if (!item) continue;
    (mode === 'opportunities' ? opportunities : risks).push(item);
  }

  // If no split found, split in half
  if (opportunities.length === 0 && risks.length > 2) {
    const half = Math.ceil(risks.length / 2);
    return { risks: risks.slice(0, half), opportunities: risks.slice(half) };
  }
  return { risks, opportunities };
}

/** Parse talking points into time-phased blocks. */
export function parseTalkingPhases(text) {
  if (!text) return [{ label: 'Talking Points', time: '', content: '' }];

  const PHASES = [
    { label: 'Opening',   time: '0–3 min',   re: /opening/i },
    { label: 'Diagnosis', time: '3–8 min',   re: /diagno/i },
    { label: 'Solution',  time: '8–13 min',  re: /solution/i },
    { label: 'Strategy',  time: '13–18 min', re: /strateg/i },
    { label: 'Closure',   time: '18–20 min', re: /clos(ur|ing)/i },
  ];

  const hits = PHASES
    .map(p => { const m = text.match(p.re); return m ? { ...p, index: m.index } : null; })
    .filter(Boolean)
    .sort((a, b) => a.index - b.index);

  if (hits.length === 0) return [{ label: 'Talking Points', time: '', content: text }];

  return hits.map((h, i) => ({
    label: h.label,
    time: h.time,
    content: text.slice(h.index, i + 1 < hits.length ? hits[i + 1].index : text.length).trim(),
  }));
}

/** Parse action items and distribute into Kanban columns by timeframe. */
export function parseActionColumns(text) {
  if (!text) return { immediate: [], shortTerm: [], mediumTerm: [], longTerm: [] };

  const cols = { immediate: [], shortTerm: [], mediumTerm: [], longTerm: [] };
  const items = extractBullets(text);

  for (const item of items) {
    const l = item.toLowerCase();
    if (/immediate|today|24.?h|same.?day/.test(l)) cols.immediate.push(item);
    else if (/1.?7.?day|this week|next week|short.?term/.test(l)) cols.shortTerm.push(item);
    else if (/month|30.?day|medium.?term/.test(l)) cols.mediumTerm.push(item);
    else if (/long.?term|quarter|90.?day/.test(l)) cols.longTerm.push(item);
    else {
      // Distribute evenly
      const counts = [cols.immediate, cols.shortTerm, cols.mediumTerm, cols.longTerm].map(c => c.length);
      const keys = ['immediate', 'shortTerm', 'mediumTerm', 'longTerm'];
      cols[keys[counts.indexOf(Math.min(...counts))]].push(item);
    }
  }
  return cols;
}

/** Infer health indicator levels from the customer snapshot text. */
export function inferHealthIndicators(text) {
  if (!text) return defaultIndicators();
  const t = text.toLowerCase();

  return {
    riskLevel: level(t,
      ['high risk', 'critical risk', 'significant risk'],
      ['low risk', 'minimal risk', 'stable', 'healthy']),
    sentiment: /frustrated|dissatisfied|negative|unhappy|escalated|concerned/.test(t)
      ? 'negative'
      : /positive|satisfied|happy|pleased|optimistic/.test(t) ? 'positive' : 'neutral',
    engagementLevel: level(t,
      ['highly engaged', 'high engagement', 'very active'],
      ['low engagement', 'disengaged', 'unresponsive']),
    businessImpact: level(t,
      ['critical impact', 'high impact', 'major impact'],
      ['low impact', 'minimal impact', 'minor']),
    renewalRisk: level(t,
      ['at risk', 'churn risk', 'considering leaving', 'renewal risk'],
      ['likely to renew', 'renewal secure', 'low churn']),
  };
}

function level(text, highTerms, lowTerms) {
  if (highTerms.some(t => text.includes(t))) return 'high';
  if (lowTerms.some(t => text.includes(t))) return 'low';
  return 'medium';
}

function defaultIndicators() {
  return { riskLevel: 'medium', sentiment: 'neutral', engagementLevel: 'medium', businessImpact: 'medium', renewalRisk: 'medium' };
}

/** Infer overall status badge from all section text. */
export function inferStatusBadge(sections) {
  const text = Object.values(sections).join(' ').toLowerCase();
  if (/blocked|blocker/.test(text)) return 'Blocked';
  if (/critical|escalated|emergency/.test(text)) return 'Critical';
  if (/elevated|high risk|urgent|at risk/.test(text)) return 'Elevated';
  return 'Normal';
}

