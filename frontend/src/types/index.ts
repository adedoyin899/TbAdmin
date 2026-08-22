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
  category?: string;
  description?: string;
  count: number;
  percentage: number;
  growth?: string;
  recruiterClickRate?: string;
  dwellTimeBoost?: string;
}

export interface TemplateAdoption {
  templateName: string;
  category?: string;
  description?: string;
  count: number;
  percentage: number;
  growth?: string;
  includedBlocks?: string[];
  recruiterClickRate?: string;
  dwellTimeBoost?: string;
}

export interface ThemeEntry {
  theme: string;
  count: number;
  percentage: number;
}

export interface FeaturesDashboardResponse {
  totalRoomsCreated?: number;
  topBlocks?: BlockAdoption[];
  blockAdoption: BlockAdoption[];
  templateAdoption?: TemplateAdoption[];
  themeDistribution: ThemeEntry[];
  cachedAt?: string;
  expiresAt?: string;
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

export interface EmailLinkClick {
  url: string;
  label: string;
  clicks: number;
  percentage: number;
}

export interface EmailHourlyEngagement {
  hour: string;
  opens: number;
  clicks: number;
}

export interface EmailRecipientLog {
  recipientId: string;
  name: string;
  email: string;
  status: 'opened' | 'clicked' | 'delivered' | 'bounced';
  sentAt: string;
  openedAt?: string;
  clickedAt?: string;
  client: string;
  device: string;
}

export interface EmailCampaign {
  campaignId: string;
  campaignName: string;
  subjectLine?: string;
  triggerType?: string;
  targetAudience?: string;
  sentDate: string;
  sentCount: number;
  deliveredCount?: number;
  openCount: number;
  openPercentage: number;
  clickCount: number;
  clickPercentage: number;
  bounceCount: number;
  unsubscribeCount: number;
  ctor?: number;
  links?: EmailLinkClick[];
  hourlyEngagement?: EmailHourlyEngagement[];
  recipients?: EmailRecipientLog[];
  previewHtml?: string;
}

export interface EmailDashboardResponse {
  campaigns: EmailCampaign[];
  topPerformers: { campaignName: string; clickPercentage: number }[];
}

// ── User Types ───────────────────────────────────────────────

export interface ViewerLead {
  id: string;
  name: string;
  role: string;
  company: string;
  location: string;
  timeSpent: string;
  views: number | string;
  status: 'high_value' | 'new' | 'returning';
  lastVisit: string;
  avatarBg?: string;
}

export interface HeatmapCell {
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  timeSlot: '9 - 11 AM' | '11 - 1 PM' | '2 - 4 PM' | '4 - 6 PM' | '6 - 8 PM' | '8 - 10 PM' | '10 - 12 AM';
  views: number;
  intensity: 1 | 2 | 3 | 4; // 1: Low, 4: High
}

export interface CountryTraffic {
  country: string;
  code: string;
  flag: string;
  views: number;
  percentage: number;
}

export interface SmartRecommendation {
  id: string;
  title: string;
  description: string;
  actionText: string;
  actionType: 'update_room' | 'share_room';
  priority: 'Urgent' | 'Medium' | 'Low';
  iconType: 'sparkles' | 'image' | 'message' | 'share';
}

export interface RoomViewsTrend {
  month: string;
  totalViews: number;
  uniqueViews: number;
}

export interface RoomInsight {
  roomId: string;
  roomName: string;
  isPublished: boolean;
  publishedUrl?: string;
  createdAt: string;
  totalViews: { count: number; change: number };
  uniqueViews: { count: number; change: number };
  avgTimeSpent: { value: string; change: string };
  engagementQuality: { percentage: number; change: number };
  viewsTrend: RoomViewsTrend[];
  trafficSources: { name: string; count: string | number; percentage: number; color: string }[];
  devices: { name: string; count: string | number; percentage: number; color: string }[];
  viewers: ViewerLead[];
  heatmap: HeatmapCell[];
  geoTraffic: CountryTraffic[];
  recommendations: SmartRecommendation[];
}

export interface RoomsDashboardResponse {
  summary: {
    totalRooms: number;
    publishedRooms: number;
    totalViews: { count: number; change: number };
    uniqueViews: { count: number; change: number };
    avgTimeSpent: { value: string; change: string };
    engagementQuality: { percentage: number; change: number };
  };
  viewsTrend: RoomViewsTrend[];
  trafficSources: { name: string; count: string | number; percentage: number; color: string }[];
  devices: { name: string; count: string | number; percentage: number; color: string }[];
  heatmap: HeatmapCell[];
  geoTraffic: CountryTraffic[];
  topRecommendations: SmartRecommendation[];
  topPerformingRooms: {
    roomId: string;
    roomName: string;
    ownerName: string;
    ownerEmail: string;
    views: number;
    uniqueViews: number;
    engagement: number;
  }[];
}

export interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  signupDate: string;
  country: string;
  countryCode?: string;
  signupSource: string;
  planTier: string;
  lastActive: string;
  roomsCreated?: number;
  roomsPublished?: number;
  totalEvents?: number;
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
  roomInsights?: RoomInsight[];
  postHogSessionReplayUrl: string;
}

// ── Auth Types ───────────────────────────────────────────────

export type UserRole = 'Super Admin' | 'Admin' | 'Data Analyst' | 'Viewer' | 'admin' | 'product' | 'marketing' | 'operations' | 'intern' | string;

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  isOwner?: boolean;
}

export * from './socialMedia';

