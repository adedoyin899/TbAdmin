// src/components/Help/HelpGuide.tsx
// Master Help, Learning, Data Dictionary & Marketing AI Assistant Portal

import React, { useState } from 'react';
import {
  BookOpen,
  Bot,
  Layers,
  HelpCircle,
  FileText,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { MarketingAiBot } from './MarketingAiBot';
import { GlossarySection } from './GlossarySection';
import { WalkthroughSection } from './WalkthroughSection';
import { PlaybooksSection } from './PlaybooksSection';


export const HelpGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'bot' | 'glossary' | 'walkthrough' | 'playbooks' | 'faq'>('bot');
  const [botPrefillQuery, setBotPrefillQuery] = useState<string | undefined>(undefined);

  const handleAskBot = (query: string) => {
    setBotPrefillQuery(query);
    setActiveTab('bot');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">
      {/* 1. Header Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.12) 0%, rgba(250, 82, 15, 0.06) 100%)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius)',
          padding: '24px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ maxWidth: 680 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, var(--accent) 0%, #14B8A6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)',
              }}
            >
              <BookOpen size={20} />
            </div>
            <h1
              style={{
                fontFamily: 'Sora, sans-serif',
                fontSize: 24,
                fontWeight: 700,
                color: 'var(--text)',
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              TalentBridge Intelligence &amp; User Guide
            </h1>
            <span
              style={{
                background: 'rgba(13, 148, 136, 0.15)',
                color: 'var(--accent)',
                fontSize: 11,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 12,
                border: '1px solid rgba(13, 148, 136, 0.3)',
              }}
            >
              AI Powered
            </span>
          </div>
          <p style={{ color: 'var(--text-2)', fontSize: 14, margin: 0, lineHeight: 1.5 }}>
            A complete guide for marketing leaders, hiring managers, and operations teams to understand,
            interpret, and act upon multi-channel social media, email heatmaps, 3D room evaluations, and campaign ROI.
          </p>
        </div>

        {/* Quick KPI stats chips */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div
            style={{
              padding: '8px 14px',
              background: 'var(--panel)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Zap size={15} color="var(--accent)" />
            <div>
              <div style={{ fontSize: 11, color: 'var(--dim)', fontWeight: 600 }}>Sync Intervals</div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text)' }}>15m – 6h Auto</div>
            </div>
          </div>

          <div
            style={{
              padding: '8px 14px',
              background: 'var(--panel)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <ShieldCheck size={15} color="var(--success)" />
            <div>
              <div style={{ fontSize: 11, color: 'var(--dim)', fontWeight: 600 }}>Attribution</div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text)' }}>Multi-Touch v2</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs Selector */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          borderBottom: '1px solid var(--line)',
          paddingBottom: 4,
          overflowX: 'auto',
          whiteSpace: 'nowrap',
        }}
      >
        <button
          onClick={() => setActiveTab('bot')}
          className="btn"
          style={{
            fontSize: 13,
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
            background: activeTab === 'bot' ? 'var(--panel)' : 'transparent',
            color: activeTab === 'bot' ? 'var(--accent)' : 'var(--text-2)',
            border: activeTab === 'bot' ? '1px solid var(--line)' : '1px solid transparent',
            borderBottom: activeTab === 'bot' ? '2px solid var(--accent)' : 'none',
            fontWeight: activeTab === 'bot' ? 700 : 500,
            gap: 6,
          }}
        >
          <Bot size={15} />
          Marketing AI Assistant
        </button>

        <button
          onClick={() => setActiveTab('glossary')}
          className="btn"
          style={{
            fontSize: 13,
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
            background: activeTab === 'glossary' ? 'var(--panel)' : 'transparent',
            color: activeTab === 'glossary' ? 'var(--accent)' : 'var(--text-2)',
            border: activeTab === 'glossary' ? '1px solid var(--line)' : '1px solid transparent',
            borderBottom: activeTab === 'glossary' ? '2px solid var(--accent)' : 'none',
            fontWeight: activeTab === 'glossary' ? 700 : 500,
            gap: 6,
          }}
        >
          <BookOpen size={15} />
          Metrics Glossary &amp; Formulas
        </button>

        <button
          onClick={() => setActiveTab('walkthrough')}
          className="btn"
          style={{
            fontSize: 13,
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
            background: activeTab === 'walkthrough' ? 'var(--panel)' : 'transparent',
            color: activeTab === 'walkthrough' ? 'var(--accent)' : 'var(--text-2)',
            border: activeTab === 'walkthrough' ? '1px solid var(--line)' : '1px solid transparent',
            borderBottom: activeTab === 'walkthrough' ? '2px solid var(--accent)' : 'none',
            fontWeight: activeTab === 'walkthrough' ? 700 : 500,
            gap: 6,
          }}
        >
          <Layers size={15} />
          Portal Touchpoints Guide
        </button>

        <button
          onClick={() => setActiveTab('playbooks')}
          className="btn"
          style={{
            fontSize: 13,
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
            background: activeTab === 'playbooks' ? 'var(--panel)' : 'transparent',
            color: activeTab === 'playbooks' ? 'var(--accent)' : 'var(--text-2)',
            border: activeTab === 'playbooks' ? '1px solid var(--line)' : '1px solid transparent',
            borderBottom: activeTab === 'playbooks' ? '2px solid var(--accent)' : 'none',
            fontWeight: activeTab === 'playbooks' ? 700 : 500,
            gap: 6,
          }}
        >
          <FileText size={15} />
          How-To Playbooks
        </button>

        <button
          onClick={() => setActiveTab('faq')}
          className="btn"
          style={{
            fontSize: 13,
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
            background: activeTab === 'faq' ? 'var(--panel)' : 'transparent',
            color: activeTab === 'faq' ? 'var(--accent)' : 'var(--text-2)',
            border: activeTab === 'faq' ? '1px solid var(--line)' : '1px solid transparent',
            borderBottom: activeTab === 'faq' ? '2px solid var(--accent)' : 'none',
            fontWeight: activeTab === 'faq' ? 700 : 500,
            gap: 6,
          }}
        >
          <HelpCircle size={15} />
          System &amp; Sync FAQs
        </button>
      </div>

      {/* 3. Tab Content Switcher */}
      {activeTab === 'bot' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
          <MarketingAiBot initialQuery={botPrefillQuery} />
        </div>
      )}

      {activeTab === 'glossary' && (
        <GlossarySection onAskBot={handleAskBot} />
      )}

      {activeTab === 'walkthrough' && (
        <WalkthroughSection />
      )}

      {activeTab === 'playbooks' && (
        <PlaybooksSection />
      )}

      {activeTab === 'faq' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            className="card"
            style={{
              background: 'var(--panel)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius)',
              padding: 24,
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>
              Frequently Asked Questions (FAQ)
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)', margin: '0 0 4px 0' }}>
                  Q: When does data update from LinkedIn, Reddit, Buffer, and Mailgun?
                </h4>
                <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0, lineHeight: 1.5 }}>
                  Background schedulers run automatically: Buffer every 1 hour, Reddit every 2 hours, LinkedIn every 4 hours, Mailgun email webhooks every 15 minutes, and Campaign ROI calculations every 6 hours. You can trigger an instant update at any time by clicking the <strong>Sync pulse button</strong> in the top toolbar.
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)', margin: '0 0 4px 0' }}>
                  Q: How is Cost Per Signup (CPS) calculated?
                </h4>
                <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0, lineHeight: 1.5 }}>
                  CPS is calculated as <code>Total Campaign Spend ($) / Total Attributed Candidate &amp; Employer Signups</code>. Our target acquisition benchmark across engineering and tech hiring campaigns is under $35.00.
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)', margin: '0 0 4px 0' }}>
                  Q: Why does the Email Timing chart show higher activity between 10am-11am?
                </h4>
                <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0, lineHeight: 1.5 }}>
                  Tech recruiters and hiring managers typically review and triage inbox messages mid-morning after initial morning standups. Scheduling automated outreach to arrive at 9:30am ensures your email sits near the top of their inbox during this peak window.
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)', margin: '0 0 4px 0' }}>
                  Q: Can I export reports to Excel or PDF for executive meetings?
                </h4>
                <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0, lineHeight: 1.5 }}>
                  Yes! All marketing views feature a one-click <strong>Export CSV</strong> button, and individual campaigns have an <strong>Export Report</strong> button that outputs executive summaries, channel shares, and progression timelines.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
