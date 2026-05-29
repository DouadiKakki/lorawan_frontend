import { GoogleMap, Marker } from '@react-google-maps/api';
import { useGoogleMaps } from '@/lib/GoogleMapsProvider';

const DARK_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1e293b' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#334155' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];

interface DeviceLocationMapProps {
  lat: number;
  lng: number;
}

export function DeviceLocationMap({ lat, lng }: DeviceLocationMapProps) {
  const { isLoaded, loadError } = useGoogleMaps();
  const position = { lat, lng };

  if (loadError) return (
    <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-400 text-sm">
      Failed to load map
    </div>
  );

  if (!isLoaded) return (
    <div className="w-full h-full flex items-center justify-center bg-slate-900">
      <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '100%' }}
      center={position}
      zoom={13}
      options={{ styles: DARK_MAP_STYLES, disableDefaultUI: true, zoomControl: true }}
    >
      <Marker position={position} />
    </GoogleMap>
  );
}
