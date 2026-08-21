export const formatPercentage = (num?: number | null): string => {
  if (num === null || num === undefined || isNaN(Number(num))) return '0%';
  return `${Math.round(Number(num))}%`;
};

export const formatNumber = (num?: number | null): string => {
  if (num === null || num === undefined || isNaN(Number(num))) return '0';
  return Number(num).toLocaleString('en-US');
};

export const formatDate = (dateString?: string | null): string => {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
};

export const formatDateTime = (dateString?: string | null): string => {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
};

export const formatRelativeTime = (dateString?: string | null): string => {
  if (!dateString) return 'just now';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'just now';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 0) return 'just now';
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  } catch {
    return 'just now';
  }
};

export const formatEventName = (name?: string | null): string => {
  if (!name) return '—';
  return String(name).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

export const validateEmail = (email?: string | null): boolean => {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email));
};
