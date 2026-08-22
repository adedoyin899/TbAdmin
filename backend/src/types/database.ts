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
  clicked_by_user_id?: string | null;
  click_link_index?: number | null;
  click_link_label?: string | null;
  click_device?: string | null;
  click_client?: string | null;
  click_geolocation_country?: string | null;
  click_geolocation_city?: string | null;
  opened_by_user_id?: string | null;
  opened_device?: string | null;
  opened_client?: string | null;
  opened_geolocation_country?: string | null;
  opened_at?: Date | null;
  first_clicked_at?: Date | null;
  post_click_action?: string | null;
  post_click_action_at?: Date | null;
  post_click_action_user_id?: string | null;
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

export * from './socialMedia.js';

