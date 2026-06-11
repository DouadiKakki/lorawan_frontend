import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';

const KEY = ['end-devices'];

export function useEndDevices() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: KEY,
    queryFn: () => api.get('/end-devices').then(r => r.data),
  });

  const create = useMutation({
    mutationFn: (data: any) => api.post('/end-devices', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.put(`/end-devices/${id}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/end-devices/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const sendDownlink = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.post(`/end-devices/${id}/downlink`, data).then(r => r.data),
  });

  const updateShare = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.put(`/end-devices/${id}/share`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  return { ...query, create, update, remove, sendDownlink, updateShare };
}
