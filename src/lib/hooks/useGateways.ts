import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';

const KEY = ['gateways'];

export function useGateways() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: KEY,
    queryFn: () => api.get('/gateways').then(r => r.data),
  });

  const create = useMutation({
    mutationFn: (data: any) => api.post('/gateways', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.put(`/gateways/${id}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/gateways/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  return { ...query, create, update, remove };
}
