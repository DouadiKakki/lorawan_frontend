import { createContext, useContext, ReactNode } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { useMapConfig } from './hooks/useMapConfig';

interface MapsCtx {
  isLoaded: boolean;
  loadError: Error | undefined;
}

const Context = createContext<MapsCtx>({ isLoaded: false, loadError: undefined });

export function useGoogleMaps() {
  return useContext(Context);
}

function Inner({ apiKey, children }: { apiKey: string; children: ReactNode }) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    id: 'google-map-script',
  });
  return <Context.Provider value={{ isLoaded, loadError }}>{children}</Context.Provider>;
}

export function GoogleMapsProvider({ children }: { children: ReactNode }) {
  const { data, isLoading } = useMapConfig();

  // Don't mount the loader until we have the key — avoids calling it with empty string first
  if (isLoading || !data?.apiKey) {
    return <Context.Provider value={{ isLoaded: false, loadError: undefined }}>{children}</Context.Provider>;
  }

  return <Inner apiKey={data.apiKey}>{children}</Inner>;
}
