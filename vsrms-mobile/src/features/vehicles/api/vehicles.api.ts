import client from '@/services/http.client';
import { Vehicle } from '../types/vehicles.types';

export const fetchVehicles = async (): Promise<Vehicle[]> => {
  const { data } = await client.get('/vehicles');
  return data.data || data;
};

export const fetchVehicle = async (id: string): Promise<Vehicle> => {
  const { data } = await client.get(`/vehicles/${id}`);
  return data.vehicle || data;
};

export const createVehicle = async (vehicle: Partial<Vehicle>): Promise<Vehicle> => {
  const { data } = await client.post('/vehicles', vehicle);
  return data.vehicle || data;
};

export const updateVehicle = async (id: string, vehicle: Partial<Vehicle>): Promise<Vehicle> => {
  const { data } = await client.put(`/vehicles/${id}`, vehicle);
  return data.vehicle || data;
}

export const deleteVehicle = async (id: string): Promise<void> => {
  await client.delete(`/vehicles/${id}`);
}

export const uploadVehicleImage = async (id: string, uri: string): Promise<Vehicle> => {
  const formData = new FormData();
  const filename = uri.split('/').pop() ?? 'image.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const mimeType = match ? `image/${match[1].toLowerCase().replace('jpg', 'jpeg')}` : 'image/jpeg';
  formData.append('image', { uri, type: mimeType, name: filename } as any);
  const { data } = await client.post(`/vehicles/${id}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.vehicle || data;
};
