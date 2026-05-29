import { useQuery } from '@tanstack/react-query';
import { api } from '../api';

export function useMapConfig() {
  return useQuery<{ apiKey: string }>({
    queryKey: ['config', 'maps'],
    queryFn: () => api.get('/config/maps').then(r => r.data),
    staleTime: Infinity,
  });
}
