import { useQuery } from '@tanstack/react-query';
import { authKeys } from './auth.keys';
import { getMe, listUsers, getWorkshopStaff } from '../api/auth.api';

export function useMe() {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn:  getMe,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUsers(params?: Record<string, any>) {
  return useQuery({
    queryKey: [...authKeys.users(), params],
    queryFn:  () => listUsers(params),
    staleTime: 0,
  });
}

export function useWorkshopStaff(params?: Record<string, any>) {
  return useQuery({
    queryKey: [...authKeys.staff(), params],
    queryFn:  () => getWorkshopStaff(params),
    staleTime: 0,
  });
}
