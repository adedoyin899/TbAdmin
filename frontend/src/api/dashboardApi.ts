import apiClient from './client';
import MOCK_FUNNEL from './mockData/funnel.json';
import MOCK_FEATURES from './mockData/features.json';
import MOCK_RETENTION from './mockData/retention.json';
import MOCK_EMAIL from './mockData/email.json';
import MOCK_ROOMS from './mockData/rooms.json';

const USE_MOCK_ONLY = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export const dashboardApi = {
  getFunnel: async (dateRange: string = '30d', signupSource: string = 'all') => {
    if (!USE_MOCK_ONLY) {
      try {
        const res: any = await apiClient.get('/dashboard/funnel', {
          params: { dateRange, signupSource },
        });
        if (res && res.funnel && res.funnel.length > 0) return res;
      } catch {}
    }
    return MOCK_FUNNEL;
  },

  getFeatures: async (dateRange: string = '30d') => {
    if (!USE_MOCK_ONLY) {
      try {
        const res: any = await apiClient.get('/dashboard/features', {
          params: { dateRange },
        });
        if (res && res.topBlocks && res.topBlocks.length > 0) return res;
      } catch {}
    }
    return MOCK_FEATURES;
  },

  getRetention: async (signupSource: string = 'all') => {
    if (!USE_MOCK_ONLY) {
      try {
        const res: any = await apiClient.get('/dashboard/retention', {
          params: { signupSource },
        });
        if (res && (res.retention7d || res.trend)) return res;
      } catch {}
    }
    return MOCK_RETENTION;
  },

  getEmail: async (dateRange: string = '30d') => {
    if (!USE_MOCK_ONLY) {
      try {
        const res: any = await apiClient.get('/dashboard/email', {
          params: { dateRange },
        });
        if (res && res.campaigns && res.campaigns.length > 0) return res;
      } catch {}
    }
    return MOCK_EMAIL;
  },

  getRoomsDashboard: async (dateRange: string = '30d') => {
    if (!USE_MOCK_ONLY) {
      try {
        const res: any = await apiClient.get('/dashboard/rooms', {
          params: { dateRange },
        });
        if (res && res.topPerformingRooms && res.topPerformingRooms.length > 0) return res;
      } catch {}
    }
    return {
      summary: MOCK_ROOMS.platformRoomsSummary,
      viewsTrend: MOCK_ROOMS.platformViewsTrend,
      trafficSources: MOCK_ROOMS.platformTrafficSources,
      devices: MOCK_ROOMS.platformDevices,
      heatmap: MOCK_ROOMS.platformHeatmap,
      geoTraffic: MOCK_ROOMS.platformGeoTraffic,
      topRecommendations: MOCK_ROOMS.platformRecommendations,
      topPerformingRooms: [
        {
          roomId: 'room_alice_01',
          roomName: "Alice's Portfolio",
          ownerName: 'Alice Chen',
          ownerEmail: 'alice@example.com',
          views: 1247,
          uniqueViews: 1092,
          engagement: 68.5,
        },
        {
          roomId: 'room_kwame_01',
          roomName: 'Kwame Asante — Dev',
          ownerName: 'Kwame Asante',
          ownerEmail: 'kwame@example.com',
          views: 2840,
          uniqueViews: 1845,
          engagement: 82.4,
        },
        {
          roomId: 'room_priya_01',
          roomName: 'Priya Sharma — UX',
          ownerName: 'Priya Sharma',
          ownerEmail: 'priya@example.com',
          views: 980,
          uniqueViews: 720,
          engagement: 74.1,
        },
        {
          roomId: 'room_sarah_01',
          roomName: 'Sarah Jenkins — Creative',
          ownerName: 'Sarah Jenkins',
          ownerEmail: 'sarah.jenkins@example.com',
          views: 1650,
          uniqueViews: 1210,
          engagement: 79.3,
        },
      ],
    };
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
};
