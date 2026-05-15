import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';

const KEY = ['applications'];

export function useApplications() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: KEY,
    queryFn: () => api.get('/applications').then(r => r.data),
  });

  const create = useMutation({
    mutationFn: (data: any) => api.post('/applications', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.put(`/applications/${id}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/applications/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  return { ...query, create, update, remove };
}
