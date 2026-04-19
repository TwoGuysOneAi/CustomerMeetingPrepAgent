import React, { useState, useRef, useEffect } from "react";
import "./RefineSidebar.css";
export default function RefineSidebar({ isOpen, onClose, briefingData }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! I can help you refine this briefing. What would you like to adjust or explore further?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);
  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: `Got it! I'm refining the briefing based on: "${text}". In a live integration this would call the AI backend with your feedback and the current briefing context.`,
        },
      ]);
    }, 1800);
  };
  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };
  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? "sidebar-overlay--visible" : ""}`} onClick={onClose} />
      <aside className={`refine-sidebar ${isOpen ? "refine-sidebar--open" : ""}`}>
        <div className="sidebar-header">
          <span className="sidebar-title">✨ Refine Briefing</span>
          <button className="sidebar-close" onClick={onClose}>✕</button>
        </div>
        <div className="sidebar-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-bubble chat-bubble--${msg.role}`}>
              <span className="bubble-role">{msg.role === "user" ? "You" : "Agent"}</span>
              <p className="bubble-text">{msg.text}</p>
            </div>
          ))}
          {isTyping && (
            <div className="chat-bubble chat-bubble--assistant">
              <span className="bubble-role">Agent</span>
              <p className="bubble-text typing-dots"><span/><span/><span/></p>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div className="sidebar-input-row">
          <textarea
            className="sidebar-input"
            placeholder="Ask me to adjust the briefing…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={2}
          />
          <button className="sidebar-send" onClick={sendMessage} disabled={!input.trim()}>Send</button>
        </div>
      </aside>
    </>
  );
}
