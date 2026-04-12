import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vehicleKeys } from './vehicles.keys';
import { createVehicle, updateVehicle, deleteVehicle, uploadVehicleImage } from '../api/vehicles.api';
import { useToast } from '@/providers/ToastProvider';
import { handleApiError } from '@/services/error.handler';
import { Vehicle } from '../types/vehicles.types';

export function useCreateVehicle() {
  const qc = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: createVehicle,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: vehicleKeys.lists() });
      showToast('Vehicle added successfully', 'success');
    },
    onError: (e) => showToast(handleApiError(e), 'error'),
  });
}

export function useUpdateVehicle() {
  const qc = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ id, vehicle }: { id: string; vehicle: Partial<Vehicle> }) => 
      updateVehicle(id, vehicle),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: vehicleKeys.lists() });
      qc.invalidateQueries({ queryKey: vehicleKeys.detail(data._id) });
      showToast('Vehicle updated successfully', 'success');
    },
    onError: (e) => showToast(handleApiError(e), 'error'),
  });
}

export function useDeleteVehicle() {
  const qc = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: deleteVehicle,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: vehicleKeys.lists() });
      showToast('Vehicle deleted successfully', 'success');
    },
    onError: (e) => showToast(handleApiError(e), 'error'),
  });
}

export function useUploadVehicleImage() {
  const qc = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ id, uri }: { id: string; uri: string }) => uploadVehicleImage(id, uri),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: vehicleKeys.lists() });
      qc.invalidateQueries({ queryKey: vehicleKeys.detail(data._id) });
      showToast('Vehicle photo updated', 'success');
    },
    onError: (e) => showToast(handleApiError(e), 'error'),
  });
}
