import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '../api';

export function useDownlinks(deviceEUI?: string) {
  return useInfiniteQuery({
    queryKey: ['downlinks', deviceEUI],
    queryFn: ({ pageParam = 1 }) => {
      const params = new URLSearchParams({ page: String(pageParam), limit: '50' });
      if (deviceEUI) params.set('deviceEUI', deviceEUI);
      return api.get(`/downlinks?${params}`).then(r => r.data);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage: any) => {
      const { page, limit, total } = lastPage;
      return page * limit < total ? page + 1 : undefined;
    },
  });
}
