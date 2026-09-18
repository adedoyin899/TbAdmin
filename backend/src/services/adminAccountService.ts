import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import { pool } from '../db/connection.js';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const ACCOUNTS_FILE = path.join(DATA_DIR, 'admin_accounts.json');

export interface TeamAccount {
  id: string;
  name: string;
  email: string;
  aliases?: string[];
  role: 'Super Admin' | 'Admin' | 'Marketing' | 'Data Analyst' | 'Viewer' | string;
  password: string; // Viewable by Super Admin / Master Admin
  passwordHash: string; // Bcrypt hash for secure verification
  expiry: string;
  status: 'Active' | 'Suspended';
  lastActive: string;
  isOwner?: boolean;
  createdAt: string;
}

const DEFAULT_ACCOUNTS: TeamAccount[] = [
  {
    id: 'adm_001_maz',
    name: 'Maz (Lead Admin)',
    email: 'maz@talentbridge.cv',
    aliases: ['maz@tb.com'],
    role: 'Super Admin',
    password: 'temp_password_123',
    passwordHash: bcrypt.hashSync('temp_password_123', 10),
    expiry: '7 Days (Sliding)',
    status: 'Active',
    lastActive: 'Just now (Source of Truth)',
    isOwner: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'adm_002_sys',
    name: 'System Admin',
    email: 'admin@talentbridge.cv',
    aliases: ['admin@tb.com'],
    role: 'Admin',
    password: 'password123',
    passwordHash: bcrypt.hashSync('password123', 10),
    expiry: '7 Days (Sliding)',
    status: 'Active',
    lastActive: '14m ago',
    isOwner: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'adm_003_mkt',
    name: 'Marketing Lead',
    email: 'marketing@tb.com',
    aliases: ['marketing@talentbridge.cv'],
    role: 'Marketing',
    password: 'marketing123',
    passwordHash: bcrypt.hashSync('marketing123', 10),
    expiry: '7 Days (Sliding)',
    status: 'Active',
    lastActive: '1h ago',
    isOwner: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'adm_004_kwm',
    name: 'Kwame Asante',
    email: 'kwame.asante@talentbridge.cv',
    aliases: ['analyst@tb.com', 'analyst@talentbridge.cv'],
    role: 'Data Analyst',
    password: 'analyst123',
    passwordHash: bcrypt.hashSync('analyst123', 10),
    expiry: '24 Hours',
    status: 'Active',
    lastActive: '2h ago',
    isOwner: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'adm_005_sar',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@talentbridge.cv',
    aliases: ['viewer@tb.com', 'viewer@talentbridge.cv'],
    role: 'Viewer',
    password: 'viewer123',
    passwordHash: bcrypt.hashSync('viewer123', 10),
    expiry: '24 Hours',
    status: 'Active',
    lastActive: 'Yesterday',
    isOwner: false,
    createdAt: new Date().toISOString(),
  },
];

class AdminAccountService {
  private accounts: TeamAccount[] = [];

  constructor() {
    this.loadAccounts();
  }

  private loadAccounts(): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(ACCOUNTS_FILE)) {
        const data = fs.readFileSync(ACCOUNTS_FILE, 'utf-8');
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge with defaults to ensure required seed accounts exist
          const loadedMap = new Map<string, TeamAccount>();
          for (const acc of parsed) {
            loadedMap.set(acc.email.toLowerCase(), acc);
          }

          for (const def of DEFAULT_ACCOUNTS) {
            if (!loadedMap.has(def.email.toLowerCase())) {
              loadedMap.set(def.email.toLowerCase(), def);
            }
          }

          this.accounts = Array.from(loadedMap.values());
          return;
        }
      }

      // If file doesn't exist or is empty, write defaults
      this.accounts = [...DEFAULT_ACCOUNTS];
      this.persist();
    } catch (err) {
      logger.warn('Failed to load admin accounts file, using defaults:', err);
      this.accounts = [...DEFAULT_ACCOUNTS];
    }
  }

  private persist(): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(this.accounts, null, 2), 'utf-8');
    } catch (err) {
      logger.error('Failed to persist admin accounts:', err);
    }
  }

  public getAccounts(viewerRole?: string): TeamAccount[] {
    const isSuperAdmin = viewerRole === 'Super Admin' || viewerRole === 'admin';
    return this.accounts.map((acc) => {
      // If caller is not Super Admin, mask password for security
      if (!isSuperAdmin) {
        return {
          ...acc,
          password: '••••••••',
        };
      }
      return { ...acc };
    });
  }

  public findByEmail(email: string): TeamAccount | undefined {
    const normalized = email.trim().toLowerCase();
    return this.accounts.find(
      (a) =>
        a.email.toLowerCase() === normalized ||
        a.aliases?.some((alias) => alias.toLowerCase() === normalized)
    );
  }

  public async changePassword(email: string, newPassword: string): Promise<TeamAccount> {
    const acc = this.findByEmail(email);
    if (!acc) {
      throw new Error(`Administrator account with email "${email}" was not found.`);
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);

    acc.password = newPassword;
    acc.passwordHash = hash;
    this.persist();

    // Try syncing to PostgreSQL if connected
    try {
      await pool.query(
        'UPDATE admin_users SET password_hash = $1 WHERE LOWER(email) = $2',
        [hash, acc.email.toLowerCase()]
      );
    } catch {
      // Ignore if local PostgreSQL is offline
    }

    return { ...acc };
  }

  public async createAccount(data: {
    name: string;
    email: string;
    role: string;
    password?: string;
  }): Promise<TeamAccount> {
    const normalized = data.email.trim().toLowerCase();
    if (this.findByEmail(normalized)) {
      throw new Error(`An account with email "${data.email}" already exists.`);
    }

    const plainPassword = data.password || 'tb_pass_2026';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(plainPassword, salt);

    const newAcc: TeamAccount = {
      id: `adm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: data.name.trim(),
      email: normalized,
      role: data.role || 'Admin',
      password: plainPassword,
      passwordHash: hash,
      expiry: data.role === 'Viewer' || data.role === 'Data Analyst' ? '24 Hours' : '7 Days (Sliding)',
      status: 'Active',
      lastActive: 'Provisioned Just now',
      isOwner: false,
      createdAt: new Date().toISOString(),
    };

    this.accounts.push(newAcc);
    this.persist();

    // Try creating in PostgreSQL if available
    try {
      await pool.query(
        `INSERT INTO admin_users (email, password_hash, role, is_active)
         VALUES ($1, $2, $3, TRUE)
         ON CONFLICT (email) DO UPDATE
         SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role`,
        [newAcc.email, hash, newAcc.role.toLowerCase().replace(/\s+/g, '_')]
      );
    } catch {
      // Ignore if offline
    }

    return { ...newAcc };
  }

  public updateRole(email: string, newRole: string): TeamAccount {
    const acc = this.findByEmail(email);
    if (!acc) {
      throw new Error(`Administrator account with email "${email}" was not found.`);
    }
    if (acc.isOwner) {
      throw new Error('Cannot change the role tier of the primary Lead Super Admin.');
    }

    acc.role = newRole;
    this.persist();
    return { ...acc };
  }

  public toggleStatus(email: string): TeamAccount {
    const acc = this.findByEmail(email);
    if (!acc) {
      throw new Error(`Administrator account with email "${email}" was not found.`);
    }
    if (acc.isOwner) {
      throw new Error('Cannot suspend the primary Lead Super Admin account.');
    }

    acc.status = acc.status === 'Active' ? 'Suspended' : 'Active';
    this.persist();
    return { ...acc };
  }

  public deleteAccount(email: string): boolean {
    const acc = this.findByEmail(email);
    if (!acc) {
      throw new Error(`Administrator account with email "${email}" was not found.`);
    }
    if (acc.isOwner) {
      throw new Error('Cannot delete the primary Lead Super Admin account.');
    }

    this.accounts = this.accounts.filter(
      (a) => a.email.toLowerCase() !== acc.email.toLowerCase()
    );
    this.persist();

    try {
      pool.query('DELETE FROM admin_users WHERE LOWER(email) = $1', [acc.email.toLowerCase()]).catch(() => {});
    } catch {}

    return true;
  }

  public async authenticate(
    email: string,
    password: string
  ): Promise<{ success: boolean; account?: TeamAccount; message?: string }> {
    const acc = this.findByEmail(email);
    if (!acc) {
      return { success: false, message: 'Invalid email or password.' };
    }

    if (acc.status === 'Suspended') {
      return {
        success: false,
        message: 'This account has been suspended. Please contact the Lead Super Admin.',
      };
    }

    // Verify bcrypt hash or plaintext match
    let isValid = false;
    if (acc.passwordHash) {
      try {
        isValid = await bcrypt.compare(password, acc.passwordHash);
      } catch {
        isValid = false;
      }
    }
    if (!isValid && acc.password === password) {
      isValid = true;
    }

    if (!isValid) {
      return { success: false, message: 'Invalid email or password.' };
    }

    // Update lastActive timestamp
    acc.lastActive = 'Just now';
    this.persist();

    return { success: true, account: { ...acc } };
  }
}

export const adminAccountService = new AdminAccountService();
