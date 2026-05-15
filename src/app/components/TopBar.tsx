import { Plus, Star, Bell, Share2, MoreVertical, User, ChevronRight } from 'lucide-react';

export function TopBar() {
  return (
    <div className="bg-white border-b border-gray-200">
      {/* Top row with icons */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <button className="hover:text-blue-600">Applications</button>
          <ChevronRight className="w-4 h-4" />
          <button className="hover:text-blue-600">Tab Sensors</button>
          <ChevronRight className="w-4 h-4" />
          <button className="hover:text-blue-600">End devices</button>
          <ChevronRight className="w-4 h-4" />
          <button className="hover:text-blue-600">winet-light</button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-blue-600">Live data</span>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            Add
          </button>
          <button className="p-1.5 hover:bg-gray-100 rounded">
            <Star className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-1.5 hover:bg-gray-100 rounded">
            <Bell className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-1.5 hover:bg-gray-100 rounded">
            <Share2 className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded cursor-pointer">
            <span className="text-sm">admin</span>
            <User className="w-5 h-5 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Application header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
            <span className="text-blue-600">💡</span>
          </div>
          <div>
            <h1 className="font-semibold">winet-light</h1>
            <p className="text-xs text-gray-500">eui-70b3d57ed0066e81</p>
          </div>
          <button className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200">
            + Add label
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span className="flex items-center gap-1">
            🕐 Last activity: 11 seconds ago
          </span>
          <span>📶 upʷ: 5 / dⁿʷ: 5 (Δdb)</span>
          <span>$ (NA/tx down)</span>
          <button className="p-1 hover:bg-gray-100 rounded">
            <Star className="w-4 h-4" />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
