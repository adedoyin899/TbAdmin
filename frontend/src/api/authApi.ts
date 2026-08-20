const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authApi = {
  login: async (email: string, _password: string) => {
    await delay(300);
    const mockToken = 'mock_jwt_' + Date.now();
    localStorage.setItem('auth_token', mockToken);
    localStorage.setItem('auth_user', JSON.stringify({ id: 'user_admin', email, role: 'admin' }));
    return { token: mockToken, user: { id: 'user_admin', email, role: 'admin' } };
  },
  logout: async () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    return Promise.resolve();
  },
  me: async () => {
    await delay(200);
    const stored = localStorage.getItem('auth_user');
    if (stored) return JSON.parse(stored);
    return null;
  },
};
