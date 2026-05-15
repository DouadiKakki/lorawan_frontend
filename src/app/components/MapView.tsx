import { Layers } from 'lucide-react';
import { useGateways } from '@/lib/hooks/useGateways';

export function MapView() {
  const { data: apiGateways = [] } = useGateways();

  // Map each gateway to a pseudo-position using a deterministic hash of its EUI
  // (no real coordinates in schema — distribute visually across the map area)
  const gateways = (apiGateways as any[]).map((gw, i) => ({
    _id: gw._id,
    name: gw.name,
    status: gw.status,
    devices: 0,
    // spread gateways evenly, slight randomness from index
    lat: 15 + ((i * 37 + 13) % 70),
    lng: 10 + ((i * 53 + 7) % 80),
  }));

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:shadow-2xl hover:shadow-blue-500/10 transition-all">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">Gateway Distribution</h3>
          <p className="text-sm text-slate-400">{gateways.filter(g => g.status === 'online').length} gateways online</p>
        </div>
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
          <Layers className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Mock Map */}
      <div className="relative h-64 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg overflow-hidden border border-slate-700/50">
        {/* Grid background */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-10 grid-rows-10 h-full">
            {Array.from({ length: 100 }).map((_, i) => (
              <div key={i} className="border border-slate-600"></div>
            ))}
          </div>
        </div>

        {/* Gateway markers */}
        {gateways.map((gateway) => (
          <div
            key={gateway._id}
            className="absolute group cursor-pointer"
            style={{
              left: `${gateway.lng}%`,
              top: `${gateway.lat}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="relative">
              {/* Pulse effect */}
              {gateway.status === 'online' && (
                <div className="absolute inset-0 w-6 h-6 -left-3 -top-3 bg-blue-500/30 rounded-full animate-ping"></div>
              )}
              
              {/* Marker */}
              <div className={`w-4 h-4 rounded-full border-2 border-white shadow-lg ${
                gateway.status === 'online' ? 'bg-green-500' :
                gateway.status === 'warning' ? 'bg-yellow-500' :
                'bg-red-500'
              }`}></div>

              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 shadow-xl">
                  <div className="text-xs font-medium text-white">{gateway.name}</div>
                  <div className="text-xs text-slate-400">{gateway.devices} devices</div>
                  <div className={`text-xs ${
                    gateway.status === 'online' ? 'text-green-400' :
                    gateway.status === 'warning' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {gateway.status}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
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
