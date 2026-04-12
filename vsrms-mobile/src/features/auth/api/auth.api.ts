import client from '@/services/http.client';
import { User, LoginPayload, RegisterPayload, AuthResponse } from '../types/auth.types';

export const login = async (payload: LoginPayload): Promise<AuthResponse> => {
  const { data } = await client.post('/auth/login', payload);
  return data;
};

export const register = async (payload: RegisterPayload): Promise<void> => {
  await client.post('/auth/register', payload);
};

export const syncProfile = async (): Promise<User> => {
  const { data } = await client.post('/auth/sync-profile');
  return data.user || data;
};

export const getMe = async (): Promise<User> => {
  const { data } = await client.get('/auth/me');
  return data.user || data;
};

export const updateMe = async (payload: Partial<User>): Promise<User> => {
  const { data } = await client.put('/auth/me', payload);
  return data.user || data;
};

export const listUsers = async (params?: Record<string, any>): Promise<{ data: User[]; total: number; page: number; pages: number }> => {
  const { data } = await client.get('/auth/users', { params });
  return data;
};

export const deactivateUser = async (id: string): Promise<void> => {
  await client.delete(`/auth/users/${id}`);
};

export interface RegisterStaffPayload {
  firstName: string;
  lastName:  string;
  email:     string;
  phone?:    string;
  password:  string;
}

export const registerStaff = async (payload: RegisterStaffPayload): Promise<User> => {
  const { data } = await client.post('/auth/staff', payload);
  return data.user || data;
};

export const getWorkshopStaff = async (params?: Record<string, any>): Promise<{ data: User[]; total: number }> => {
  const { data } = await client.get('/auth/staff', { params });
  return data;
};
