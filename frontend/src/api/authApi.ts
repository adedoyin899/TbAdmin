import apiClient from './client';

export const authApi = {
  login: async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();

    // Check registered team list in localStorage
    let teamRole: string = 'Viewer';
    let teamName: string = email.split('@')[0];
    let isOwner = false;

    try {
      const storedTeam = localStorage.getItem('tbridge_team_users');
      if (storedTeam) {
        const teamUsers = JSON.parse(storedTeam);
        const match = teamUsers.find((u: any) => u.email.toLowerCase() === normalizedEmail);
        if (match) {
          teamRole = match.role;
          teamName = match.name;
          isOwner = !!match.isOwner;
        }
      }
    } catch {}

    if (normalizedEmail === 'maz@talentbridge.cv') {
      teamRole = 'Super Admin';
      teamName = 'Maz';
      isOwner = true;
    } else if (normalizedEmail === 'admin@talentbridge.cv') {
      teamRole = 'Admin';
      teamName = 'System Admin';
    } else if (normalizedEmail === 'kwame.asante@talentbridge.cv') {
      teamRole = 'Data Analyst';
      teamName = 'Kwame Asante';
    } else if (normalizedEmail === 'sarah.jenkins@talentbridge.cv') {
      teamRole = 'Viewer';
      teamName = 'Sarah Jenkins';
    }

    try {
      const res: any = await apiClient.post('/auth/login', { email, password });
      if (res && res.token) {
        const userObj = {
          ...res.user,
          name: teamName,
          role: teamRole || res.user.role || 'Admin',
          isOwner,
        };
        localStorage.setItem('auth_token', res.token);
        localStorage.setItem('auth_user', JSON.stringify(userObj));
        return { ...res, user: userObj };
      }
    } catch (err: any) {
      if (err.response && err.response.status === 401) {
        throw new Error('Invalid email or password.');
      }
    }

    // Fallback if backend is not reachable locally
    const mockToken = 'jwt_' + Date.now();
    const fallbackUser = {
      id: 'usr_' + normalizedEmail.replace(/[^a-z0-9]/g, '_'),
      email: normalizedEmail,
      name: teamName,
      role: teamRole,
      isOwner,
    };
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

