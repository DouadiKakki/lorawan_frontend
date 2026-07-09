import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';

const KEY = ['users'];

export function useUsers() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: KEY,
    queryFn: () => api.get('/users').then(r => r.data),
  });

  const create = useMutation({
    mutationFn: (data: any) => api.post('/users', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.put(`/users/${id}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const bulkDelete = useMutation({
    mutationFn: (ids: string[]) => api.post('/users/bulk-delete', { ids }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const bulkDeactivate = useMutation({
    mutationFn: (ids: string[]) => api.post('/users/bulk-deactivate', { ids }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const bulkResetPassword = useMutation({
    mutationFn: (ids: string[]) => api.post('/users/bulk-reset-password', { ids }).then(r => r.data),
  });

  return { ...query, create, update, remove, bulkDelete, bulkDeactivate, bulkResetPassword };
}
