import apiClient from './client';

export interface TeamMemberAccount {
  id: string;
  name: string;
  email: string;
  aliases?: string[];
  role: string;
  password?: string;
  expiry: string;
  status: 'Active' | 'Suspended';
  lastActive?: string;
  isOwner?: boolean;
}

export const authApi = {
  login: async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const res: any = await apiClient.post('/auth/login', {
        email: normalizedEmail,
        password,
      });

      if (res && res.token && res.user) {
        localStorage.setItem('auth_token', res.token);
        localStorage.setItem('auth_user', JSON.stringify(res.user));
        return { token: res.token, user: res.user };
      }
    } catch (err: any) {
      if (err.response) {
        if (err.response.status === 403) {
          throw new Error(err.response.data?.message || 'This account has been suspended. Please contact the Lead Super Admin.');
        }
        if (err.response.status === 401) {
          throw new Error(err.response.data?.message || 'Invalid email or password.');
        }
        if (err.response.data?.message) {
          throw new Error(err.response.data.message);
        }
      }
      // If network offline, check local fallback
      const stored = localStorage.getItem('tbridge_team_users');
      if (stored) {
        const team: TeamMemberAccount[] = JSON.parse(stored);
        const match = team.find(
          (u) =>
            u.email.toLowerCase() === normalizedEmail ||
            u.aliases?.some((a) => a.toLowerCase() === normalizedEmail)
        );
        if (match) {
          if (match.status === 'Suspended') {
            throw new Error('This account has been suspended. Please contact the Lead Super Admin.');
          }
          if (match.password && match.password === password) {
            const fallbackToken = 'jwt_offline_' + Date.now();
            const fallbackUser = {
              id: match.id || 'usr_' + normalizedEmail.replace(/[^a-z0-9]/g, '_'),
              name: match.name,
              email: match.email,
              role: match.role,
              isOwner: !!match.isOwner,
            };
            localStorage.setItem('auth_token', fallbackToken);
            localStorage.setItem('auth_user', JSON.stringify(fallbackUser));
            return { token: fallbackToken, user: fallbackUser };
          }
        }
      }
      throw new Error('Invalid email or password.');
    }

    throw new Error('Login failed. Please check your credentials.');
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

  getTeamAccounts: async (): Promise<TeamMemberAccount[]> => {
    try {
      const res: any = await apiClient.get('/auth/team');
      if (res?.data && Array.isArray(res.data)) {
        localStorage.setItem('tbridge_team_users', JSON.stringify(res.data));
        return res.data;
      }
    } catch {}

    const stored = localStorage.getItem('tbridge_team_users');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {}
    }

    // Default seed
    return [
      { id: 'adm_001', name: 'Maz (Lead Admin)', email: 'maz@talentbridge.cv', role: 'Super Admin', password: 'temp_password_123', expiry: '7 Days (Sliding)', status: 'Active', lastActive: 'Just now (Source of Truth)', isOwner: true },
      { id: 'adm_002', name: 'System Admin', email: 'admin@talentbridge.cv', role: 'Admin', password: 'password123', expiry: '7 Days (Sliding)', status: 'Active', lastActive: '14m ago' },
      { id: 'adm_003', name: 'Marketing Lead', email: 'marketing@tb.com', role: 'Marketing', password: 'marketing123', expiry: '7 Days (Sliding)', status: 'Active', lastActive: '1h ago' },
      { id: 'adm_004', name: 'Kwame Asante', email: 'kwame.asante@talentbridge.cv', role: 'Data Analyst', password: 'analyst123', expiry: '24 Hours', status: 'Active', lastActive: '2h ago' },
      { id: 'adm_005', name: 'Sarah Jenkins', email: 'sarah.jenkins@talentbridge.cv', role: 'Viewer', password: 'viewer123', expiry: '24 Hours', status: 'Active', lastActive: 'Yesterday' },
    ];
  },

  changeUserPassword: async (email: string, newPassword: string): Promise<any> => {
    const res: any = await apiClient.put(`/auth/team/${encodeURIComponent(email)}/password`, {
      newPassword,
    });
    // Update local storage copy
    const stored = localStorage.getItem('tbridge_team_users');
    if (stored) {
      try {
        const team: TeamMemberAccount[] = JSON.parse(stored);
        const updated = team.map((u) => (u.email.toLowerCase() === email.toLowerCase() ? { ...u, password: newPassword } : u));
        localStorage.setItem('tbridge_team_users', JSON.stringify(updated));
      } catch {}
    }
    return res?.data;
  },

  addTeamAccount: async (data: { name: string; email: string; role: string; password?: string }): Promise<any> => {
    const res: any = await apiClient.post('/auth/team', data);
    return res?.data;
  },

  updateUserRole: async (email: string, role: string): Promise<any> => {
    const res: any = await apiClient.put(`/auth/team/${encodeURIComponent(email)}/role`, { role });
    return res?.data;
  },

  toggleUserStatus: async (email: string): Promise<any> => {
    const res: any = await apiClient.put(`/auth/team/${encodeURIComponent(email)}/status`, {});
    return res?.data;
  },

  deleteTeamAccount: async (email: string): Promise<any> => {
    const res: any = await apiClient.delete(`/auth/team/${encodeURIComponent(email)}`);
    return res?.data;
  },
};
