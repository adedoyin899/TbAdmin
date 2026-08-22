// src/hooks/useCampaignPerformance.ts
// Custom hook for querying multi-channel marketing campaigns and ROI performance

import { useQuery } from '@tanstack/react-query';
import { campaignApi } from '../api/campaignApi';
import type {
  CampaignItem,
  CampaignPerformanceResponse,
} from '../types/socialMedia';

export function useCampaignPerformance(campaignId?: string, statusFilter: string = 'all') {
  // 1. List of all campaigns
  const listQuery = useQuery<CampaignItem[]>({
    queryKey: ['campaigns-list', statusFilter],
    queryFn: () => campaignApi.listCampaigns(statusFilter),
    staleTime: 1000 * 60 * 5,
  });

  // 2. Performance details for single campaign
  const performanceQuery = useQuery<CampaignPerformanceResponse>({
    queryKey: ['campaign-performance', campaignId],
    queryFn: () => campaignApi.getCampaignPerformance(campaignId || 'camp_q3_launch'),
    enabled: !!campaignId,
    staleTime: 1000 * 60 * 5,
  });

  return {
    isLoading: listQuery.isLoading || (!!campaignId && performanceQuery.isLoading),
    isError: listQuery.isError || performanceQuery.isError,
    campaignsList: listQuery.data || [],
    currentCampaign: performanceQuery.data?.campaign,
    performance: performanceQuery.data?.performance,
    byChannel: performanceQuery.data?.performance?.by_channel,
    timeline: performanceQuery.data?.performance?.timeline || [],
    posts: performanceQuery.data?.posts || [],
    refetchList: listQuery.refetch,
    refetchPerformance: performanceQuery.refetch,
  };
}
