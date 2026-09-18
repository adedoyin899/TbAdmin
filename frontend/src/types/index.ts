// ── Dashboard Types ──────────────────────────────────────────

export interface FunnelStageDetail {
  deviceBreakdown: { name: string; percentage: number }[];
  medianDurationSeconds: number | null;
  medianDurationLabel: string | null;
  dropOffSummary: string;
  sampleUsers: { userId: string; name: string; email: string; country: string; source: string; lastSeen: string }[];
}

export interface FunnelStage {
  stage: string;
  count: number;
  percentage: number;
  detail?: FunnelStageDetail;
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
  weekNumber?: number;
  period: string;
  dateRangeFormatted?: string;
  shortRange?: string;
  startDate?: string;
  endDate?: string;
  isCurrentCohort?: boolean;
  retention7d: number;
  retention30d: number;
  day1?: number;
  day7?: number;
  day14?: number;
  day30?: number;
  newUsers?: number;
  topReturningAction?: string;
  activeUsers?: Array<{
    userId: string;
    name: string;
    email: string;
    country: string;
    flag: string;
    sessions: number;
    lastActive: string | null;
    topAction: string;
  }>;
}

export interface RetentionDashboardResponse {
  dateRange?: string;
  signupSource?: string;
  retention7d: { percentage: number; change: number };
  retention30d: { percentage: number; change: number };
  trend: RetentionTrendEntry[];
  cachedAt?: string;
  expiresAt?: string;
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
  // Not derivable: PostHog doesn't record which content blocks a creator placed in a room.
  blocksUsed?: string[] | null;
  // Whether ownership was matched by an explicit author-name signal ("confirmed") or only by
  // this person being the room's first-ever recorded visitor ("inferred") — there's no stable
  // room_owner_id in PostHog yet, so this is a best-effort signal, not a guarantee.
  ownerConfidence?: 'confirmed' | 'inferred';
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
    ownerDistinctId?: string;
    ownerIdConfirmed?: boolean;
    views: number;
    uniqueViews: number;
    engagement: number;
    rageClicks?: number;
  }[];
}

export interface WebsiteDashboardResponse {
  dateRange: string;
  postHogConnected: boolean;
  summary: {
    totalPageviews: number;
    uniqueVisitors: number;
    totalSessions: number;
    avgSessionDuration: string;
    bounceRate: number;
    avgPageDwellTime?: string;
    avgScrollDepth?: number;
    avgContentDepth?: number;
  };
  pageviewsTrend: { date: string; pageviews: number; uniqueVisitors: number }[];
  topPages: { path: string; views: number; uniqueVisitors: number; percentage: number }[];
  trafficSources: { name: string; count: number; percentage: number }[];
  acquisitionChannels?: { name: string; count: number; percentage: number; color?: string }[];
  devices: { name: string; count: number; percentage: number }[];
  browsers: { name: string; count: number; percentage: number; topVersion?: string | null }[];
  operatingSystems: { name: string; count: number; percentage: number; topVersion?: string | null }[];
  geoTraffic: { country: string; code: string; flag: string; views: number; percentage: number }[];
  topCities?: { city: string; region: string; country: string; views: number; percentage: number }[];
  topActions?: { text: string; count: number; urls: string[] }[];
}

export interface ErrorIssue {
  issueId: string;
  type: string;
  message: string;
  level: string;
  handled: boolean;
  occurrences: number;
  firstSeen: string;
  lastSeen: string;
  urls: string[];
  browsers: string[];
  affectedUsers: { distinctId: string; name: string | null; email: string | null }[];
}

export interface ErrorMonitoringResponse {
  dateRange: string;
  totalExceptions: number;
  unhandledCount: number;
  issues: ErrorIssue[];
  cachedAt?: string;
}

export interface User {
  userId: string;
  distinctId?: string;
  email: string;
  firstName: string;
  lastName: string;
  signupDate: string;
  country: string;
  countryCode?: string;
  city?: string;
  browser?: string;
  os?: string;
  deviceType?: string;
  initialUrl?: string;
  initialReferrer?: string;
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
  properties?: Record<string, unknown>;
  distinctIds?: string[];
  rawPerson?: Record<string, unknown>;
  emailEngagement: EmailEngagement[];
  roomInsights?: RoomInsight[];
  postHogSessionReplayUrl: string;
  postHogPersonUrl?: string;
  postHogEventsUrl?: string;
}

export interface UserOverviewStats {
  horizon: string;
  lastSynced: string;
  postHogConnected: boolean;
  projectId: string;
  host: string;
  lifetime: {
    totalRegisteredUsers: number;
    totalIdentifiedUsers: number;
    totalRecordedSessions: number;
    totalEventsTracked: number;
  };
  recent: {
    totalUsers: number;
    activeUsers: number;
    verifiedAccounts: number;
    newSignups: number;
    growthPercentage: number;
    verifiedRate: number;
    activePercentage: number;
  };
  trajectory: { month: string; totalUsers: number; verifiedUsers: number }[];
  acquisitionChannels: { name: string; count: string | number; percentage: number }[];
  geographicDemographics: { country: string; code: string; flag: string; users: number; percentage: number }[];
  technology: {
    browsers: { name: string; count: number }[];
    operatingSystems: { name: string; count: number }[];
  };
  topEntryUrls: { url: string; count: number }[];
}

export interface SessionRecording {
  id: string;
  distinctId: string;
  userName?: string | null;
  userEmail?: string | null;
  duration: number;
  activeSeconds: number;
  startTime: string;
  endTime: string;
  startUrl: string;
  clickCount: number;
  keypressCount: number;
  mouseActivityCount: number;
  viewed: boolean;
  pinned: boolean;
  postHogReplayUrl: string;
  snapshotsUrl: string;
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

