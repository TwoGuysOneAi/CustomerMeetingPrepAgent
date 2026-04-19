/**
 * Parse the raw LLM output string into a structured JSON object.
 * Handles LLMs that wrap JSON in markdown code fences.
 * Returns null if parsing fails.
 */
export function parseBriefing(rawOutput) {
  if (!rawOutput) return null;
  const stripped = rawOutput.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  const start = stripped.indexOf('{');
  const end = stripped.lastIndexOf('}');
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(stripped.slice(start, end + 1));
  } catch {
    return null;
  }
}
/** Safe array accessor — always returns an array. */
export function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value != null) return [String(value)];
  return [];
}
/** Safe string accessor — always returns a string. */
export function asString(value, fallback = '—') {
  if (typeof value === 'string' && value.trim()) return value.trim();
  return fallback;
}
