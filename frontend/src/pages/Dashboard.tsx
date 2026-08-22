// src/pages/Dashboard.tsx
// Dynamic routing page dispatcher rendering the appropriate dashboard or platform view

import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Layout } from '../components/Layout/Layout';
import { SocialMediaTabs } from '../components/SocialMedia/SocialMediaTabs';
import { SocialMediaOverview } from '../components/SocialMedia/SocialMediaOverview';
import { LinkedInDetailedView } from '../components/SocialMedia/LinkedInDetailedView';
import { RedditDetailedView } from '../components/SocialMedia/RedditDetailedView';
import { CampaignList } from '../components/Campaigns/CampaignList';
import { CampaignPerformance } from '../components/Campaigns/CampaignPerformance';
import { EmailDetailedView } from '../components/Email/EmailDetailedView';
import { EmailDashboard } from '../components/Dashboard/EmailDashboard';
import { FunnelDashboard } from '../components/Dashboard/FunnelDashboard';
import { FeatureDashboard } from '../components/Dashboard/FeatureDashboard';
import { RetentionDashboard } from '../components/Dashboard/RetentionDashboard';
import { RoomInsightsDashboard } from '../components/Dashboard/RoomInsightsDashboard';

export const DashboardPage: React.FC = () => {
  const location = useLocation();
  const params = useParams<{ campaignId?: string }>();
  const pathname = location.pathname;

  const renderContent = () => {
    // 1. Social Media Views
    if (pathname.startsWith('/social-media/linkedin') || pathname.startsWith('/dashboard/social-media/linkedin')) {
      return (
        <>
          <SocialMediaTabs />
          <LinkedInDetailedView />
        </>
      );
    }

    if (pathname.startsWith('/social-media/reddit') || pathname.startsWith('/dashboard/social-media/reddit')) {
      return (
        <>
          <SocialMediaTabs />
          <RedditDetailedView />
        </>
      );
    }

    if (pathname === '/social-media/overview' || pathname === '/dashboard/social-media') {
      return (
        <>
          <SocialMediaTabs />
          <SocialMediaOverview />
        </>
      );
    }

    // 2. Marketing Campaigns Views
    if (params.campaignId || pathname.startsWith('/campaigns/') || pathname.startsWith('/dashboard/campaigns/')) {
      const campId = params.campaignId || pathname.split('/').pop() || 'camp_q3_launch';
      return (
        <>
          <SocialMediaTabs />
          <CampaignPerformance campaignId={campId} />
        </>
      );
    }

    if (pathname === '/campaigns' || pathname === '/dashboard/campaigns') {
      return (
        <>
          <SocialMediaTabs />
          <CampaignList />
        </>
      );
    }

    // 3. Email Detailed Analytics
    if (pathname === '/email/detailed' || pathname === '/dashboard/email/detailed') {
      return (
        <>
          <SocialMediaTabs />
          <EmailDetailedView />
        </>
      );
    }

    // 4. Base Dashboards
    if (pathname === '/dashboard/email') {
      return <EmailDashboard />;
    }

    if (pathname === '/dashboard/funnel') {
      return <FunnelDashboard />;
    }

    if (pathname === '/dashboard/features') {
      return <FeatureDashboard />;
    }

    if (pathname === '/dashboard/retention') {
      return <RetentionDashboard />;
    }

    if (pathname === '/dashboard/rooms') {
      return <RoomInsightsDashboard />;
    }

    // Default to Funnel Dashboard
    return <FunnelDashboard />;
  };

  return <Layout>{renderContent()}</Layout>;
};
