export type UserRole = 'admin' | 'product' | 'marketing' | 'operations' | 'intern';

export interface AdminUserRow {
  id: string;
  email: string;
  password_hash: string;
  role: UserRole;
  created_at: Date;
  last_login: Date | null;
  is_active: boolean;
}

export type MailgunEventType =
  | 'opened'
  | 'clicked'
  | 'delivered'
  | 'failed'
  | 'unsubscribed'
  | 'complained';

export interface MailgunEventRow {
  id: number;
  event_type: MailgunEventType;
  email_address: string;
  campaign_id: string | null;
  campaign_name: string | null;
  message_id: string;
  link_url: string | null;
  timestamp: Date;
  created_at: Date;
  metadata: Record<string, any>;
}

export interface DashboardCacheRow {
  id: number;
  cache_key: string;
  data: Record<string, any>;
  expires_at: Date;
  created_at: Date;
}

export interface AuditLogRow {
  id: number;
  admin_user_id: string | null;
  action: string;
  resource: string;
  timestamp: Date;
  ip_address: string | null;
  user_agent: string | null;
}
