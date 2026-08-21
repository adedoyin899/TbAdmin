import { useAuth } from '../context/AuthContext';

export interface Permissions {
  canViewDashboards: boolean;
  canExportData: boolean;
  canModifySettings: boolean;
  canManageIntegrations: boolean;
  canManageTeam: boolean;
  canFlushCache: boolean;
  isReadOnly: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isAnalyst: boolean;
  isViewer: boolean;
}

export function getRolePermissions(role?: string, email?: string): Permissions {
  const normalized = (role || '').toLowerCase();
  const isMaz = email?.toLowerCase() === 'maz@talentbridge.cv';
  const isSuperAdmin = isMaz || normalized.includes('super');
  const isAdmin = isSuperAdmin || normalized === 'admin';
  const isAnalyst = normalized.includes('analyst') || normalized.includes('data');

  if (isSuperAdmin) {
    return {
      canViewDashboards: true,
      canExportData: true,
      canModifySettings: true,
      canManageIntegrations: true,
      canManageTeam: true,
      canFlushCache: true,
      isReadOnly: false,
      isSuperAdmin: true,
      isAdmin: true,
      isAnalyst: false,
      isViewer: false,
    };
  }

  if (isAdmin) {
    return {
      canViewDashboards: true,
      canExportData: true,
      canModifySettings: true,
      canManageIntegrations: true,
      canManageTeam: false,
      canFlushCache: true,
      isReadOnly: false,
      isSuperAdmin: false,
      isAdmin: true,
      isAnalyst: false,
      isViewer: false,
    };
  }

  if (isAnalyst) {
    return {
      canViewDashboards: true,
      canExportData: true,
      canModifySettings: false,
      canManageIntegrations: false,
      canManageTeam: false,
      canFlushCache: false,
      isReadOnly: true,
      isSuperAdmin: false,
      isAdmin: false,
      isAnalyst: true,
      isViewer: false,
    };
  }

  // Default Viewer: Strict Read-Only
  return {
    canViewDashboards: true,
    canExportData: false,
    canModifySettings: false,
    canManageIntegrations: false,
    canManageTeam: false,
    canFlushCache: false,
    isReadOnly: true,
    isSuperAdmin: false,
    isAdmin: false,
    isAnalyst: false,
    isViewer: true,
  };
}

export function useRbac(): Permissions {
  const { user } = useAuth();
  return getRolePermissions(user?.role, user?.email);
}
