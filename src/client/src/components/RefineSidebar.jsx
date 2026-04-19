import { useState, useRef, useEffect } from 'react';
import './RefineSidebar.css';

const INITIAL_MESSAGE = {
  role: 'assistant',
  text: "Hi! I've prepared your briefing. You can ask me to expand any section, adjust the tone, focus on specific risks, or add anything you'd like to explore further.",
};

/**
 * @param {{ open: boolean, onClose: () => void, customerName: string }} props
 */
export default function RefineSidebar({ open, onClose, customerName }) {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  async function handleSend() {
    const text = input.trim();
    if (!text) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setTyping(true);

    // Simulated response — replace with real API call when backend is ready
    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));
    const response = generateMockReply(text, customerName);
    setTyping(false);
    setMessages((prev) => [...prev, { role: 'assistant', text: response }]);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <aside className={`refine-sidebar ${open ? 'refine-sidebar--open' : ''}`}>
      <div className="refine-sidebar__header">
        <span className="refine-sidebar__title">✏️ Refine Briefing</span>
        <button className="refine-sidebar__close" onClick={onClose} aria-label="Close sidebar">✕</button>
      </div>

      <div className="refine-sidebar__messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-msg chat-msg--${msg.role}`}>
            <span className="chat-msg__bubble">{msg.text}</span>
          </div>
        ))}
        {typing && (
          <div className="chat-msg chat-msg--assistant">
            <span className="chat-msg__bubble chat-msg__bubble--typing">
              <span /><span /><span />
            </span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="refine-sidebar__input-row">
        <textarea
          className="refine-sidebar__input"
          rows={2}
          placeholder="Ask me to refine, expand, or adjust…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="refine-sidebar__send"
          onClick={handleSend}
          disabled={!input.trim() || typing}
          aria-label="Send"
        >
          ➤
        </button>
      </div>
    </aside>
  );
}

function generateMockReply(userMessage, customerName) {
  const lower = userMessage.toLowerCase();
  if (lower.includes('risk') || lower.includes('concern'))
    return `Regarding risks for ${customerName || 'this customer'}: their recent leadership transition could mean shifting priorities — I'd recommend probing for current strategic initiatives early in the meeting to ensure alignment.`;
  if (lower.includes('tone') || lower.includes('formal'))
    return `Noted — I'll adjust the tone to be more formal and data-driven. Focus on ROI, metrics, and business outcomes rather than narrative language.`;
  if (lower.includes('competitor') || lower.includes('competition'))
    return `${customerName || 'The company'} faces strong competition from established players and emerging SaaS entrants. Their differentiation relies on vertical focus and customer support — worth framing your solution as complementary.`;
  if (lower.includes('expand') || lower.includes('more'))
    return `Happy to expand! Which section would you like more detail on — Company Overview, Stakeholders, Talking Points, or Risks?`;
  return `Great question. Based on the briefing for ${customerName || 'this customer'}, I'd suggest focusing your opening around the business outcomes they care most about. Would you like me to draft specific talking points around that angle?`;
}

