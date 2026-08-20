export const DATE_RANGES = [
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
] as const;

export const SIGNUP_SOURCES = [
  { label: 'All Sources', value: 'all' },
  { label: 'Organic', value: 'organic' },
  { label: 'Email', value: 'email' },
  { label: 'Referral', value: 'referral' },
  { label: 'Paid Ad', value: 'paid_ad' },
] as const;

export const NAV_LINKS = [
  { path: '/dashboard/funnel', label: 'Funnel', icon: 'TrendingDown' },
  { path: '/dashboard/features', label: 'Features', icon: 'Puzzle' },
  { path: '/dashboard/retention', label: 'Retention', icon: 'RefreshCcw' },
  { path: '/dashboard/email', label: 'Email', icon: 'Mail' },
  { path: '/lookup', label: 'User Lookup', icon: 'Search' },
] as const;

export const CHART_COLORS = {
  primary: '#2DD4BF',
  secondary: '#0F766E',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  purple: '#8B5CF6',
};
