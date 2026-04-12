import { useQuery } from '@tanstack/react-query';
import { recordKeys } from './records.keys';
import { fetchRecordsByVehicle, fetchRecord, fetchWorkshopRecords } from '../api/records.api';

export function useVehicleRecords(vehicleId: string, params?: Record<string, any>) {
  return useQuery({
    queryKey: [...recordKeys.vehicle(vehicleId), params],
    queryFn:  () => fetchRecordsByVehicle(vehicleId, params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRecord(id: string) {
  return useQuery({
    queryKey: recordKeys.detail(id),
    queryFn:  () => fetchRecord(id),
    staleTime: 5 * 60 * 1000,
  });
}

export function useWorkshopRecords(workshopId: string, params?: Record<string, any>) {
  return useQuery({
    queryKey: [...recordKeys.workshop(workshopId), params],
    queryFn:  () => fetchWorkshopRecords(workshopId, params),
    enabled:  !!workshopId,
    staleTime: 0,
  });
}
