import { postHogService } from './postHogService.js';
import { logger } from '../utils/logger.js';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  severity: 'critical' | 'warning' | 'info' | 'success';
  category: 'funnel' | 'email' | 'rooms' | 'retention' | 'system';
  triggerRule: string;
  timestamp: string;
  isRead: boolean;
  link?: string;
}

export interface NotificationThresholdSettings {
  funnelDropoffThreshold?: number;
  emailBounceThreshold?: number;
  enableRoomLeadAlerts?: boolean;
  enableRetentionMilestones?: boolean;
  enableSystemHealthAlerts?: boolean;
}

class NotificationService {
  private readIds: Set<string> = new Set();
  private dismissedIds: Set<string> = new Set();
  private manualNotifications: NotificationItem[] = [];
  private cachedNotifications: NotificationItem[] | null = null;
  private lastFetchedAt = 0;
  private readonly CACHE_TTL_MS = 60 * 1000; // 1 minute cache

  /**
   * Evaluates live events and telemetry from PostHog to generate actual notifications
   */
  async getNotifications(settings: NotificationThresholdSettings = {}): Promise<NotificationItem[]> {
    const now = Date.now();
    if (this.cachedNotifications && now - this.lastFetchedAt < this.CACHE_TTL_MS) {
      return this.applyReadAndDismissState(this.cachedNotifications);
    }

    const generated: NotificationItem[] = [];

    const [personsResult, roomsResult, funnelResult, errorResult, retentionResult] = await Promise.allSettled([
      postHogService.fetchPersons({ maxPages: 2, pageSize: 20 }),
      settings.enableRoomLeadAlerts !== false ? postHogService.fetchRoomsAnalytics('30d') : Promise.resolve(null),
      postHogService.fetchFunnelData('30d', 'all'),
      settings.enableSystemHealthAlerts !== false ? postHogService.fetchErrorMonitoring('7d') : Promise.resolve(null),
      settings.enableRetentionMilestones !== false ? postHogService.fetchRetentionData('all', 'all') : Promise.resolve(null),
    ]);

    // 1. Live Person / Creator Signups
    if (personsResult.status === 'fulfilled' && Array.isArray(personsResult.value) && personsResult.value.length > 0) {
      const validPersons = personsResult.value.filter((p: any) => {
        const props = p.properties || {};
        return props.email || props.name || (p.distinct_ids && p.distinct_ids.some((d: string) => !d.startsWith('019') && d.length < 20));
      });

      for (const p of validPersons.slice(0, 3)) {
        const props = p.properties || {};
        const name = props.name || (props.email ? props.email.split('@')[0] : `Creator #${p.id}`);
        const email = props.email || 'Identified Profile';
        const country = props.$geoip_country_name || props.country || '';
        const source = postHogService.classifyAcquisitionChannel(props);

        const notifId = `notif-user-${p.id}`;
        const createdAt = p.created_at || props.$first_seen || new Date(now - 1000 * 60 * 35).toISOString();

        generated.push({
          id: notifId,
          title: 'New Creator Account Identified',
          message: `Creator "${name}" (${email}) registered${country ? ` from ${country}` : ''} via ${source}. Profile and studio active.`,
          severity: 'info',
          category: 'funnel',
          triggerRule: 'Event: user_signed_up / $identify',
          timestamp: createdAt,
          isRead: false,
          link: '/users',
        });
      }
    }

    // 2. Showcase Room Milestones
    if (roomsResult.status === 'fulfilled' && (roomsResult.value as any)?.topPerformingRooms && Array.isArray((roomsResult.value as any).topPerformingRooms)) {
      const activeRooms = (roomsResult.value as any).topPerformingRooms.filter((r: any) => r.views >= 3);
      for (const room of activeRooms.slice(0, 2)) {
        const notifId = `notif-room-${room.roomId}`;
        generated.push({
          id: notifId,
          title: 'Showcase Room Milestone',
          message: `Room "${room.roomName}" by ${room.ownerName} reached ${room.views} views (${room.uniqueViews} unique visitors) with high recruiter dwell time.`,
          severity: 'success',
          category: 'rooms',
          triggerRule: 'Milestone: High showcase room recruiter views',
          timestamp: new Date(now - 1000 * 60 * 55).toISOString(),
          isRead: false,
          link: '/dashboard/rooms',
        });
      }
    }

    // 3. Funnel Telemetry & Drop-off Threshold
    if (funnelResult.status === 'fulfilled' && (funnelResult.value as any)?.stages && Array.isArray((funnelResult.value as any).stages)) {
      const funnelData: any = funnelResult.value;
      const threshold = settings.funnelDropoffThreshold || 40;

      if (Array.isArray(funnelData.dropoff)) {
        const highDrop = funnelData.dropoff.find((d: any) => d && d.percentage >= threshold);
        if (highDrop) {
          generated.push({
            id: `notif-funnel-dropoff-${highDrop.from.replace(/[^a-zA-Z0-9]/g, '')}`,
            title: 'Elevated Funnel Drop-off Alert',
            message: `Significant drop-off (${highDrop.percentage}%) detected between "${highDrop.from}" and "${highDrop.to}". Creator onboarding review recommended.`,
            severity: 'warning',
            category: 'funnel',
            triggerRule: `Trigger: Funnel Step Drop-off ≥ ${threshold}% threshold`,
            timestamp: new Date(now - 1000 * 60 * 75).toISOString(),
            isRead: false,
            link: '/dashboard/funnel',
          });
        }
      }

      if (funnelData.overallConversion && funnelData.overallConversion >= 50) {
        const completedCount = funnelData.stages[funnelData.stages.length - 1]?.count || 0;
        generated.push({
          id: 'notif-funnel-benchmark',
          title: 'Funnel Conversion Benchmark Achieved',
          message: `Creator onboarding funnel conversion reached ${funnelData.overallConversion}% (${completedCount} of ${funnelData.totalUsers} completed registration).`,
          severity: 'success',
          category: 'funnel',
          triggerRule: `Trigger: Onboarding conversion ≥ 50% target`,
          timestamp: new Date(now - 1000 * 60 * 140).toISOString(),
          isRead: false,
          link: '/dashboard/funnel',
        });
      }
    }

    // 4. Live Error Monitoring & Exceptions
    if (errorResult.status === 'fulfilled' && (errorResult.value as any)?.unhandledCount > 0 && Array.isArray((errorResult.value as any).issues) && (errorResult.value as any).issues.length > 0) {
      const errorData: any = errorResult.value;
      const topIssue = errorData.issues[0];
      generated.push({
        id: `notif-exception-${topIssue.issueId || topIssue.type.replace(/[^a-zA-Z0-9]/g, '')}`,
        title: 'Unhandled Client Exception Detected',
        message: `${errorData.unhandledCount} unhandled client exception(s) logged in telemetry. Top issue: "${topIssue.type}: ${topIssue.message}".`,
        severity: 'critical',
        category: 'system',
        triggerRule: 'Trigger: Unhandled $exception event in telemetry',
        timestamp: topIssue.lastSeen || new Date(now - 1000 * 60 * 10).toISOString(),
        isRead: false,
        link: '/dashboard/errors',
      });
    }

    // 5. Cohort Retention Benchmark
    if (retentionResult.status === 'fulfilled' && (retentionResult.value as any)?.retention7d && (retentionResult.value as any).retention7d.percentage > 0) {
      const retentionData: any = retentionResult.value;
      generated.push({
        id: 'notif-retention-benchmark',
        title: 'Cohort Retention Benchmark Update',
        message: `7-Day returning creator retention is pacing at ${retentionData.retention7d.percentage}% (+${retentionData.retention7d.change || 0}% WoW).`,
        severity: 'info',
        category: 'retention',
        triggerRule: 'Trigger: Retention milestone tracking',
        timestamp: new Date(now - 1000 * 60 * 240).toISOString(),
        isRead: false,
        link: '/dashboard/retention',
      });
    }

    // Combine manual notifications (such as test email alerts) with live generated ones
    const combined = [...this.manualNotifications, ...generated];

    // Sort by timestamp descending
    combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    this.cachedNotifications = combined;
    this.lastFetchedAt = now;

    return this.applyReadAndDismissState(combined);
  }

  private applyReadAndDismissState(items: NotificationItem[]): NotificationItem[] {
    return items
      .filter(n => !this.dismissedIds.has(n.id))
      .map(n => ({
        ...n,
        isRead: n.isRead || this.readIds.has(n.id),
      }));
  }

  markAsRead(id: string): void {
    this.readIds.add(id);
    if (this.cachedNotifications) {
      this.cachedNotifications = this.cachedNotifications.map(n =>
        n.id === id ? { ...n, isRead: true } : n
      );
    }
  }

  markAllAsRead(): void {
    if (this.cachedNotifications) {
      for (const n of this.cachedNotifications) {
        this.readIds.add(n.id);
      }
      this.cachedNotifications = this.cachedNotifications.map(n => ({ ...n, isRead: true }));
    }
  }

  dismiss(id: string): void {
    this.dismissedIds.add(id);
    this.manualNotifications = this.manualNotifications.filter(n => n.id !== id);
    if (this.cachedNotifications) {
      this.cachedNotifications = this.cachedNotifications.filter(n => n.id !== id);
    }
  }

  addManualNotification(item: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>): NotificationItem {
    const newItem: NotificationItem = {
      ...item,
      id: `notif-manual-${Date.now()}`,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    this.manualNotifications.unshift(newItem);
    if (this.cachedNotifications) {
      this.cachedNotifications.unshift(newItem);
    }
    return newItem;
  }
}

export const notificationService = new NotificationService();
