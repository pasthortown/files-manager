import api from '../../../services/api';
import type { DashboardStats, ActivityLog } from '../types';

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get<DashboardStats>('/dashboard/stats');
  return response.data;
};

export const getRecentActivity = async (): Promise<ActivityLog[]> => {
  const response = await api.get<ActivityLog[]>('/dashboard/activity');
  return response.data;
};
