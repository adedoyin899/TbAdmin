// ── Dashboard Types ──────────────────────────────────────────

export interface FunnelStage {
  stage: string;
  count: number;
  percentage: number;
}

export interface Dropoff {
  from: string;
  to: string;
  percentage: number;
}

export interface FunnelDashboardResponse {
  funnel: FunnelStage[];
  dropoff: Dropoff[];
  cachedAt: string;
  expiresAt: string;
}

export interface BlockAdoption {
  blockType: string;
  count: number;
  percentage: number;
}

export interface ThemeEntry {
  theme: string;
  count: number;
  percentage: number;
}

export interface FeaturesDashboardResponse {
  blockAdoption: BlockAdoption[];
  themeDistribution: ThemeEntry[];
}

export interface RetentionTrendEntry {
  week: string;
  retention7d: number;
  retention30d: number;
}

export interface RetentionDashboardResponse {
  retention7d: { percentage: number; change: number };
  retention30d: { percentage: number; change: number };
  trend: RetentionTrendEntry[];
}

export interface EmailCampaign {
  campaignId: string;
  campaignName: string;
  sentDate: string;
  sentCount: number;
  openCount: number;
  openPercentage: number;
  clickCount: number;
  clickPercentage: number;
  bounceCount: number;
  unsubscribeCount: number;
}

export interface EmailDashboardResponse {
  campaigns: EmailCampaign[];
  topPerformers: { campaignName: string; clickPercentage: number }[];
}

// ── User Types ───────────────────────────────────────────────

export interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  signupDate: string;
  country: string;
  signupSource: string;
  planTier: string;
  lastActive: string;
}

export interface UserEvent {
  eventId: string;
  eventName: string;
  timestamp: string;
  properties: Record<string, unknown>;
}

export interface EmailEngagement {
  campaignName: string;
  sent: string;
  opened: string | null;
  clicked: boolean;
}

export interface UserProfile {
  user: User;
  events: UserEvent[];
  emailEngagement: EmailEngagement[];
  postHogSessionReplayUrl: string;
}

// ── Auth Types ───────────────────────────────────────────────

export type UserRole = 'admin' | 'product' | 'marketing' | 'operations' | 'intern';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}
