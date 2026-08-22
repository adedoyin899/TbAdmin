// src/components/Email/EmailSequenceDetailModal.tsx
// Interactive Drilldown Modal for Email Campaign Sequences & Step Telemetry

import React from 'react';
import {
  X,
  Mail,
  Clock,
  Layers,
  Monitor,
} from 'lucide-react';
import { formatNumber } from '../../utils/formatters';


export interface EmailSequenceDetailItem {
  id: string;
  name: string;
  sent: number;
  openPercentage: number;
  clickPercentage: number;
  signupConversionPercentage: number;
  avgTimeToSignupHours: number;
  deviceSplit: { desktop: number; mobile: number; tablet: number };
  subjectLine?: string;
  steps?: { stepNumber: number; title: string; trigger: string; openRate: number; clickRate: number }[];
}

interface EmailSequenceDetailModalProps {
  sequence: EmailSequenceDetailItem | null;
  onClose: () => void;
}

export const EmailSequenceDetailModal: React.FC<EmailSequenceDetailModalProps> = ({
  sequence,
  onClose,
}) => {
  if (!sequence) return null;

  const defaultSteps = sequence.steps || [
    {
      stepNumber: 1,
      title: 'Welcome & Interactive Room Setup',
      trigger: 'Immediate on candidate signup',
      openRate: sequence.openPercentage + 8,
      clickRate: sequence.clickPercentage + 5,
    },
    {
      stepNumber: 2,
      title: 'Showcase Room Best Practices & Code Demos',
      trigger: '24 hours after signup',
      openRate: sequence.openPercentage,
      clickRate: sequence.clickPercentage,
    },
    {
      stepNumber: 3,
      title: 'Employer View Alerts & Interview Telemetry',
      trigger: '48 hours after room creation',
      openRate: sequence.openPercentage - 4,
      clickRate: sequence.clickPercentage + 2,
    },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        className="card animate-fade-in"
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius)',
          width: '100%',
          maxWidth: 620,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          padding: 24,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'rgba(59, 130, 246, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--info)',
              }}
            >
              <Mail size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--text)' }}>
                  {sequence.name}
                </h3>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    background: 'rgba(16, 185, 129, 0.1)',
                    color: 'var(--success)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    padding: '2px 8px',
                    borderRadius: 10,
                  }}
                >
                  Active Sequence
                </span>
              </div>
              <p style={{ fontSize: 12.5, color: 'var(--text-2)', margin: 0 }}>
                Step-by-step deliverability, click behavior, and signup conversion telemetry
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-ghost"
            style={{ padding: 6, borderRadius: '50%', color: 'var(--dim)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 4 Hero KPI Badges */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
          <div style={{ background: 'var(--panel-2)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: 12, textAlign: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--text-2)', display: 'block' }}>Total Sent</span>
            <strong style={{ fontSize: 16, color: 'var(--text)' }}>{formatNumber(sequence.sent)}</strong>
          </div>

          <div style={{ background: 'var(--panel-2)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: 12, textAlign: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--text-2)', display: 'block' }}>Open Rate</span>
            <strong style={{ fontSize: 16, color: 'var(--info)' }}>{sequence.openPercentage}%</strong>
          </div>

          <div style={{ background: 'var(--panel-2)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: 12, textAlign: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--text-2)', display: 'block' }}>Click Rate</span>
            <strong style={{ fontSize: 16, color: 'var(--sunset)' }}>{sequence.clickPercentage}%</strong>
          </div>

          <div style={{ background: 'var(--panel-2)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: 12, textAlign: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--text-2)', display: 'block' }}>Conversion</span>
            <strong style={{ fontSize: 16, color: 'var(--success)' }}>{sequence.signupConversionPercentage}%</strong>
          </div>
        </div>

        {/* Sequence Steps Breakdown */}
        <div style={{ marginBottom: 20 }}>
          <h4 style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text)', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Layers size={15} color="var(--accent)" />
            <span>Automated Steps in Sequence</span>
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {defaultSteps.map((st) => (
              <div
                key={st.stepNumber}
                style={{
                  background: 'var(--bg-main)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      background: 'var(--accent)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {st.stepNumber}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                      {st.title}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--dim)' }}>
                      Trigger: {st.trigger}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'right' }}>
                  <div>
                    <span style={{ fontSize: 10.5, color: 'var(--text-2)', display: 'block' }}>Open</span>
                    <strong style={{ fontSize: 12, color: 'var(--info)' }}>{st.openRate}%</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: 10.5, color: 'var(--text-2)', display: 'block' }}>Click</span>
                    <strong style={{ fontSize: 12, color: 'var(--sunset)' }}>{st.clickRate}%</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Device & Velocity Split */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <div style={{ background: 'var(--panel-2)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: 14 }}>
            <h5 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Monitor size={14} color="var(--accent)" />
              <span>Recipient Device Split</span>
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-2)' }}>Desktop:</span>
                <strong style={{ color: 'var(--text)' }}>{sequence.deviceSplit?.desktop || 68}%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-2)' }}>Mobile:</span>
                <strong style={{ color: 'var(--text)' }}>{sequence.deviceSplit?.mobile || 28}%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-2)' }}>Tablet:</span>
                <strong style={{ color: 'var(--text)' }}>{sequence.deviceSplit?.tablet || 4}%</strong>
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--panel-2)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: 14 }}>
            <h5 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={14} color="var(--warning)" />
              <span>Conversion Velocity</span>
            </h5>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--warning)', fontFamily: 'Sora, sans-serif' }}>
              {sequence.avgTimeToSignupHours} hours
            </div>
            <p style={{ fontSize: 11.5, color: 'var(--text-2)', margin: '4px 0 0 0' }}>
              Average duration from first email link click to completed candidate onboarding.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 12, borderTop: '1px solid var(--line)' }}>
          <button onClick={onClose} className="btn btn-ghost" style={{ fontSize: 13 }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
