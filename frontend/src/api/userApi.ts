import apiClient from './client';
import MOCK_USERS from './mockData/users.json';
import MOCK_EVENTS from './mockData/events.json';
import MOCK_ROOMS from './mockData/rooms.json';
import type { RoomInsight } from '../types';

const USE_MOCK_ONLY = import.meta.env.VITE_USE_MOCK_DATA === 'true';

const EMAIL_ENGAGEMENT: Record<string, { campaignName: string; sent: string; opened: string | null; clicked: boolean }[]> = {
  user_123abc: [
    { campaignName: 'Welcome Email', sent: '2026-08-01T14:25:00Z', opened: '2026-08-01T14:45:00Z', clicked: true },
    { campaignName: 'Showcase Tips', sent: '2026-08-03T10:00:00Z', opened: '2026-08-03T12:30:00Z', clicked: false },
    { campaignName: 'Feature Update — Aug', sent: '2026-08-10T09:00:00Z', opened: '2026-08-10T11:30:00Z', clicked: true },
  ],
  user_456def: [
    { campaignName: 'Welcome Email', sent: '2026-08-05T10:05:00Z', opened: '2026-08-05T10:30:00Z', clicked: true },
    { campaignName: 'Showcase Tips', sent: '2026-08-07T10:00:00Z', opened: null, clicked: false },
    { campaignName: 'Feature Update — Aug', sent: '2026-08-10T09:00:00Z', opened: null, clicked: false },
  ],
  user_789ghi: [
    { campaignName: 'Welcome Email', sent: '2026-08-10T09:20:00Z', opened: '2026-08-10T10:00:00Z', clicked: false },
    { campaignName: 'Showcase Tips', sent: '2026-08-12T10:00:00Z', opened: null, clicked: false },
  ],
  user_321jkl: [
    { campaignName: 'Welcome Email', sent: '2026-07-28T08:10:00Z', opened: '2026-07-28T09:00:00Z', clicked: true },
    { campaignName: 'Showcase Tips', sent: '2026-07-30T10:00:00Z', opened: '2026-07-30T14:00:00Z', clicked: true },
    { campaignName: 'Re-engagement Campaign', sent: '2026-08-15T09:00:00Z', opened: '2026-08-15T10:00:00Z', clicked: true },
    { campaignName: 'Feature Update — Aug', sent: '2026-08-10T09:00:00Z', opened: '2026-08-10T11:00:00Z', clicked: false },
  ],
  user_654mno: [
    { campaignName: 'Welcome Email', sent: '2026-08-12T16:50:00Z', opened: '2026-08-12T17:00:00Z', clicked: true },
    { campaignName: 'Showcase Tips', sent: '2026-08-14T10:00:00Z', opened: null, clicked: false },
    { campaignName: 'Feature Update — Aug', sent: '2026-08-10T09:00:00Z', opened: '2026-08-13T08:00:00Z', clicked: true },
  ],
  user_987pqr: [
    { campaignName: 'Welcome Email', sent: '2026-07-15T11:35:00Z', opened: '2026-07-15T12:00:00Z', clicked: true },
    { campaignName: 'Showcase Tips', sent: '2026-07-17T10:00:00Z', opened: '2026-07-17T11:00:00Z', clicked: true },
    { campaignName: 'Re-engagement Campaign', sent: '2026-08-15T09:00:00Z', opened: null, clicked: false },
    { campaignName: 'Feature Update — Aug', sent: '2026-08-10T09:00:00Z', opened: '2026-08-11T09:00:00Z', clicked: true },
  ],
};

export const userApi = {
  searchUsers: async (query: string = '') => {
    if (!USE_MOCK_ONLY) {
      try {
        const res: any = await apiClient.get('/users/search', {
          params: { q: query },
        });
        if (res && res.results) return res;
      } catch {}
    }

    const q = query.toLowerCase();
    const results = MOCK_USERS.results.filter(
      u =>
        u.email.toLowerCase().includes(q) ||
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q) ||
        u.userId.toLowerCase().includes(q)
    );
    return { results };
  },

  getUserProfile: async (userId: string) => {
    if (!USE_MOCK_ONLY) {
      try {
        const res: any = await apiClient.get(`/users/${userId}`);
        if (res && res.user) return res;
      } catch {}
    }

    const user = MOCK_USERS.results.find(u => u.userId === userId) || MOCK_USERS.results[0];
    const events = (MOCK_EVENTS.byUser as Record<string, unknown[]>)[userId]
      || (MOCK_EVENTS.byUser as Record<string, unknown[]>)['user_123abc'];
    const emailEngagement = EMAIL_ENGAGEMENT[userId] || EMAIL_ENGAGEMENT['user_123abc'];
    const roomInsights = (MOCK_ROOMS.roomsByUser as unknown as Record<string, RoomInsight[]>)[userId]
      || (MOCK_ROOMS.roomsByUser as unknown as Record<string, RoomInsight[]>)['user_123abc'] || [];

    return {
      user,
      events,
      emailEngagement,
      roomInsights,
      postHogSessionReplayUrl: `https://app.posthog.com/project/ph_proj_live/replay/${userId}`,
    };
  },

  getUserOverview: async (horizon: string = '30d') => {
    if (!USE_MOCK_ONLY) {
      try {
        const res: any = await apiClient.get('/users/overview', {
          params: { horizon },
        });
        if (res && res.lifetime) return res;
      } catch {}
    }

    return {
      horizon,
      lastSynced: new Date().toISOString(),
      postHogConnected: true,
      projectId: '120100',
      host: 'https://eu.i.posthog.com',
      lifetime: {
        totalRegisteredUsers: 12450,
        totalIdentifiedUsers: 10810,
        totalRecordedSessions: 248,
        totalEventsTracked: 48290,
      },
      recent: {
        totalUsers: 1247,
        activeUsers: 8920,
        verifiedAccounts: 10810,
        newSignups: 1247,
        growthPercentage: 16.4,
        verifiedRate: 86.8,
        activePercentage: 71.6,
      },
      trajectory: [
        { month: 'Jan', totalUsers: 1420, verifiedUsers: 1180 },
        { month: 'Feb', totalUsers: 2150, verifiedUsers: 1890 },
        { month: 'Mar', totalUsers: 1880, verifiedUsers: 1620 },
        { month: 'Apr', totalUsers: 1350, verifiedUsers: 1140 },
        { month: 'May', totalUsers: 2640, verifiedUsers: 2310 },
        { month: 'Jun', totalUsers: 3010, verifiedUsers: 2670 },
      ],
      acquisitionChannels: [
        { name: 'Organic Search & Social', count: '5,602', percentage: 45 },
        { name: 'Email Campaigns', count: '2,739', percentage: 22 },
        { name: 'Creator Referrals', count: '2,241', percentage: 18 },
        { name: 'Paid Ads', count: '1,868', percentage: 15 },
      ],
      geographicDemographics: [
        { country: 'United Kingdom', code: 'GB', flag: '🇬🇧', users: 5420, percentage: 42 },
        { country: 'United States', code: 'US', flag: '🇺🇸', users: 3820, percentage: 30 },
        { country: 'Ghana', code: 'GH', flag: '🇬🇭', users: 1420, percentage: 11 },
        { country: 'Italy', code: 'IT', flag: '🇮🇹', users: 1180, percentage: 9 },
      ],
      technology: {
        browsers: [{ name: 'Chrome', count: 62 }, { name: 'Brave', count: 24 }, { name: 'Safari', count: 14 }],
        operatingSystems: [{ name: 'macOS', count: 54 }, { name: 'Windows', count: 36 }, { name: 'Linux', count: 10 }],
      },
      topEntryUrls: [
        { url: 'https://talentbridge.cv/', count: 340 },
        { url: 'https://talentbridge.cv/dashboard', count: 190 },
        { url: 'https://talentbridge.cv/create-room', count: 145 },
      ],
    };
  },

  getSessionRecordings: async (limit: number = 25, distinctId?: string) => {
    if (!USE_MOCK_ONLY) {
      try {
        const res: any = await apiClient.get('/users/recordings', {
          params: { limit, distinctId },
        });
        if (res && res.results) return res;
      } catch {}
    }

    return {
      results: [
        {
          id: '01a03e66-26bc-77fa-b070-ce6ffe07fb7c',
          distinctId: '82',
          duration: 9,
          activeSeconds: 8,
          startTime: new Date(Date.now() - 3600000).toISOString(),
          endTime: new Date(Date.now() - 3591000).toISOString(),
          startUrl: 'https://talentbridge.cv/r/qoZEay2DqnaV0w2qHh0Sti5BfYTncSOys1kj2TVy2kDFRjxznXdSWxDfl65NYWvs',
          clickCount: 2,
          keypressCount: 0,
          mouseActivityCount: 18,
          viewed: false,
          pinned: false,
          postHogReplayUrl: 'https://eu.i.posthog.com/project/120100/replay/01a03e66-26bc-77fa-b070-ce6ffe07fb7c',
          snapshotsUrl: '/api/users/recordings/01a03e66-26bc-77fa-b070-ce6ffe07fb7c/snapshots',
        },
        {
          id: '01a03df7-5a26-7631-ac32-1a4015559b49',
          distinctId: '80',
          duration: 39,
          activeSeconds: 15,
          startTime: new Date(Date.now() - 7200000).toISOString(),
          endTime: new Date(Date.now() - 7161000).toISOString(),
          startUrl: 'https://talentbridge.cv/dashboard',
          clickCount: 4,
          keypressCount: 12,
          mouseActivityCount: 45,
          viewed: true,
          pinned: false,
          postHogReplayUrl: 'https://eu.i.posthog.com/project/120100/replay/01a03df7-5a26-7631-ac32-1a4015559b49',
          snapshotsUrl: '/api/users/recordings/01a03df7-5a26-7631-ac32-1a4015559b49/snapshots',
        },
      ],
    };
  },

  getRecordingSnapshots: async (recordingId: string) => {
    if (!USE_MOCK_ONLY) {
      try {
        const res: any = await apiClient.get(`/users/recordings/${recordingId}/snapshots`);
        if (res) return res;
      } catch {}
    }
    return { sources: [] };
  },
};
