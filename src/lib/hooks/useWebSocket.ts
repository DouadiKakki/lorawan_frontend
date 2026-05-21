import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { auth } from '../auth';

export function useWebSocket() {
  const qc = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = auth.getAccessToken();
    if (!token) return;

    const socket = io(import.meta.env.VITE_WS_URL, {
      path: import.meta.env.VITE_WS_PATH ?? '/ws',
      query: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('uplink.received', () => {
      qc.invalidateQueries({ queryKey: ['uplinks'] });
    });

    socket.on('gateway.status', (gateway: any) => {
      qc.setQueryData(['gateways'], (old: any[]) =>
        old ? old.map(g => g._id === gateway._id ? { ...g, ...gateway } : g) : old,
      );
    });

    socket.on('device.status', (device: any) => {
      qc.setQueryData(['end-devices'], (old: any[]) =>
        old ? old.map(d => d._id === device._id ? { ...d, ...device } : d) : old,
      );
    });

    socketRef.current = socket;
    return () => { socket.disconnect(); };
  }, [qc]);

  return socketRef.current;
}
