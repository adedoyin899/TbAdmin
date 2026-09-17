import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Bug, AlertTriangle, ShieldOff, ChevronRight, X,
  ExternalLink, Monitor, Clock, Users, Download,
} from 'lucide-react';
import { dashboardApi } from '../../api/dashboardApi';
import type { ErrorMonitoringResponse, ErrorIssue } from '../../types';
import { formatNumber, formatDateTime, formatRelativeTime } from '../../utils/formatters';
import { DateRangeSelector, type DateRangeValue } from '../Common/DateRangeSelector';
import { exportToCsv } from '../../utils/exportCsv';
import { MetricAlertBanner } from '../Common/MetricAlertBanner';
import { useRbac } from '../../utils/rbac';

export const ErrorMonitoringDashboard: React.FC = () => {
  const rbac = useRbac();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRangeValue>({ preset: '30d' });
  const [selectedIssue, setSelectedIssue] = useState<ErrorIssue | null>(null);

  const { data, isLoading, error } = useQuery<ErrorMonitoringResponse>({
    queryKey: ['errorMonitoring', dateRange.preset, dateRange.startDate, dateRange.endDate],
    queryFn: () => dashboardApi.getErrors(dateRange.preset) as Promise<ErrorMonitoringResponse>,
  });

  const issues = data?.issues || [];

  const handleExportCsv = () => {
    if (!issues.length) return;
    exportToCsv({
      filename: `talentbridge_error_issues_${dateRange.preset}`,
      columns: [
        { header: 'Type', accessor: row => row.type },
        { header: 'Message', accessor: row => row.message },
        { header: 'Level', accessor: row => row.level },
        { header: 'Handled', accessor: row => (row.handled ? 'Yes' : 'No') },
        { header: 'Occurrences', accessor: row => row.occurrences },
        { header: 'Affected Users', accessor: row => row.affectedUsers.length },
        { header: 'First Seen', accessor: row => row.firstSeen },
        { header: 'Last Seen', accessor: row => row.lastSeen },
        { header: 'URLs', accessor: row => row.urls.join('; ') },
      ],
      data: issues,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: 26, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>
              Error Monitoring
            </h1>
            <span className="badge badge-teal" style={{ fontSize: 11 }}>Live Telemetry</span>
          </div>
          <p style={{ color: 'var(--text-2)', fontSize: 13.5, marginTop: 4 }}>
            Real JS exceptions captured automatically by PostHog — grouped by issue, with affected users and stack context.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <DateRangeSelector value={dateRange} onChange={setDateRange} idPrefix="errors-date-range" />
          <button
            onClick={handleExportCsv}
            disabled={!issues.length || !rbac.canExportData}
            className="btn btn-ghost"
            style={{ fontSize: 13, gap: 6, opacity: !rbac.canExportData ? 0.6 : 1 }}
            title={!rbac.canExportData ? 'Export restricted for Viewer role' : 'Export issues to CSV'}
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {data && data.unhandledCount > 0 && (
        <MetricAlertBanner
          severity="critical"
          title="Unhandled Exceptions Detected"
          metricLabel="Unhandled Errors"
          metricValue={String(data.unhandledCount)}
          message={`${data.unhandledCount} unhandled exception${data.unhandledCount === 1 ? '' : 's'} across ${issues.length} distinct issue${issues.length === 1 ? '' : 's'} in the last ${dateRange.preset}. These crashed without a try/catch — worth prioritizing.`}
        />
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="stat-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Sora, sans-serif' }}>
              Total Exceptions
            </span>
            <Bug size={16} color="var(--accent)" />
          </div>
          <span className="mono-metric" style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)' }}>
            {formatNumber(data?.totalExceptions ?? 0)}
          </span>
          <p style={{ fontSize: 11.5, color: 'var(--text-2)', margin: 0 }}>Raw occurrences in range</p>
        </div>

        <div className="stat-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Sora, sans-serif' }}>
              Distinct Issues
            </span>
            <AlertTriangle size={16} color="var(--sunshine)" />
          </div>
          <span className="mono-metric" style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)' }}>
            {formatNumber(issues.length)}
          </span>
          <p style={{ fontSize: 11.5, color: 'var(--text-2)', margin: 0 }}>De-duplicated by PostHog's fingerprint</p>
        </div>

        <div className="stat-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Sora, sans-serif' }}>
              Unhandled
            </span>
            <ShieldOff size={16} color="#EF4444" />
          </div>
          <span className="mono-metric" style={{ fontSize: 26, fontWeight: 800, color: (data?.unhandledCount ?? 0) > 0 ? '#EF4444' : 'var(--text)' }}>
            {formatNumber(data?.unhandledCount ?? 0)}
          </span>
          <p style={{ fontSize: 11.5, color: 'var(--text-2)', margin: 0 }}>Crashed without a try/catch</p>
        </div>
      </div>

      {isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner" />
        </div>
      )}
      {error && <div style={{ padding: 20, color: '#EF4444', textAlign: 'center' }}>Failed to load error monitoring data.</div>}

      {data && issues.length === 0 && (
        <div className="card-mistral" style={{ padding: 48, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <Bug size={32} color="var(--dim)" />
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>No Exceptions Recorded</h3>
          <p style={{ fontSize: 13, color: 'var(--text-2)', maxWidth: 420 }}>
            Nothing has thrown an uncaught JS error in this range — either things are healthy, or the PostHog exception autocapture isn't picking anything up right now.
          </p>
        </div>
      )}

      {issues.length > 0 && (
        <div className="table-wrap">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Bug size={16} color="var(--accent)" />
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
                Issues (grouped by fingerprint)
              </h3>
            </div>
            <span className="badge badge-neutral" style={{ fontSize: 11 }}>Click a row for details</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ minWidth: 900 }}>
              <thead>
                <tr>
                  <th style={{ minWidth: 90 }}>Level</th>
                  <th style={{ minWidth: 320 }}>Error</th>
                  <th style={{ minWidth: 100 }}>Occurrences</th>
                  <th style={{ minWidth: 100 }}>Users</th>
                  <th style={{ minWidth: 140 }}>Last Seen</th>
                  <th style={{ textAlign: 'right', minWidth: 90 }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {issues.map(issue => (
                  <tr
                    key={issue.issueId}
                    onClick={() => setSelectedIssue(issue)}
                    className="hover:bg-[var(--panel-2)] cursor-pointer transition-colors"
                  >
                    <td>
                      <span className={`badge ${issue.handled ? 'badge-neutral' : 'badge-error'}`} style={{ fontSize: 10.5 }}>
                        {issue.handled ? 'handled' : 'unhandled'}
                      </span>
                    </td>
                    <td>
                      <p style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: 13 }}>{issue.type}</p>
                      <p style={{ fontSize: 11.5, color: 'var(--text-2)', margin: 0, maxWidth: 380, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={issue.message}>
                        {issue.message}
                      </p>
                    </td>
                    <td className="mono-metric" style={{ fontWeight: 700 }}>{formatNumber(issue.occurrences)}</td>
                    <td className="mono-metric" style={{ fontWeight: 700 }}>{issue.affectedUsers.length}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-2)' }}>{formatRelativeTime(issue.lastSeen)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <ChevronRight size={16} color="var(--dim)" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Drill-down modal */}
      {selectedIssue && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={() => setSelectedIssue(null)}
        >
          <div
            style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 16, width: '100%', maxWidth: 700, maxHeight: '85vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 18, padding: 24 }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--line)', paddingBottom: 14 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 18, fontWeight: 800, color: 'var(--text)', margin: 0 }}>{selectedIssue.type}</h3>
                  <span className={`badge ${selectedIssue.handled ? 'badge-neutral' : 'badge-error'}`} style={{ fontSize: 10.5 }}>
                    {selectedIssue.handled ? 'handled' : 'unhandled'}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-2)', margin: '6px 0 0 0', fontFamily: 'Geist Mono, monospace' }}>{selectedIssue.message}</p>
              </div>
              <button onClick={() => setSelectedIssue(null)} className="btn-icon" style={{ width: 32, height: 32 }}><X size={16} /></button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div style={{ padding: 12, background: 'var(--panel-2)', borderRadius: 10, border: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--dim)', fontSize: 11 }}><Bug size={12} /> Occurrences</div>
                <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', margin: '4px 0 0' }}>{selectedIssue.occurrences}</p>
              </div>
              <div style={{ padding: 12, background: 'var(--panel-2)', borderRadius: 10, border: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--dim)', fontSize: 11 }}><Clock size={12} /> First / Last Seen</div>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', margin: '4px 0 0' }}>{formatDateTime(selectedIssue.firstSeen)} → {formatDateTime(selectedIssue.lastSeen)}</p>
              </div>
            </div>

            {selectedIssue.urls.length > 0 && (
              <div>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 6px 0' }}>Where it happened</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {selectedIssue.urls.map(url => (
                    <a key={url} href={url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Geist Mono, monospace' }}>
                      <ExternalLink size={12} /> {url}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {selectedIssue.browsers.length > 0 && (
              <div>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 6px 0' }}>
                  <Monitor size={12} style={{ display: 'inline', marginRight: 4 }} /> Browser / OS
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {selectedIssue.browsers.map(b => (
                    <span key={b} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'var(--panel-2)', border: '1px solid var(--line)', color: 'var(--text)' }}>{b}</span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 8px 0' }}>
                <Users size={12} style={{ display: 'inline', marginRight: 4 }} /> Affected Users ({selectedIssue.affectedUsers.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {selectedIssue.affectedUsers.map(u => (
                  <button
                    key={u.distinctId}
                    onClick={() => { setSelectedIssue(null); navigate(`/lookup?userId=${encodeURIComponent(u.distinctId)}`); }}
                    className="btn btn-ghost"
                    style={{ justifyContent: 'space-between', fontSize: 12.5, padding: '8px 12px' }}
                  >
                    <span>{u.name || `Creator #${u.distinctId}`}</span>
                    <span style={{ color: 'var(--dim)', fontFamily: 'Geist Mono, monospace', fontSize: 11 }}>{u.email || u.distinctId}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
