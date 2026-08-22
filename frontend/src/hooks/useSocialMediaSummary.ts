// src/hooks/useSocialMediaSummary.ts
// Custom hook for fetching social media summary and platform breakdown metrics

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { socialMediaApi } from '../api/socialMediaApi';
import type { SocialMediaSummaryResponse } from '../types/socialMedia';

export function useSocialMediaSummary(dateRange: string = '7d') {
  const queryClient = useQueryClient();

  const query = useQuery<SocialMediaSummaryResponse>({
    queryKey: ['social-media-summary', dateRange],
    queryFn: () => socialMediaApi.getSummary(dateRange),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const syncMutation = useMutation({
    mutationFn: (platform?: string) => socialMediaApi.triggerManualSync(platform),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-media-summary'] });
      queryClient.invalidateQueries({ queryKey: ['social-media-posts'] });
    },
  });

  return {
    ...query,
    summary: query.data,
    totalPosts: query.data?.totalPosts ?? 0,
    totalEngagement: query.data?.totalEngagement ?? 0,
    avgEngagementRate: query.data?.avgEngagementRate ?? 0,
    topPlatform: query.data?.topPlatform ?? 'linkedin',
    byPlatform: query.data?.byPlatform,
    trend: query.data?.trend ?? [],
    syncMutation,
  };
}
