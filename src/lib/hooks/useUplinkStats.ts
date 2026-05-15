import { useQuery } from '@tanstack/react-query';
import { api } from '../api';

export function useUplinkStatsHourly() {
  return useQuery({
    queryKey: ['uplinks', 'stats', 'hourly'],
    queryFn: () => api.get('/uplinks/stats/hourly').then(r => r.data),
    staleTime: 60_000,
  });
}

export function useUplinkStatsGateway() {
  return useQuery({
    queryKey: ['uplinks', 'stats', 'gateway'],
    queryFn: () => api.get('/uplinks/stats/gateway').then(r => r.data),
    staleTime: 60_000,
  });
}

export function useUplinkStatsSummary() {
  return useQuery({
    queryKey: ['uplinks', 'stats', 'summary'],
    queryFn: () => api.get('/uplinks/stats/summary').then(r => r.data),
    staleTime: 60_000,
  });
}
