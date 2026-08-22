import React, { useState } from 'react';
import {
  Target,
  Plus,
  Search,
  Mail,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';
import { useCampaignPerformance } from '../../hooks/useCampaignPerformance';
import { CampaignPerformance } from './CampaignPerformance';
import { LinkedInIcon } from '../SocialMedia/PlatformCard';
import { EmptyState } from '../Common/EmptyState';
import { SyncStatus } from '../Common/SyncStatus';
import { formatNumber } from '../../utils/formatters';


interface CampaignListProps {
  onSelectCampaign?: (campaignId: string) => void;
}

export const CampaignList: React.FC<CampaignListProps> = ({ onSelectCampaign }) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

  const { campaignsList, isLoading } = useCampaignPerformance(undefined, statusFilter);


  if (selectedCampaignId) {
    return (
      <CampaignPerformance
        campaignId={selectedCampaignId}
        onBack={() => setSelectedCampaignId(null)}
      />
    );
  }

  const filteredCampaigns = campaignsList.filter((camp) => {
    const matchesSearch =
      !searchQuery.trim() ||
      camp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      camp.target_audience?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      camp.goal.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getChannelBadge = (channel: string) => {
    switch (channel.toLowerCase()) {
      case 'linkedin':
        return (
          <span
            key={channel}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '2px 8px',
              borderRadius: 12,
              background: 'rgba(10, 102, 194, 0.1)',
              color: '#0A66C2',
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            <LinkedInIcon size={12} />
            LinkedIn
          </span>
        );
      case 'reddit':
        return (
          <span
            key={channel}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '2px 8px',
              borderRadius: 12,
              background: 'rgba(255, 69, 0, 0.1)',
              color: '#FF4500',
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            <MessageSquare size={12} />
            Reddit
          </span>
        );
      case 'email':
        return (
          <span
            key={channel}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '2px 8px',
              borderRadius: 12,
              background: 'rgba(59, 130, 246, 0.1)',
              color: 'var(--info)',
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            <Mail size={12} />
            Email
          </span>
        );
      default:
        return null;
    }
  };

  const handleCampaignClick = (id: string) => {
    if (onSelectCampaign) {
      onSelectCampaign(id);
    } else {
      setSelectedCampaignId(id);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">
      {/* Header Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: 'var(--sunset-glow)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--sunset)',
              }}
            >
              <Target size={20} />
            </div>
            <h2
              style={{
                fontFamily: 'Sora, sans-serif',
                fontSize: 24,
                fontWeight: 700,
                color: 'var(--text)',
                letterSpacing: '-0.02em',
                margin: 0,
              }}
            >
              Marketing &amp; Growth Campaigns
            </h2>
            <span
              className="badge"
              style={{
                background: 'rgba(250, 82, 15, 0.1)',
                color: 'var(--sunset)',
                border: '1px solid rgba(250, 82, 15, 0.25)',
                fontSize: 11.5,
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 20,
              }}
            >
              Cross-Platform Attribution
            </span>
          </div>
          <p style={{ color: 'var(--text-2)', fontSize: 13.5, margin: 0 }}>
            Unified cross-channel tracking connecting Mailgun sequences, LinkedIn organic UGC, and Reddit communities.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <SyncStatus platform="all" />

          <button
            className="btn btn-primary"
            style={{
              fontSize: 13,
              gap: 6,
              background: 'linear-gradient(135deg, var(--accent) 0%, #14B8A6 100%)',
            }}
            onClick={() => handleCampaignClick('camp_q3_launch')}
          >
            <Plus size={15} />
            New Campaign
          </button>
        </div>
      </div>


      {/* Filter & Search Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          padding: '12px 16px',
          background: 'var(--panel)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius-sm)',
        }}
      >
        {/* Status Filters */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['all', 'active', 'completed', 'planning'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className="btn"
              style={{
                padding: '6px 14px',
                fontSize: 12.5,
                fontWeight: 600,
                borderRadius: 20,
                textTransform: 'capitalize',
                background: statusFilter === status ? 'var(--accent)' : 'var(--panel-2)',
                color: statusFilter === status ? '#FFFFFF' : 'var(--text-2)',
                border: statusFilter === status ? 'none' : '1px solid var(--line)',
              }}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            minWidth: 260,
          }}
        >
          <Search
            size={15}
            color="var(--dim)"
            style={{ position: 'absolute', left: 10, pointerEvents: 'none' }}
          />
          <input
            type="text"
            placeholder="Search campaigns, goals, audience..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '7px 12px 7px 32px',
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

      {/* Campaign Cards Grid */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner" />
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <EmptyState
          title="No marketing campaigns found"
          description="No campaigns matched your search or status filter. Reset filters to see all campaigns."
          actionLabel="Show All Campaigns"
          onAction={() => {
            setStatusFilter('all');
            setSearchQuery('');
          }}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
          {filteredCampaigns.map((camp) => {
            const perf = camp.performance_summary || {
              reach: 12000,
              clicks: 180,
              signups: 24,
              engagement_rate: 4.2,
            };



          return (
            <div
              key={camp.id}
              onClick={() => handleCampaignClick(camp.id)}
              className="card card-hover"
              style={{
                background: 'var(--panel)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius)',
                padding: 22,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background:
                    camp.status === 'active'
                      ? 'linear-gradient(90deg, var(--accent) 0%, #14B8A6 100%)'
                      : 'linear-gradient(90deg, #3B82F6 0%, #60A5FA 100%)',
                }}
              />

              <div>
                {/* Status & Goal Badges */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 12,
                      background:
                        camp.status === 'active'
                          ? 'rgba(16, 185, 129, 0.12)'
                          : 'rgba(59, 130, 246, 0.12)',
                      color: camp.status === 'active' ? 'var(--success)' : 'var(--info)',
                      border: `1px solid ${camp.status === 'active' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(59, 130, 246, 0.25)'}`,
                      textTransform: 'capitalize',
                    }}
                  >
                    {camp.status}
                  </span>

                  <span style={{ fontSize: 11.5, color: 'var(--text-2)', textTransform: 'capitalize' }}>
                    Goal: <strong>{camp.goal}</strong>
                  </span>
                </div>

                {/* Campaign Title */}
                <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 17, fontWeight: 700, color: 'var(--text)', margin: '0 0 6px 0' }}>
                  {camp.name}
                </h3>

                <p style={{ fontSize: 12.5, color: 'var(--text-2)', margin: '0 0 14px 0' }}>
                  {camp.target_audience || 'Multi-platform talent outreach'}
                </p>

                {/* Channels Badges */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
                  {camp.channels?.map(getChannelBadge)}
                </div>

                {/* Quick Performance Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: 8,
                    background: 'var(--panel-2)',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 12px',
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <span style={{ fontSize: 10.5, color: 'var(--text-2)', display: 'block' }}>Reach</span>
                    <strong style={{ fontSize: 13, color: 'var(--text)' }}>{formatNumber(perf.reach)}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: 10.5, color: 'var(--text-2)', display: 'block' }}>Eng. Rate</span>
                    <strong style={{ fontSize: 13, color: 'var(--info)' }}>{perf.engagement_rate}%</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: 10.5, color: 'var(--text-2)', display: 'block' }}>Clicks</span>
                    <strong style={{ fontSize: 13, color: 'var(--sunset)' }}>{perf.clicks}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: 10.5, color: 'var(--text-2)', display: 'block' }}>Signups</span>
                    <strong style={{ fontSize: 13, color: 'var(--success)' }}>{perf.signups}</strong>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 12,
                  borderTop: '1px solid var(--line)',
                  fontSize: 12,
                }}
              >
                <span style={{ color: 'var(--text-2)' }}>
                  Spend: <strong>${formatNumber(camp.spend || camp.budget || 0)}</strong>
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--accent)', fontWeight: 600 }}>
                  <span>View ROI Telemetry</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};

