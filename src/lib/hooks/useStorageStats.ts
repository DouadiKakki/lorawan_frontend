import { useQuery } from '@tanstack/react-query';
import { api } from '../api';

export function useStorageStats() {
  return useQuery({
    queryKey: ['storage', 'stats'],
    queryFn: () => api.get('/storage/stats').then(r => r.data),
    staleTime: 30_000,
  });
}
