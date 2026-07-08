import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';

const KEY = ['notifications'];

export function useNotifications() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: KEY,
    queryFn: () => api.get('/notifications').then(r => r.data),
  });

  const markRead = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const markAllRead = useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  return { ...query, markRead, markAllRead };
}
