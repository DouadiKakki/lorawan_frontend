import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import { auth } from '../auth';

export function useProfile() {
  const qc = useQueryClient();
  const payload = auth.getTokenPayload();
  const userId = payload?.sub;

  const query = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => api.get(`/users/${userId}`).then(r => r.data),
    enabled: Boolean(userId),
  });

  const update = useMutation({
    mutationFn: (data: { name?: string; email?: string; password?: string }) =>
      api.put(`/users/${userId}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile', userId] }),
  });

  const changePassword = useMutation({
    mutationFn: (data: { password: string }) =>
      api.put(`/users/${userId}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile', userId] }),
  });

  return { ...query, update, changePassword, userId };
}
