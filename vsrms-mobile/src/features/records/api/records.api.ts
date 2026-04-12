import client from '@/services/http.client';
import { ServiceRecord } from '../types/records.types';

export const fetchRecordsByVehicle = async (vehicleId: string, params?: Record<string, any>): Promise<ServiceRecord[]> => {
  const { data } = await client.get(`/records/vehicle/${vehicleId}`, { params });
  return data.data || data;
};

export const fetchRecord = async (id: string): Promise<ServiceRecord> => {
  const { data } = await client.get(`/records/${id}`);
  return data.record || data;
};

export const createRecord = async (payload: Partial<ServiceRecord>): Promise<ServiceRecord> => {
  const { data } = await client.post('/records', payload);
  return data.record || data;
};

export const fetchWorkshopRecords = async (workshopId: string, params?: Record<string, any>): Promise<{ data: ServiceRecord[]; total: number; page: number; pages: number }> => {
  const { data } = await client.get(`/records/workshop/${workshopId}`, { params });
  return data;
};
