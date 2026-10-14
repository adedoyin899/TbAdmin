// src/components/Common/FloatingAiAssistant.tsx
// Floating AI Marketing & Platform Assistant powered by live PostHog telemetry & platform search

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Send,
  X,
  Minimize2,
  Maximize2,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';
import { dashboardApi } from '../../api/dashboardApi';
import { answerHelpBotQuery } from '../../data/helpKnowledgeBase';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  suggestedAction?: { label: string; link: string };
  relatedQueries?: string[];
}

const QUICK_SUGGESTIONS = [
  'How many people joined this week vs last week?',
  'Who just created an account?',
  'What feature is doing well and what is not doing well?',
  'What blocks are creators using?',
  'How many users are using test room?',
  'What templates are creators choosing?',
  'What is our overall conversion rate?',
];

export const FloatingAiAssistant: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messageSeqRef = useRef(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: "👋 Hi! I'm your **TalentBridge Platform & Marketing AI Assistant**.\n\nI have direct access to our live PostHog telemetry, candidate signups, showcase rooms, and feature adoption data. Ask me anything or click a suggestion below!",
      timestamp: 'Just now',
      relatedQueries: [
        'How many people joined this week vs last week?',
        'Who just created an account?',
        'What feature is doing well?',
      ],
      suggestedAction: { label: 'Explore Showcase Rooms', link: '/dashboard/rooms' },
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized, isTyping]);

  const handleSend = async (queryToSend?: string) => {
    const query = (queryToSend || inputVal).trim();
    if (!query) return;

    messageSeqRef.current += 1;
    const userMsg: Message = {
      id: `user_${messageSeqRef.current}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    try {
      const res: any = await dashboardApi.queryAiAssistant(query);
      const data = res?.data || res;

      messageSeqRef.current += 1;
      const botMsg: Message = {
        id: `bot_${messageSeqRef.current}`,
        sender: 'bot',
        text: data?.answer || answerHelpBotQuery(query).answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedAction: data?.suggestedAction || answerHelpBotQuery(query).suggestedAction,
        relatedQueries: data?.relatedQueries || answerHelpBotQuery(query).relatedTerms,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const fallback = answerHelpBotQuery(query);
      messageSeqRef.current += 1;
      const botMsg: Message = {
        id: `bot_${messageSeqRef.current}`,
        sender: 'bot',
        text: fallback.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedAction: fallback.suggestedAction,
        relatedQueries: fallback.relatedTerms,
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleReset = () => {
    messageSeqRef.current = 1;
    setMessages([
      {
        id: 'welcome',
        sender: 'bot',
        text: "👋 Hi! I'm your **TalentBridge Platform & Marketing AI Assistant**.\n\nI have direct access to our live PostHog telemetry, candidate signups, showcase rooms, and feature adoption data. Ask me anything or click a suggestion below!",
        timestamp: 'Just now',
        relatedQueries: [
          'How many people joined this week vs last week?',
          'Who just created an account?',
          'What feature is doing well?',
        ],
        suggestedAction: { label: 'Explore Showcase Rooms', link: '/dashboard/rooms' },
      },
    ]);
  };

  const handleActionClick = (link: string) => {
    setIsOpen(false);
    navigate(link);
  };

  const renderFormatted = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let formatted = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/`([^`]+)`/g, '<code style="background: rgba(2,171,172,0.12); color: #02ABAC; padding: 2px 5px; border-radius: 4px; font-family: monospace; font-size: 0.9em;">$1</code>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>');

      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return (
          <div
            key={idx}
            style={{ display: 'flex', gap: 6, margin: '3px 0', lineHeight: 1.45 }}
            dangerouslySetInnerHTML={{ __html: `<span>•</span> <div>${formatted.replace(/^[•-]\s*/, '')}</div>` }}
          />
        );
      }

      return (
        <p
          key={idx}
          style={{ margin: '4px 0', lineHeight: 1.45 }}
          dangerouslySetInnerHTML={{ __html: formatted }}
        />
      );
    });
  };

  return (
    <>
      {/* ── Floating Pill Trigger Button ────────────────────────────── */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="animate-fade-in"
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 18px',
            borderRadius: 999,
            background: 'linear-gradient(135deg, #02ABAC 0%, #0F766E 100%)',
            color: '#FFFFFF',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 8px 30px rgba(2, 171, 172, 0.4), 0 2px 8px rgba(0,0,0,0.2)',
            cursor: 'pointer',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
            e.currentTarget.style.boxShadow = '0 12px 35px rgba(2, 171, 172, 0.55), 0 4px 12px rgba(0,0,0,0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(2, 171, 172, 0.4), 0 2px 8px rgba(0,0,0,0.2)';
          }}
          title="Open AI Platform & Telemetry Assistant"
        >
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={18} />
            <span
              style={{
                position: 'absolute',
                top: -2,
                right: -2,
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#10B981',
                boxShadow: '0 0 6px #10B981',
              }}
            />
          </div>
          <span style={{ fontFamily: 'Geist, sans-serif', fontSize: 13.5, fontWeight: 700, letterSpacing: '0.01em' }}>
            Ask AI Assistant
          </span>
          <span
            style={{
              fontSize: 10.5,
              padding: '2px 7px',
              borderRadius: 99,
              background: 'rgba(255,255,255,0.2)',
              fontWeight: 700,
            }}
          >
            Live
          </span>
        </button>
      )}

      {/* ── Floating Drawer / Flyout ─────────────────────────────────── */}
      {isOpen && (
        <div
          className="animate-slide-up"
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: isMinimized ? 320 : 'min(440px, calc(100vw - 32px))',
            height: isMinimized ? 56 : 'min(620px, calc(100vh - 48px))',
            maxHeight: 'calc(100vh - 48px)',
            background: 'var(--panel)',
            border: '1px solid var(--line)',
            borderRadius: 18,
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.35), 0 4px 20px rgba(0,0,0,0.15)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            backdropFilter: 'blur(20px)',
            transition: 'height 0.25s ease, width 0.25s ease',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '12px 16px',
              background: 'linear-gradient(135deg, rgba(2, 171, 172, 0.12) 0%, rgba(15, 118, 110, 0.18) 100%)',
              borderBottom: '1px solid var(--line)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              cursor: 'pointer',
            }}
            onClick={() => isMinimized && setIsMinimized(false)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #02ABAC, #0F766E)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(2,171,172,0.3)',
                  flexShrink: 0,
                }}
              >
                <Sparkles size={16} />
              </div>
              <div style={{ minWidth: 0 }}>
                <h4 style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  TalentBridge AI Assistant
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                  <span style={{ fontSize: 10.5, color: 'var(--dim)', whiteSpace: 'nowrap' }}>
                    PostHog Telemetry Live
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={handleReset}
                className="btn-icon"
                style={{ width: 28, height: 28 }}
                title="Reset conversation"
              >
                <RotateCcw size={13} />
              </button>
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                className="btn-icon"
                style={{ width: 28, height: 28 }}
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="btn-icon"
                style={{ width: 28, height: 28 }}
                title="Close"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Quick Questions Pills */}
              <div
                style={{
                  padding: '10px 14px',
                  background: 'var(--panel-2)',
                  borderBottom: '1px solid var(--line)',
                  display: 'flex',
                  gap: 6,
                  overflowX: 'auto',
                  scrollbarWidth: 'none',
                }}
              >
                {QUICK_SUGGESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(q)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 99,
                      background: 'var(--panel)',
                      border: '1px solid var(--line)',
                      color: 'var(--text-2)',
                      fontSize: 11,
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#02ABAC';
                      e.currentTarget.style.color = '#02ABAC';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--line)';
                      e.currentTarget.style.color = 'var(--text-2)';
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Chat Messages */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
              >
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                      gap: 4,
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '88%',
                        padding: '12px 14px',
                        borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                        background: msg.sender === 'user'
                          ? 'linear-gradient(135deg, #02ABAC 0%, #0F766E 100%)'
                          : 'var(--panel-2)',
                        color: msg.sender === 'user' ? '#FFFFFF' : 'var(--text)',
                        border: msg.sender === 'user' ? 'none' : '1px solid var(--line)',
                        fontSize: 12.5,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      }}
                    >
                      {renderFormatted(msg.text)}

                      {/* Suggested Action Deep Link Button */}
                      {msg.suggestedAction && (
                        <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                          <button
                            type="button"
                            onClick={() => handleActionClick(msg.suggestedAction!.link)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '5px 11px',
                              borderRadius: 6,
                              background: msg.sender === 'user' ? 'rgba(255,255,255,0.2)' : 'rgba(2,171,172,0.12)',
                              color: msg.sender === 'user' ? '#fff' : '#02ABAC',
                              border: `1px solid ${msg.sender === 'user' ? 'rgba(255,255,255,0.3)' : 'rgba(2,171,172,0.3)'}`,
                              fontSize: 11.5,
                              fontWeight: 700,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <span>{msg.suggestedAction.label}</span>
                            <ArrowRight size={12} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Related Query Chips */}
                    {msg.sender === 'bot' && msg.relatedQueries && msg.relatedQueries.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 4, maxWidth: '92%' }}>
                        {msg.relatedQueries.slice(0, 3).map((rq, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSend(rq)}
                            style={{
                              padding: '3px 8px',
                              borderRadius: 6,
                              background: 'transparent',
                              border: '1px dashed var(--line)',
                              color: 'var(--dim)',
                              fontSize: 10.5,
                              cursor: 'pointer',
                              textAlign: 'left',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = '#02ABAC';
                              e.currentTarget.style.color = '#02ABAC';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = 'var(--line)';
                              e.currentTarget.style.color = 'var(--dim)';
                            }}
                          >
                            💡 {rq}
                          </button>
                        ))}
                      </div>
                    )}

                    <span style={{ fontSize: 10, color: 'var(--faint)', margin: '0 4px' }}>
                      {msg.timestamp}
                    </span>
                  </div>
                ))}

                {isTyping && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '10px 14px',
                      background: 'var(--panel-2)',
                      border: '1px solid var(--line)',
                      borderRadius: '14px 14px 14px 2px',
                      width: 'fit-content',
                    }}
                  >
                    <span className="dot-pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: '#02ABAC', display: 'inline-block' }} />
                    <span style={{ fontSize: 11.5, color: 'var(--dim)', fontWeight: 600 }}>
                      Consulting PostHog telemetry &amp; candidate data...
                    </span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div
                style={{
                  padding: '12px 14px',
                  background: 'var(--panel-2)',
                  borderTop: '1px solid var(--line)',
                }}
              >
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'var(--panel)',
                    border: '1px solid var(--line)',
                    borderRadius: 12,
                    padding: '4px 6px 4px 12px',
                  }}
                >
                  <input
                    type="text"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    placeholder="Ask about users, rooms, blocks, or metrics..."
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      color: 'var(--text)',
                      fontSize: 12.5,
                    }}
                    disabled={isTyping}
                  />
                  <button
                    type="submit"
                    disabled={!inputVal.trim() || isTyping}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: inputVal.trim() && !isTyping ? '#02ABAC' : 'var(--panel-2)',
                      color: inputVal.trim() && !isTyping ? '#FFFFFF' : 'var(--dim)',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: inputVal.trim() && !isTyping ? 'pointer' : 'not-allowed',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Send size={14} />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
