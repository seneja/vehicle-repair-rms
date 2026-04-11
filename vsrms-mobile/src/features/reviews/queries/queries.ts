import { useQuery } from '@tanstack/react-query';
import { reviewKeys } from './reviews.keys';
import { fetchMyReviews, fetchWorkshopReviews } from '../api/reviews.api';

export function useMyReviews(params?: Record<string, any>) {
  return useQuery({
    queryKey: [...reviewKeys.mine(), params],
    queryFn:  () => fetchMyReviews(params),
    staleTime: 5 * 60 * 1000, 
  });
}

export function useWorkshopReviews(workshopId: string, params?: Record<string, any>) {
  return useQuery({
    queryKey: [...reviewKeys.workshop(workshopId), params],
    queryFn:  () => fetchWorkshopReviews(workshopId, params),
    staleTime: 5 * 60 * 1000,
    enabled:  !!workshopId,
  });
}
