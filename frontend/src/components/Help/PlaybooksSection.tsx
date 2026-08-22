// src/components/Help/PlaybooksSection.tsx
// Interactive How-To Playbooks and Step-by-Step guides for common tasks

import React, { useState } from 'react';
import {
  Clock,
  ChevronDown,
  ChevronUp,
  BookOpen,
} from 'lucide-react';
import { PLAYBOOKS } from '../../data/helpKnowledgeBase';


export const PlaybooksSection: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string>(PLAYBOOKS[0]?.id || '');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {PLAYBOOKS.map((pb) => {
        const isExpanded = expandedId === pb.id;

        return (
          <div
            key={pb.id}
            className="card"
            style={{
              background: 'var(--panel)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
              transition: 'border-color 0.2s',
            }}
          >
            {/* Playbook Accordion Header */}
            <div
              onClick={() => setExpandedId(isExpanded ? '' : pb.id)}
              style={{
                padding: '18px 22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                background: isExpanded ? 'rgba(13, 148, 136, 0.04)' : 'transparent',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: 'var(--panel-2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent)',
                    border: '1px solid var(--line)',
                  }}
                >
                  <BookOpen size={18} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--text)' }}>
                      {pb.title}
                    </h3>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        background: 'var(--panel-2)',
                        color: 'var(--text-2)',
                        border: '1px solid var(--line)',
                        padding: '1px 6px',
                        borderRadius: 10,
                      }}
                    >
                      {pb.category}
                    </span>
                  </div>
                  <p style={{ fontSize: 12.5, color: 'var(--text-2)', margin: 0 }}>
                    {pb.summary}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 12,
                    color: 'var(--dim)',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                >
                  <Clock size={12} />
                  {pb.timeToComplete}
                </span>
                {isExpanded ? <ChevronUp size={16} color="var(--dim)" /> : <ChevronDown size={16} color="var(--dim)" />}
              </div>
            </div>

            {/* Playbook Steps Body */}
            {isExpanded && (
              <div
                style={{
                  padding: '16px 22px 22px 22px',
                  borderTop: '1px solid var(--line)',
                  background: 'var(--bg-main)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
              >
                {pb.steps.map((step) => (
                  <div
                    key={step.stepNumber}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      padding: '12px 14px',
                      background: 'var(--panel)',
                      border: '1px solid var(--line)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: 'var(--accent)',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 700,
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    >
                      {step.stepNumber}
                    </div>

                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: 13.5, fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text)' }}>
                        {step.title}
                      </h4>
                      <p style={{ fontSize: 12.5, color: 'var(--text-2)', margin: '0 0 6px 0', lineHeight: 1.5 }}>
                        {step.instruction}
                      </p>
                      {step.tip && (
                        <div
                          style={{
                            fontSize: 11.5,
                            color: 'var(--sunset)',
                            background: 'rgba(250, 82, 15, 0.06)',
                            border: '1px solid rgba(250, 82, 15, 0.15)',
                            padding: '4px 8px',
                            borderRadius: 4,
                            display: 'inline-block',
                          }}
                        >
                          💡 {step.tip}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
