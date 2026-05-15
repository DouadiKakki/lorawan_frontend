import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '../api';

export function useUplinks(deviceEUI?: string, applicationId?: string, gatewayEUI?: string) {
  return useInfiniteQuery({
    queryKey: ['uplinks', deviceEUI, applicationId, gatewayEUI],
    queryFn: ({ pageParam = 1 }) => {
      const params = new URLSearchParams({ page: String(pageParam), limit: '50' });
      if (deviceEUI) params.set('deviceEUI', deviceEUI);
      if (applicationId) params.set('applicationId', applicationId);
      if (gatewayEUI) params.set('gatewayEUI', gatewayEUI);
      return api.get(`/uplinks?${params}`).then(r => r.data);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage: any) => {
      const { page, limit, total } = lastPage;
      return page * limit < total ? page + 1 : undefined;
    },
  });
}
