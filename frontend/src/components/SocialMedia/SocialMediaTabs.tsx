// src/components/SocialMedia/SocialMediaTabs.tsx
// Universal Tab Navigation Component for switching between Social Overview, LinkedIn, Reddit, Campaigns, and Email Analytics

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Share2,
  MessageSquare,
  Target,
  Mail,
} from 'lucide-react';

import { LinkedInIcon } from './PlatformCard';

interface TabItem {
  id: string;
  label: string;
  path: string;
  aliases: string[];
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
}

export const SocialMediaTabs: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs: TabItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      path: '/dashboard/social-media',
      aliases: ['/social-media/overview', '/dashboard/social-media'],
      icon: <Share2 size={15} />,
    },
    {
      id: 'linkedin',
      label: 'LinkedIn Organic',
      path: '/social-media/linkedin',
      aliases: ['/social-media/linkedin', '/dashboard/social-media/linkedin'],
      icon: <LinkedInIcon size={15} />,
      badge: '4.18% CTR',
      badgeColor: '#0A66C2',
    },
    {
      id: 'reddit',
      label: 'Reddit Community',
      path: '/social-media/reddit',
      aliases: ['/social-media/reddit', '/dashboard/social-media/reddit'],
      icon: <MessageSquare size={15} color="#FF4500" />,
      badge: '+1,240',
      badgeColor: '#FF4500',
    },
    {
      id: 'campaigns',
      label: 'Campaign ROI',
      path: '/campaigns',
      aliases: ['/campaigns', '/dashboard/campaigns'],
      icon: <Target size={15} color="var(--accent)" />,
      badge: 'Multi-Touch',
      badgeColor: 'var(--accent)',
    },
    {
      id: 'email-detailed',
      label: 'Email Heatmap & Timing',
      path: '/email/detailed',
      aliases: ['/email/detailed', '/dashboard/email/detailed'],
      icon: <Mail size={15} color="var(--info)" />,
      badge: 'Mailgun v2',
      badgeColor: 'var(--info)',
    },
  ];

  const isTabActive = (tab: TabItem) => {
    return tab.aliases.some((alias) => location.pathname.startsWith(alias));
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 8px',
        background: 'var(--panel)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-sm)',
        overflowX: 'auto',
        marginBottom: 20,
      }}
      className="no-scrollbar"
    >
      {tabs.map((tab) => {
        const active = isTabActive(tab);
        return (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              border: active ? '1px solid var(--line-2)' : '1px solid transparent',
              background: active ? 'var(--panel-2)' : 'transparent',
              color: active ? 'var(--text)' : 'var(--text-2)',
              fontSize: 13,
              fontWeight: active ? 700 : 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge && (
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: 10,
                  background: active ? 'var(--panel-3)' : 'var(--panel-2)',
                  color: tab.badgeColor || 'var(--text-2)',
                  border: '1px solid var(--line)',
                }}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
