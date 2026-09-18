import { useAuth } from '../context/AuthContext';

export interface Permissions {
  canViewDashboards: boolean;
  canViewMarketing: boolean;
  canViewUserDirectory: boolean;
  canViewErrorMonitoring: boolean;
  canExportData: boolean;
  canModifySettings: boolean;
  canManageIntegrations: boolean;
  canManageTeam: boolean;
  canFlushCache: boolean;
  isReadOnly: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isMarketing: boolean;
  isAnalyst: boolean;
  isViewer: boolean;
}

export function getRolePermissions(role?: string, email?: string): Permissions {
  const normalized = (role || '').toLowerCase();
  const isMaz = email?.toLowerCase() === 'maz@talentbridge.cv' || email?.toLowerCase() === 'maz@tb.com';
  const isSuperAdmin = isMaz || normalized.includes('super');
  const isMarketing = normalized.includes('market');
  const isAnalyst = normalized.includes('analyst') || normalized.includes('data');
  const isViewer = normalized.includes('viewer');
  const isAdmin = !isSuperAdmin && !isMarketing && !isAnalyst && !isViewer;

  if (isSuperAdmin) {
    return {
      canViewDashboards: true,
      canViewMarketing: true,
      canViewUserDirectory: true,
      canViewErrorMonitoring: true,
      canExportData: true,
      canModifySettings: true,
      canManageIntegrations: true,
      canManageTeam: true,
      canFlushCache: true,
      isReadOnly: false,
      isSuperAdmin: true,
      isAdmin: true,
      isMarketing: false,
      isAnalyst: false,
      isViewer: false,
    };
  }

  if (isAdmin) {
    return {
      canViewDashboards: true,
      canViewMarketing: true,
      canViewUserDirectory: true,
      canViewErrorMonitoring: true,
      canExportData: true,
      canModifySettings: true,
      canManageIntegrations: true,
      canManageTeam: false,
      canFlushCache: true,
      isReadOnly: false,
      isSuperAdmin: false,
      isAdmin: true,
      isMarketing: false,
      isAnalyst: false,
      isViewer: false,
    };
  }

  if (isMarketing) {
    return {
      canViewDashboards: true,
      canViewMarketing: true,
      canViewUserDirectory: false,
      canViewErrorMonitoring: false,
      canExportData: true,
      canModifySettings: false,
      canManageIntegrations: false,
      canManageTeam: false,
      canFlushCache: false,
      isReadOnly: false,
      isSuperAdmin: false,
      isAdmin: false,
      isMarketing: true,
      isAnalyst: false,
      isViewer: false,
    };
  }

  if (isAnalyst) {
    return {
      canViewDashboards: true,
      canViewMarketing: true,
      canViewUserDirectory: true,
      canViewErrorMonitoring: false,
      canExportData: true,
      canModifySettings: false,
      canManageIntegrations: false,
      canManageTeam: false,
      canFlushCache: false,
      isReadOnly: true,
      isSuperAdmin: false,
      isAdmin: false,
      isMarketing: false,
      isAnalyst: true,
      isViewer: false,
    };
  }

  // Explicit Viewer: Strict Read-Only
  return {
    canViewDashboards: true,
    canViewMarketing: false,
    canViewUserDirectory: false,
    canViewErrorMonitoring: false,
    canExportData: false,
    canModifySettings: false,
    canManageIntegrations: false,
    canManageTeam: false,
    canFlushCache: false,
    isReadOnly: true,
    isSuperAdmin: false,
    isAdmin: false,
    isMarketing: false,
    isAnalyst: false,
    isViewer: true,
  };
}

export function isRouteAllowed(pathname: string, role?: string, email?: string): boolean {
  const perms = getRolePermissions(role, email);

  // Super Admin & Admin can access all application routes
  if (perms.isSuperAdmin || perms.isAdmin) {
    return true;
  }

  // Settings & Error Monitoring are strictly Super Admin & Admin only
  if (pathname.startsWith('/settings') || pathname.startsWith('/dashboard/errors')) {
    return false;
  }

  // User Lookup
  if (pathname.startsWith('/lookup')) {
    return perms.canViewUserDirectory;
  }

  // Marketing Lead routes
  if (perms.isMarketing) {
    // Marketing can access website analytics, funnel conversion, social media, campaigns, email, room insights, and platform guide
    const allowedPrefixes = [
      '/dashboard/website',
      '/dashboard/funnel',
      '/dashboard/social-media',
      '/social-media',
      '/dashboard/campaigns',
      '/campaigns',
      '/dashboard/email',
      '/email',
      '/dashboard/rooms',
      '/help',
    ];
    return allowedPrefixes.some((prefix) => pathname.startsWith(prefix));
  }

  // Data Analyst routes
  if (perms.isAnalyst) {
    // Analyst can access all analytics dashboards, media, and user lookup, but not system settings or errors
    return (
      !pathname.startsWith('/settings') &&
      !pathname.startsWith('/dashboard/errors')
    );
  }

  // Viewer routes: Only top-level overview dashboards
  if (perms.isViewer) {
    const viewerAllowed = [
      '/dashboard/website',
      '/dashboard/funnel',
      '/dashboard/features',
      '/dashboard/retention',
      '/dashboard/rooms',
      '/help',
    ];
    return viewerAllowed.some((prefix) => pathname.startsWith(prefix));
  }

  return true;
}

export function getDefaultRouteForRole(role?: string, email?: string): string {
  const perms = getRolePermissions(role, email);
  if (perms.isMarketing) return '/dashboard/campaigns';
  if (perms.isAnalyst || perms.isViewer) return '/dashboard/website';
  return '/dashboard/funnel';
}

export function useRbac(): Permissions {
  const { user } = useAuth();
  return getRolePermissions(user?.role, user?.email);
}
