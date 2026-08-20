import MOCK_FUNNEL from './mockData/funnel.json';
import MOCK_FEATURES from './mockData/features.json';
import MOCK_RETENTION from './mockData/retention.json';
import MOCK_EMAIL from './mockData/email.json';
import MOCK_ROOMS from './mockData/rooms.json';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const dashboardApi = {
  getFunnel: async (_dateRange: string, _signupSource: string) => {
    await delay(350);
    return MOCK_FUNNEL;
  },
  getFeatures: async (_dateRange: string) => {
    await delay(350);
    return MOCK_FEATURES;
  },
  getRetention: async (_signupSource: string) => {
    await delay(350);
    return MOCK_RETENTION;
  },
  getEmail: async (_dateRange: string) => {
    await delay(350);
    return MOCK_EMAIL;
  },
  getRoomsDashboard: async (_dateRange: string) => {
    await delay(350);
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
          ownerName: "Alice Chen",
          ownerEmail: "alice@example.com",
          views: 1247,
          uniqueViews: 10922,
          engagement: 68.5,
        },
        {
          roomId: 'room_kwame_01',
          roomName: "Kwame Asante — Dev",
          ownerName: "Kwame Asante",
          ownerEmail: "kwame@example.com",
          views: 2840,
          uniqueViews: 1845,
          engagement: 82.4,
        },
        {
          roomId: 'room_priya_01',
          roomName: "Priya Sharma — UX",
          ownerName: "Priya Sharma",
          ownerEmail: "priya@example.com",
          views: 980,
          uniqueViews: 840,
          engagement: 74.0,
        },
        {
          roomId: 'room_james_01',
          roomName: "James O'Brien — Engineering",
          ownerName: "James O'Brien",
          ownerEmail: "james@example.com",
          views: 1650,
          uniqueViews: 1320,
          engagement: 79.2,
        },
      ],
    };
  },
};
