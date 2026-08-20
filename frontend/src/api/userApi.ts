import MOCK_USERS from './mockData/users.json';
import MOCK_EVENTS from './mockData/events.json';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
    return {
      user,
      events: MOCK_EVENTS.events,
      emailEngagement: [
        { campaignName: 'Welcome Email', sent: '2026-08-01T14:25:00Z', opened: '2026-08-01T14:45:00Z', clicked: true },
        { campaignName: 'Showcase Tips', sent: '2026-08-03T10:00:00Z', opened: null, clicked: false },
        { campaignName: 'Feature Update — Aug', sent: '2026-08-10T09:00:00Z', opened: '2026-08-10T11:30:00Z', clicked: true },
      ],
      postHogSessionReplayUrl: 'https://posthog.example.com/sessions/sess_123abc',
    };
  },
};
