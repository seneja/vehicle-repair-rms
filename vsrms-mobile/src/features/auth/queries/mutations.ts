import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authKeys } from './auth.keys';
import { updateMe, deactivateUser, registerStaff, RegisterStaffPayload } from '../api/auth.api';
import { useToast } from '@/providers/ToastProvider';
import { handleApiError } from '@/services/error.handler';

export function useUpdateMe() {
  const qc = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: updateMe,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: authKeys.me() });
      showToast('Profile updated', 'success');
    },
    onError: (e: any) => showToast(handleApiError(e), 'error'),
  });
}

export function useDeactivateUser() {
  const qc = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: deactivateUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: authKeys.users() });
      showToast('User deactivated', 'success');
    },
    onError: (e: any) => showToast(handleApiError(e), 'error'),
  });
}

export function useRegisterStaff() {
  const qc = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (payload: RegisterStaffPayload) => registerStaff(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: authKeys.staff() });
      showToast('Technician registered successfully', 'success');
    },
    onError: (e: any) => showToast(handleApiError(e), 'error'),
  });
}
