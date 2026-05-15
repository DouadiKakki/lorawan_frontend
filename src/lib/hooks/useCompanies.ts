import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';

const KEY = ['companies'];

export function useCompanies() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: KEY,
    queryFn: () => api.get('/companies').then(r => r.data),
  });

  const create = useMutation({
    mutationFn: (data: any) => api.post('/companies', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.put(`/companies/${id}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/companies/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  return { ...query, create, update, remove };
}
