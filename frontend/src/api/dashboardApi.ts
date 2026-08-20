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
        if (res) return res;
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
        if (res) return res;
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
        if (res) return res;
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
        if (res) return res;
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
        if (res) return res;
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
          uniqueViews: 10922,
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
      ],
    };
  },
};
