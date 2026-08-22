// src/utils/exportCampaignReport.ts
// Cross-platform campaign summary report exporter (CSV and Printable PDF formatting)

import { exportToCsv } from './exportCsv';
import type { CampaignPerformanceResponse } from '../types/socialMedia';

export function exportCampaignCsvReport(perf: CampaignPerformanceResponse) {
  const camp = perf.campaign;
  const metrics = perf.performance;
  const byChannel = metrics.by_channel;

  const rows = [
    { Section: 'Header', Metric: 'Campaign Name', Value: camp.name },
    { Section: 'Header', Metric: 'Status', Value: camp.status },
    { Section: 'Header', Metric: 'Start Date', Value: camp.start_date || 'N/A' },
    { Section: 'Header', Metric: 'End Date', Value: camp.end_date || 'N/A' },
    { Section: 'Header', Metric: 'Budget ($)', Value: camp.budget || 0 },
    { Section: 'Header', Metric: 'Spend ($)', Value: camp.spend || 0 },
    
    // Performance Summary
    { Section: 'Overview', Metric: 'Total Reach', Value: metrics.total_reach },
    { Section: 'Overview', Metric: 'Total Impressions', Value: metrics.total_impressions },
    { Section: 'Overview', Metric: 'Total Engagement', Value: metrics.total_engagement },
    { Section: 'Overview', Metric: 'Avg Engagement Rate (%)', Value: metrics.avg_engagement_rate },
    { Section: 'Overview', Metric: 'Total Clicks', Value: metrics.total_clicks },
    { Section: 'Overview', Metric: 'Total Signups', Value: metrics.total_signups },
    { Section: 'Overview', Metric: 'Signup Conversion Rate (%)', Value: metrics.signup_conversion_rate },
    { Section: 'Overview', Metric: 'Cost Per Click ($)', Value: metrics.cpc || 'N/A' },
    { Section: 'Overview', Metric: 'Cost Per Signup ($)', Value: metrics.cps || 'N/A' },
    { Section: 'Overview', Metric: 'ROI Multiplier', Value: metrics.roi || 'N/A' },

    // Channel Breakdowns
    { Section: 'Channel: Email', Metric: 'Reach / Views', Value: byChannel?.email?.reach || 0 },
    { Section: 'Channel: Email', Metric: 'Engagement Rate (%)', Value: byChannel?.email?.engagement_rate || 0 },
    { Section: 'Channel: Email', Metric: 'Clicks', Value: byChannel?.email?.clicks || 0 },
    { Section: 'Channel: Email', Metric: 'Signups', Value: byChannel?.email?.signups || 0 },
    { Section: 'Channel: Email', Metric: 'Conversion Rate (%)', Value: byChannel?.email?.conversion_rate || 0 },

    { Section: 'Channel: LinkedIn', Metric: 'Reach / Views', Value: byChannel?.linkedin?.reach || 0 },
    { Section: 'Channel: LinkedIn', Metric: 'Engagement Rate (%)', Value: byChannel?.linkedin?.engagement_rate || 0 },
    { Section: 'Channel: LinkedIn', Metric: 'Clicks', Value: byChannel?.linkedin?.clicks || 0 },
    { Section: 'Channel: LinkedIn', Metric: 'Signups', Value: byChannel?.linkedin?.signups || 0 },
    { Section: 'Channel: LinkedIn', Metric: 'Conversion Rate (%)', Value: byChannel?.linkedin?.conversion_rate || 0 },

    { Section: 'Channel: Reddit', Metric: 'Reach / Views', Value: byChannel?.reddit?.reach || 0 },
    { Section: 'Channel: Reddit', Metric: 'Engagement Rate (%)', Value: byChannel?.reddit?.engagement_rate || 0 },
    { Section: 'Channel: Reddit', Metric: 'Clicks', Value: byChannel?.reddit?.clicks || 0 },
    { Section: 'Channel: Reddit', Metric: 'Signups', Value: byChannel?.reddit?.signups || 0 },
    { Section: 'Channel: Reddit', Metric: 'Conversion Rate (%)', Value: byChannel?.reddit?.conversion_rate || 0 },
  ];

  exportToCsv({
    filename: `campaign_performance_${camp.id}_report`,
    columns: [
      { header: 'Section', accessor: (r) => r.Section },
      { header: 'Metric', accessor: (r) => r.Metric },
      { header: 'Value', accessor: (r) => r.Value },
    ],
    data: rows,
  });
}

