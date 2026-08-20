/**
 * PostHog Data Transformation & Calculation Helpers
 */

export function calculateDropOff(previousCount: number, currentCount: number): number {
  if (previousCount === 0) return 0;
  const dropOff = ((previousCount - currentCount) / previousCount) * 100;
  return Math.max(0, Math.round(dropOff * 10) / 10);
}

export function calculateConversionRate(totalStart: number, currentCount: number): number {
  if (totalStart === 0) return 0;
  const conv = (currentCount / totalStart) * 100;
  return Math.round(conv * 10) / 10;
}

export function parseDateRange(dateRange: string): { dateFrom: string; dateTo?: string } {
  const now = new Date();

  switch (dateRange) {
    case '7d': {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      return { dateFrom: d.toISOString() };
    }
    case '90d': {
      const d = new Date(now);
      d.setDate(d.getDate() - 90);
      return { dateFrom: d.toISOString() };
    }
    case '12m': {
      const d = new Date(now);
      d.setFullYear(d.getFullYear() - 1);
      return { dateFrom: d.toISOString() };
    }
    case '30d':
    default: {
      const d = new Date(now);
      d.setDate(d.getDate() - 30);
      return { dateFrom: d.toISOString() };
    }
  }
}

export function aggregateEventProperties(
  items: Array<{ propertyValue: string; count: number }>,
  total: number
): Array<{ name: string; count: number; percentage: number }> {
  return items.map(item => ({
    name: item.propertyValue,
    count: item.count,
    percentage: total > 0 ? Math.round((item.count / total) * 1000) / 10 : 0,
  }));
}
