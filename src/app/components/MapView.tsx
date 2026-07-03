import { useState, useCallback } from 'react';
import { Layers } from 'lucide-react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { useGateways } from '@/lib/hooks/useGateways';
import { useGoogleMaps } from '@/lib/GoogleMapsProvider';

const MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1e293b' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#334155' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1e293b' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];

const MAP_OPTIONS: google.maps.MapOptions = {
  styles: MAP_STYLES,
  disableDefaultUI: true,
  zoomControl: true,
  scrollwheel: true,
};

function statusColor(status: string) {
  if (status === 'online') return '#22c55e';
  if (status === 'warning') return '#eab308';
  return '#ef4444';
}

function makeMarkerIcon(status: string): google.maps.Symbol {
  return {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: statusColor(status),
    fillOpacity: 1,
    strokeColor: '#fff',
    strokeWeight: 2,
    scale: 8,
  };
}

// Deterministic fallback coords from index when gateway has no real coords
function fallbackCoords(index: number) {
  return {
    lat: 36 + ((index * 37 + 13) % 14),
    lng: 2 + ((index * 53 + 7) % 8),
  };
}

export function MapView() {
  const { isLoaded, loadError } = useGoogleMaps();
  const { data: apiGateways = [] } = useGateways();
  const [selected, setSelected] = useState<string | null>(null);

  const gateways = (apiGateways as any[]).map((gw, i) => ({
    _id: gw._id,
    name: gw.name,
    status: gw.status,
    eui: gw.eui,
    position: (gw.lat && gw.lng)
      ? { lat: Number(gw.lat), lng: Number(gw.lng) }
      : fallbackCoords(i),
  }));

  const center = gateways.length > 0
    ? gateways.reduce(
        (acc, gw) => ({ lat: acc.lat + gw.position.lat / gateways.length, lng: acc.lng + gw.position.lng / gateways.length }),
        { lat: 0, lng: 0 }
      )
    : { lat: 36.7, lng: 3.2 };

  const onLoad = useCallback((map: google.maps.Map) => {
    if (gateways.length > 1) {
      const bounds = new window.google.maps.LatLngBounds();
      gateways.forEach(gw => bounds.extend(gw.position));
      map.fitBounds(bounds, 60);
    }
  }, [gateways.length]);

  const onlineCount = gateways.filter(g => g.status === 'online').length;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:shadow-2xl hover:shadow-blue-500/10 transition-all">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">Gateway Distribution</h3>
          <p className="text-sm text-slate-400">{onlineCount} gateways online</p>
        </div>
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
          <Layers className="w-5 h-5 text-white" />
        </div>
      </div>

      <div className="relative h-64 rounded-lg overflow-hidden border border-slate-700/50">
        <style>{`
          .gm-style-iw-c { background: transparent !important; box-shadow: none !important; padding: 0 !important; }
          .gm-style-iw-d { background: transparent !important; overflow: hidden !important; padding: 0 !important; }
          .gm-style-iw-t::after { display: none !important; }
          .gm-ui-hover-effect { top: 2px !important; right: 2px !important; }
        `}</style>
        {loadError && (
          <div className="h-full flex items-center justify-center bg-slate-900 text-slate-400 text-sm">
            Failed to load map
          </div>
        )}
        {!loadError && !isLoaded && (
          <div className="h-full flex items-center justify-center bg-slate-900">
            <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          </div>
        )}
        {!loadError && isLoaded && (
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={center}
            zoom={gateways.length === 1 ? 12 : 6}
            options={MAP_OPTIONS}
            onLoad={onLoad}
          >
            {gateways.map(gw => (
              <Marker
                key={gw._id}
                position={gw.position}
                icon={makeMarkerIcon(gw.status)}
                onClick={() => setSelected(gw._id)}
              />
            ))}
            {selected && (() => {
              const gw = gateways.find(g => g._id === selected);
              if (!gw) return null;
              return (
                <InfoWindow position={gw.position} onCloseClick={() => setSelected(null)}>
                  <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '8px 12px', minWidth: 140 }}>
                    <div style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>{gw.name}</div>
                    <div style={{ color: '#94a3b8', fontSize: 11, fontFamily: 'monospace', marginTop: 2 }}>{gw.eui}</div>
                    <div style={{ color: statusColor(gw.status), fontSize: 11, marginTop: 4, textTransform: 'capitalize' }}>{gw.status}</div>
                  </div>
                </InfoWindow>
              );
            })()}
          </GoogleMap>
        )}
      </div>

      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm text-slate-400">Online</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span className="text-sm text-slate-400">Warning</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-sm text-slate-400">Offline</span>
        </div>
      </div>
    </div>
  );
}
