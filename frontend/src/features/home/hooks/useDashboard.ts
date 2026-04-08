import { useState, useEffect, useCallback } from 'react';
import { getDashboardStats, getRecentActivity } from '../services';
import type { DashboardStats, ActivityLog } from '../types';

interface UseDashboardReturn {
  stats: DashboardStats | null;
  activity: ActivityLog[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export const useDashboard = (): UseDashboardReturn => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, activityData] = await Promise.all([
        getDashboardStats(),
        getRecentActivity(),
      ]);
      setStats(statsData);
      setActivity(activityData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar datos del dashboard';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { stats, activity, loading, error, refresh: fetchData };
};
