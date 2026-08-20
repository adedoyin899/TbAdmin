import MOCK_FUNNEL from './mockData/funnel.json';
import MOCK_FEATURES from './mockData/features.json';
import MOCK_RETENTION from './mockData/retention.json';
import MOCK_EMAIL from './mockData/email.json';

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
};
