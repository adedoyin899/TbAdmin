import MOCK_USERS from './mockData/users.json';
import MOCK_EVENTS from './mockData/events.json';
import MOCK_ROOMS from './mockData/rooms.json';
import type { RoomInsight } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
  searchUsers: async (query: string) => {
    await delay(300);
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
    await delay(350);
    const user = MOCK_USERS.results.find(u => u.userId === userId) || MOCK_USERS.results[0];
    const events = (MOCK_EVENTS.byUser as Record<string, unknown[]>)[userId]
      || (MOCK_EVENTS.byUser as Record<string, unknown[]>)['user_123abc'];
    const emailEngagement = EMAIL_ENGAGEMENT[userId] || EMAIL_ENGAGEMENT['user_123abc'];
    const roomInsights = ((MOCK_ROOMS.roomsByUser as Record<string, RoomInsight[]>)[userId] || []) as RoomInsight[];

    return {
      user,
      events,
      emailEngagement,
      roomInsights,
      postHogSessionReplayUrl: `https://posthog.example.com/sessions/sess_${userId.slice(-6)}`,
    };
  },
};
