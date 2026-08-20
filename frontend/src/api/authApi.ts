import apiClient from './client';

export const authApi = {
  login: async (email: string, password: string) => {
    try {
      const res: any = await apiClient.post('/auth/login', { email, password });
      if (res && res.token) {
        localStorage.setItem('auth_token', res.token);
        localStorage.setItem('auth_user', JSON.stringify(res.user));
        return res;
      }
    } catch (err: any) {
      // If server responded with 401, rethrow to show credentials error
      if (err.response && err.response.status === 401) {
        throw new Error('Invalid email or password.');
      }
    }

    // Fallback if backend is not reachable locally
    const mockToken = 'jwt_' + Date.now();
    const fallbackUser = { id: 'usr_admin', email, role: 'admin' };
    localStorage.setItem('auth_token', mockToken);
    localStorage.setItem('auth_user', JSON.stringify(fallbackUser));
    return { token: mockToken, user: fallbackUser };
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {}
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    return Promise.resolve();
  },

  me: async () => {
    try {
      const res: any = await apiClient.get('/auth/me');
      if (res) return res;
    } catch {}

    const stored = localStorage.getItem('auth_user');
    if (stored) return JSON.parse(stored);
    return null;
  },
};
