import type { UserRole } from '../types/database.js';

export type Permission =
  | 'view_funnel'
  | 'view_features'
  | 'view_retention'
  | 'view_email'
  | 'view_rooms'
  | 'view_user_lookup'
  | 'manage_team'
  | 'export_data';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'view_funnel',
    'view_features',
    'view_retention',
    'view_email',
    'view_rooms',
    'view_user_lookup',
    'manage_team',
    'export_data',
  ],
  product: [
    'view_funnel',
    'view_features',
    'view_retention',
    'view_rooms',
    'view_user_lookup',
  ],
  marketing: [
    'view_funnel',
    'view_features',
    'view_email',
    'view_rooms',
  ],
  operations: [
    'view_funnel',
    'view_user_lookup',
    'view_rooms',
  ],
  intern: [
    'view_funnel',
    'view_features',
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}
