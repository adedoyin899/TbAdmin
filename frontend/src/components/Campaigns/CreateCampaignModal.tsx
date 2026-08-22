// src/components/Campaigns/CreateCampaignModal.tsx
// Interactive Modal for creating and launching cross-platform marketing campaigns

import React, { useState } from 'react';
import {
  X,
  Target,
  CheckCircle2,
} from 'lucide-react';
import { campaignApi } from '../../api/campaignApi';
import type { CampaignItem } from '../../types/socialMedia';


interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCampaignCreated: (newCamp: CampaignItem) => void;
}

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({
  isOpen,
  onClose,
  onCampaignCreated,
}) => {
  const [name, setName] = useState('');
  const [goal, setGoal] = useState<'signups' | 'awareness' | 'engagement' | 'retention'>('signups');
  const [channels, setChannels] = useState<string[]>(['linkedin', 'reddit', 'email']);
  const [budget, setBudget] = useState<number>(1000);
  const [targetAudience, setTargetAudience] = useState('Hiring Managers & Senior Tech Leads');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() =>
    new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0]
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleChannel = (ch: string) => {
    setChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const created = await campaignApi.createCampaign({
        name: name.trim(),
        goal,
        channels,
        budget: Number(budget),
        target_audience: targetAudience,
        start_date: startDate,
        end_date: endDate,
      });

      const fullItem: CampaignItem = {
        id: created.id || `camp_${Date.now()}`,
        name: name.trim(),
        goal,
        channels,
        budget: Number(budget),
        spend: 0,
        status: 'active',
        target_audience: targetAudience,
        start_date: startDate,
        end_date: endDate,
        created_by: 'peter@talentbridge.cv',
        performance_summary: {
          reach: 0,
          clicks: 0,
          signups: 0,
          engagement_rate: 0,
        },
      };

      onCampaignCreated(fullItem);
      onClose();
    } catch {
      // Offline fallback creation
      const fallbackItem: CampaignItem = {
        id: `camp_${Date.now()}`,
        name: name.trim(),
        goal,
        channels,
        budget: Number(budget),
        spend: 0,
        status: 'active',
        target_audience: targetAudience,
        start_date: startDate,
        end_date: endDate,
        created_by: 'peter@talentbridge.cv',
        performance_summary: {
          reach: 0,
          clicks: 0,
          signups: 0,
          engagement_rate: 0,
        },
      };
      onCampaignCreated(fallbackItem);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

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
          maxWidth: 540,
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
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, var(--accent) 0%, #14B8A6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
              }}
            >
              <Target size={18} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--text)' }}>
                Create Marketing Campaign
              </h3>
              <p style={{ fontSize: 12.5, color: 'var(--text-2)', margin: 0 }}>
                Track multi-touch attribution across Email, LinkedIn &amp; Reddit
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

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Campaign Name */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
              Campaign Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Q4 Technical Showcase Hiring Sprint"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'var(--panel-2)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text)',
                fontSize: 13,
                outline: 'none',
              }}
            />
          </div>

          {/* Goal & Budget */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
                Primary Goal
              </label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: 'var(--panel-2)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text)',
                  fontSize: 13,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="signups">Signups (Candidate &amp; Recruiter)</option>
                <option value="awareness">Brand Awareness &amp; Reach</option>
                <option value="engagement">Engagement &amp; Comments</option>
                <option value="retention">Room Views &amp; Retention</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
                Total Budget ($ USD)
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: 'var(--panel-2)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text)',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Target Audience */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
              Target Audience
            </label>
            <input
              type="text"
              placeholder="e.g. Hiring Managers, Engineering Leads, Junior Developers"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'var(--panel-2)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text)',
                fontSize: 13,
                outline: 'none',
              }}
            />
          </div>

          {/* Active Channels */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
              Distribution Channels
            </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { id: 'linkedin', label: 'LinkedIn Organic & Ads', color: '#0A66C2' },
                { id: 'reddit', label: 'Reddit Communities', color: '#FF4500' },
                { id: 'email', label: 'Mailgun Email Sequences', color: 'var(--info)' },
                { id: 'buffer', label: 'Buffer Cross-Queue', color: 'var(--success)' },
              ].map((ch) => {
                const isSelected = channels.includes(ch.id);
                return (
                  <button
                    type="button"
                    key={ch.id}
                    onClick={() => toggleChannel(ch.id)}
                    className="btn"
                    style={{
                      fontSize: 12,
                      padding: '6px 12px',
                      borderRadius: 16,
                      background: isSelected ? 'var(--panel-2)' : 'transparent',
                      border: isSelected ? `1.5px solid ${ch.color}` : '1px solid var(--line)',
                      color: isSelected ? 'var(--text)' : 'var(--dim)',
                      fontWeight: isSelected ? 600 : 400,
                    }}
                  >
                    {isSelected && <CheckCircle2 size={12} color={ch.color} style={{ marginRight: 4 }} />}
                    {ch.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Range */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: 'var(--panel-2)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text)',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
                End Date (Optional)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: 'var(--panel-2)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text)',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              style={{ fontSize: 13 }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="btn btn-primary"
              style={{
                fontSize: 13,
                padding: '8px 20px',
                background: 'linear-gradient(135deg, var(--accent) 0%, #14B8A6 100%)',
              }}
            >
              {isSubmitting ? 'Creating...' : 'Launch Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
