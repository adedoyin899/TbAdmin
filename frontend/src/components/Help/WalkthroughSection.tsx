// src/components/Help/WalkthroughSection.tsx
// Visual portal touchpoints walkthrough guide for the entire admin portal

import React from 'react';
import {
  Share2,
  Mail,
  Target,
  Sparkles,
  TrendingDown,
  ArrowRight,
  Lightbulb,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PORTAL_TOUCHPOINTS } from '../../data/helpKnowledgeBase';


export const WalkthroughSection: React.FC = () => {
  const navigate = useNavigate();

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Share2':
        return <Share2 size={18} color="var(--accent)" />;
      case 'Mail':
        return <Mail size={18} color="var(--info)" />;
      case 'Target':
        return <Target size={18} color="var(--sunset)" />;
      case 'Sparkles':
        return <Sparkles size={18} color="#A855F7" />;
      default:
        return <TrendingDown size={18} color="var(--accent)" />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
        {PORTAL_TOUCHPOINTS.map((tp) => (
          <div
            key={tp.id}
            className="card card-hover"
            style={{
              background: 'var(--panel)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius)',
              padding: 22,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 16,
            }}
          >
            <div>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: 'var(--panel-2)',
                      border: '1px solid var(--line)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {getIcon(tp.icon)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--text)' }}>
                      {tp.title}
                    </h3>
                    <p style={{ fontSize: 12, color: 'var(--text-2)', margin: 0 }}>
                      {tp.subtitle}
                    </p>
                  </div>
                </div>

                {tp.badge && (
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      background: 'rgba(13, 148, 136, 0.1)',
                      color: 'var(--accent)',
                      border: '1px solid rgba(13, 148, 136, 0.25)',
                      padding: '2px 8px',
                      borderRadius: 12,
                    }}
                  >
                    {tp.badge}
                  </span>
                )}
              </div>

              <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5, marginBottom: 14 }}>
                {tp.description}
              </p>

              {/* Best For Box */}
              <div
                style={{
                  background: 'var(--bg-main)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 12px',
                  fontSize: 12,
                  color: 'var(--text)',
                  marginBottom: 12,
                }}
              >
                <strong style={{ color: 'var(--accent)' }}>Best for:</strong> {tp.bestFor}
              </div>

              {/* Key Metrics Pills */}
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontSize: 11, color: 'var(--dim)', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                  Key Telemetry:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {tp.keyMetrics.map((km) => (
                    <span
                      key={km}
                      style={{
                        background: 'var(--panel-2)',
                        border: '1px solid var(--line)',
                        borderRadius: 6,
                        padding: '2px 8px',
                        fontSize: 11,
                        color: 'var(--text)',
                        fontFamily: 'JetBrains Mono, monospace',
                      }}
                    >
                      {km}
                    </span>
                  ))}
                </div>
              </div>

              {/* Pro Tips */}
              <div>
                <span style={{ fontSize: 11, color: 'var(--sunset)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                  <Lightbulb size={12} />
                  Pro Tips:
                </span>
                <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5 }}>
                  {tp.proTips.map((tip, idx) => (
                    <li key={idx} style={{ marginBottom: 3 }}>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Launch View CTA */}
            <div style={{ paddingTop: 12, borderTop: '1px solid var(--line)' }}>
              <button
                onClick={() => navigate(tp.route)}
                className="btn btn-ghost w-full"
                style={{
                  fontSize: 12.5,
                  padding: '8px 12px',
                  justifyContent: 'space-between',
                  background: 'var(--panel-2)',
                  color: 'var(--text)',
                }}
              >
                <span>Open {tp.title}</span>
                <ArrowRight size={13} color="var(--accent)" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
