import apiClient from './client';
import MOCK_FUNNEL from './mockData/funnel.json';
import MOCK_FEATURES from './mockData/features.json';
import MOCK_RETENTION from './mockData/retention.json';
import MOCK_EMAIL from './mockData/email.json';
import MOCK_ROOMS from './mockData/rooms.json';

const USE_MOCK_ONLY = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export const dashboardApi = {
  getFunnel: async (dateRange: string = '30d', signupSource: string = 'all') => {
    if (USE_MOCK_ONLY) return MOCK_FUNNEL;
    const res: any = await apiClient.get('/dashboard/funnel', { params: { dateRange, signupSource } });
    return res;
  },

  getFeatures: async (dateRange: string = '30d') => {
    if (USE_MOCK_ONLY) return MOCK_FEATURES;
    // No mock fallback on error: the real block/template catalog only carries honest 0%/"not yet
    // tracked" adoption (PostHog doesn't track room composition), and silently substituting the
    // old fabricated mock (fake creators, fake 60/40 theme split, fake growth %) on any transient
    // failure would defeat the point of that honesty. Let the UI's own error state handle it.
    const res: any = await apiClient.get('/dashboard/features', { params: { dateRange } });
    return res;
  },

  getRetention: async (dateRange: string = 'all', signupSource: string = 'all') => {
    if (USE_MOCK_ONLY) return MOCK_RETENTION;
    const res: any = await apiClient.get('/dashboard/retention', { params: { dateRange, signupSource } });
    return res;
  },

  getEmail: async (dateRange: string = '30d') => {
    if (USE_MOCK_ONLY) return MOCK_EMAIL;
    // No mock fallback on error or empty result: MOCK_EMAIL is a full fabricated campaign set
    // (fake recipients like "Alice Chen"/"Kwame Asante", fake open/click rates, fake HTML
    // previews) — silently rendering that instead of "no campaigns yet" is exactly the
    // fabrication pattern removed everywhere else.
    const res: any = await apiClient.get('/dashboard/email', { params: { dateRange } });
    return res;
  },

  getRoomsDashboard: async (dateRange: string = '30d') => {
    if (USE_MOCK_ONLY) {
      return {
        summary: MOCK_ROOMS.platformRoomsSummary,
        viewsTrend: MOCK_ROOMS.platformViewsTrend,
        trafficSources: MOCK_ROOMS.platformTrafficSources,
        devices: MOCK_ROOMS.platformDevices,
        heatmap: MOCK_ROOMS.platformHeatmap,
        geoTraffic: MOCK_ROOMS.platformGeoTraffic,
        topRecommendations: MOCK_ROOMS.platformRecommendations,
        topPerformingRooms: [
          { roomId: 'room_alice_01', roomName: "Alice's Portfolio", ownerName: 'Alice Chen', ownerEmail: 'alice@example.com', views: 1247, uniqueViews: 1092, engagement: 68.5 },
          { roomId: 'room_kwame_01', roomName: 'Kwame Asante — Dev', ownerName: 'Kwame Asante', ownerEmail: 'kwame@example.com', views: 2840, uniqueViews: 1845, engagement: 82.4 },
          { roomId: 'room_priya_01', roomName: 'Priya Sharma — UX', ownerName: 'Priya Sharma', ownerEmail: 'priya@example.com', views: 980, uniqueViews: 720, engagement: 74.1 },
          { roomId: 'room_sarah_01', roomName: 'Sarah Jenkins — Creative', ownerName: 'Sarah Jenkins', ownerEmail: 'sarah.jenkins@example.com', views: 1650, uniqueViews: 1210, engagement: 79.3 },
        ],
      };
    }
    // No mock fallback on error or on a genuinely empty result: a platform with zero rooms in
    // range is real information the "No Showcase Rooms Published Yet" empty state should show,
    // not a cue to silently render four fake creators (Alice Chen, Kwame Asante, ...) as if they
    // were live telemetry.
    const res: any = await apiClient.get('/dashboard/rooms', { params: { dateRange } });
    return res;
  },

  getWebsiteDashboard: async (dateRange: string = '30d') => {
    if (!USE_MOCK_ONLY) {
      try {
        const res: any = await apiClient.get('/dashboard/website', {
          params: { dateRange },
        });
        if (res && res.summary) return res;
      } catch {}
    }
    return {
      dateRange,
      postHogConnected: false,
      summary: {
        totalPageviews: 0,
        uniqueVisitors: 0,
        totalSessions: 0,
        avgSessionDuration: '0s',
        bounceRate: 0,
      },
      pageviewsTrend: [],
      topPages: [],
      trafficSources: [],
      devices: [],
      browsers: [],
      operatingSystems: [],
      geoTraffic: [],
    };
  },

  getErrors: async (dateRange: string = '30d') => {
    if (USE_MOCK_ONLY) {
      return { dateRange, totalExceptions: 0, unhandledCount: 0, issues: [] };
    }
    const res: any = await apiClient.get('/dashboard/errors', { params: { dateRange } });
    return res;
  },

  getNotifications: async () => {
    const res: any = await apiClient.get('/notifications');
    return res;
  },

  markAllNotificationsRead: async () => {
    const res: any = await apiClient.post('/notifications/read-all');
    return res;
  },

  markNotificationRead: async (id: string) => {
    const res: any = await apiClient.post(`/notifications/${id}/read`);
    return res;
  },


  deleteNotification: async (id: string) => {
    const res: any = await apiClient.delete(`/notifications/${id}`);
    return res;
  },

  getChannels: async (horizon: string = '30d') => {
    try {
      const res: any = await apiClient.get('/dashboard/channels', { params: { horizon } });
      if (res && (res.channels || res.postHogConnected !== undefined)) return res;
    } catch {}
    // Minimal fallback when PostHog is offline
    return {
      horizon,
      postHogConnected: false,
      totalUsers: 0,
      totalChannels: 0,
      channels: [],
      groups: {
        social: { label: 'Social & Messaging', count: 0, percentage: 0, channels: [] },
        search: { label: 'Organic Search', count: 0, percentage: 0, channels: [] },
        paid: { label: 'Paid Campaigns', count: 0, percentage: 0, channels: [] },
        direct: { label: 'Direct, Referral & Email', count: 0, percentage: 0, channels: [] },
      },
      lastSynced: new Date().toISOString(),
    };
  },
};

