// src/hooks/useLinkedInData.ts
// Custom hook for querying LinkedIn-specific metrics, demographic breakdowns, and posts

import { useQuery } from '@tanstack/react-query';
import { socialMediaApi } from '../api/socialMediaApi';
import type { LinkedInDetailedData, SocialMediaPostsResponse } from '../types/socialMedia';

export function useLinkedInData(dateRange: string = '7d') {
  const detailedQuery = useQuery<LinkedInDetailedData>({
    queryKey: ['linkedin-detailed', dateRange],
    queryFn: () => socialMediaApi.getLinkedInDetailed(dateRange) as Promise<LinkedInDetailedData>,
    staleTime: 1000 * 60 * 5, // 5 min
  });

  const postsQuery = useQuery<SocialMediaPostsResponse>({
    queryKey: ['linkedin-posts', dateRange],
    queryFn: () =>
      socialMediaApi.getPosts({
        platform: 'linkedin',
        dateRange,
        limit: 50,
      }),
    staleTime: 1000 * 60 * 5,
  });

  return {
    isLoading: detailedQuery.isLoading || postsQuery.isLoading,
    isError: detailedQuery.isError || postsQuery.isError,
    error: detailedQuery.error || postsQuery.error,
    refetch: () => {
      detailedQuery.refetch();
      postsQuery.refetch();
    },
    data: detailedQuery.data,
    metrics: detailedQuery.data?.metrics,
    audienceDemographics: detailedQuery.data?.audienceDemographics,
    campaigns: detailedQuery.data?.campaigns || [],
    recommendations: detailedQuery.data?.recommendations,
    hourlyTimeline: detailedQuery.data?.hourlyTimeline || [],
    posts: postsQuery.data?.posts || [],
  };
}
