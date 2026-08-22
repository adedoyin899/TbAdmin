// src/components/Help/MarketingAiBot.tsx
// Interactive Marketing & Analytics AI Assistant for non-technical and technical team members

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  RefreshCw,
  ArrowRight,
  Zap,
  Copy,
  Check,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  BOT_QUICK_PROMPTS,
  answerHelpBotQuery,
  type BotQuickPrompt,
} from '../../data/helpKnowledgeBase';


interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  relatedTerms?: string[];
  suggestedAction?: { label: string; link: string };
}

export const MarketingAiBot: React.FC<{ initialQuery?: string }> = ({ initialQuery }) => {
  const navigate = useNavigate();
  const messageSeqRef = useRef(0);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_msg',
      sender: 'bot',
      text: "👋 Hi! I'm your **TalentBridge Marketing & Analytics Assistant**.\n\nI can explain any marketing term, break down calculations (like **CPC**, **CPS**, **Engagement Rate**), help you understand your email heatmap, or guide you to the right dashboard tool.\n\nType a question below or click any quick suggestion chip to start!",
      timestamp: 'Just now',
      relatedTerms: ['Engagement Rate (%)', 'Cost Per Signup (CPS)', 'Peak Click Timing'],
    },
  ]);

  const [inputVal, setInputVal] = useState<string>(initialQuery || '');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || inputVal).trim();
    if (!query) return;

    messageSeqRef.current += 1;
    const userMsg: ChatMessage = {
      id: `user_${messageSeqRef.current}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    // Simulate conversational response processing
    setTimeout(() => {
      const response = answerHelpBotQuery(query);
      messageSeqRef.current += 1;

      const botMsg: ChatMessage = {
        id: `bot_${messageSeqRef.current}`,
        sender: 'bot',
        text: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        relatedTerms: response.relatedTerms,
        suggestedAction: response.suggestedAction,
      };



      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 450);
  };

  const handleQuickPrompt = (prompt: BotQuickPrompt) => {
    handleSend(prompt.query);
  };

  const handleCopy = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderFormattedText = (raw: string) => {
    // Simple markdown-style formatter for bold and code tokens
    const lines = raw.split('\n');
    return lines.map((line, idx) => {
      // Format bold **text** and `code`
      const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/`(.*?)`/g, '<code class="bot-code">$1</code>');
      return (
        <p
          key={idx}
          dangerouslySetInnerHTML={{ __html: formatted }}
          style={{ margin: line ? '0 0 6px 0' : '0 0 10px 0', lineHeight: 1.55 }}
        />
      );
    });
  };

  return (
    <div
      className="card"
      style={{
        background: 'var(--panel)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius)',
        display: 'flex',
        flexDirection: 'column',
        height: 640,
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
      }}
    >
      {/* Bot Header */}
      <div
        style={{
          padding: '14px 20px',
          borderBottom: '1px solid var(--line)',
          background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.08) 0%, rgba(250, 82, 15, 0.04) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent) 0%, #14B8A6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 2px 8px rgba(13, 148, 136, 0.3)',
            }}
          >
            <Bot size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: 'var(--text)' }}>
                TalentBridge Marketing AI Assistant
              </h3>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  background: 'rgba(16, 185, 129, 0.12)',
                  color: 'var(--success)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  padding: '1px 6px',
                  borderRadius: 10,
                }}
              >
                ● Online
              </span>
            </div>
            <p style={{ fontSize: 11.5, color: 'var(--text-2)', margin: 0 }}>
              Instant answers for marketing terms, KPI interpretations, and portal navigation
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([
              {
                id: 'welcome_reset',
                sender: 'bot',
                text: "✨ Conversation reset! Ask me anything about marketing formulas, email timings, campaign ROI, or portal features.",
                timestamp: 'Just now',
              },
            ]);
          }}
          className="btn btn-ghost"
          style={{ fontSize: 11, padding: '4px 8px', gap: 4, color: 'var(--text-2)' }}
          title="Reset conversation"
        >
          <RefreshCw size={12} />
          Reset
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          background: 'var(--bg-main)',
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '100%',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
                maxWidth: msg.sender === 'user' ? '80%' : '90%',
                flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
              }}
            >
              {msg.sender === 'bot' && (
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    background: 'var(--panel-2)',
                    border: '1px solid var(--line)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent)',
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  <Sparkles size={13} />
                </div>
              )}

              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  background: msg.sender === 'user' ? 'linear-gradient(135deg, var(--accent) 0%, #0F766E 100%)' : 'var(--panel)',
                  color: msg.sender === 'user' ? '#FFFFFF' : 'var(--text)',
                  border: msg.sender === 'user' ? 'none' : '1px solid var(--line)',
                  fontSize: 13,
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
                  position: 'relative',
                }}
              >
                {msg.sender === 'bot' ? (
                  <div style={{ color: 'var(--text)' }}>
                    {renderFormattedText(msg.text)}

                    {/* Suggested Direct Navigation Action */}
                    {msg.suggestedAction && (
                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--line)' }}>
                        <button
                          onClick={() => navigate(msg.suggestedAction!.link)}
                          className="btn btn-primary"
                          style={{
                            fontSize: 11.5,
                            padding: '4px 10px',
                            gap: 5,
                            background: 'var(--accent)',
                          }}
                        >
                          {msg.suggestedAction.label}
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    )}

                    {/* Related Term Pills */}
                    {msg.relatedTerms && msg.relatedTerms.length > 0 && (
                      <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 10, color: 'var(--text-2)', fontWeight: 600 }}>Related:</span>
                        {msg.relatedTerms.map((term) => (
                          <button
                            key={term}
                            onClick={() => handleSend(`Tell me more about ${term}`)}
                            style={{
                              background: 'var(--panel-2)',
                              border: '1px solid var(--line)',
                              borderRadius: 12,
                              padding: '2px 8px',
                              fontSize: 10.5,
                              color: 'var(--text-2)',
                              cursor: 'pointer',
                            }}
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                )}
              </div>
            </div>

            {/* Timestamp & Copy Action */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginTop: 3,
                paddingLeft: msg.sender === 'bot' ? 34 : 0,
                fontSize: 10,
                color: 'var(--dim)',
              }}
            >
              <span>{msg.timestamp}</span>
              {msg.sender === 'bot' && (
                <button
                  onClick={() => handleCopy(msg.id, msg.text)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--dim)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    padding: 0,
                  }}
                  title="Copy explanation"
                >
                  {copiedId === msg.id ? <Check size={11} color="var(--success)" /> : <Copy size={11} />}
                  <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 6 }}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: 'var(--panel-2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent)',
              }}
            >
              <Sparkles size={12} className="animate-spin" />
            </div>
            <div
              style={{
                padding: '8px 14px',
                borderRadius: '12px 12px 12px 2px',
                background: 'var(--panel)',
                border: '1px solid var(--line)',
                fontSize: 12,
                color: 'var(--text-2)',
              }}
            >
              Assistant is generating answer...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Question Chips */}
      <div
        style={{
          padding: '8px 16px',
          background: 'var(--panel)',
          borderTop: '1px solid var(--line)',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          display: 'flex',
          gap: 6,
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: 11, color: 'var(--dim)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
          <Zap size={12} color="var(--sunset)" />
          Quick Ask:
        </span>
        {BOT_QUICK_PROMPTS.map((qp) => (
          <button
            key={qp.id}
            onClick={() => handleQuickPrompt(qp)}
            className="btn"
            style={{
              background: 'var(--panel-2)',
              border: '1px solid var(--line)',
              color: 'var(--text-2)',
              fontSize: 11,
              padding: '3px 9px',
              borderRadius: 14,
              flexShrink: 0,
            }}
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        style={{
          padding: '12px 16px',
          background: 'var(--panel)',
          borderTop: '1px solid var(--line)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Ask anything (e.g. 'What is a good LinkedIn engagement rate?', 'Explain CPS')..."
          style={{
            flex: 1,
            padding: '8px 14px',
            background: 'var(--panel-2)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text)',
            fontSize: 13,
            outline: 'none',
          }}
        />

        <button
          type="submit"
          disabled={!inputVal.trim() || isTyping}
          className="btn btn-primary"
          style={{
            fontSize: 13,
            padding: '8px 16px',
            gap: 6,
            background: 'linear-gradient(135deg, var(--accent) 0%, #14B8A6 100%)',
          }}
        >
          <span>Ask</span>
          <Send size={13} />
        </button>
      </form>
    </div>
  );
};
