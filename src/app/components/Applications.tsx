import { Plus, Radio, MoreVertical, Users, Activity, Settings, Search, Filter } from 'lucide-react';
import { useState } from 'react';
import { Modal } from './Modal';

interface Application {
  id: number;
  name: string;
  description: string;
  brand: string;
  devices: number;
  status: string;
  color: string;
}

interface ApplicationsProps {
  applications: Application[];
  onCreate: (data: any) => void;
  onUpdate: (id: string, data: any) => void;
  onDelete: (id: string) => void;
}

export function Applications({ applications, onCreate, onUpdate, onDelete }: ApplicationsProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    brand: '',
  });
  
  // Filter and Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterBrand, setFilterBrand] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  const colors = [
    'from-blue-600 to-cyan-600',
    'from-purple-600 to-pink-600',
    'from-green-600 to-emerald-600',
    'from-orange-600 to-red-600',
    'from-yellow-600 to-orange-600',
  ];

  const handleAdd = () => {
    onCreate({ name: formData.name, description: formData.description, brand: formData.brand });
    setShowAddModal(false);
    setFormData({ name: '', description: '', brand: '' });
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this application?')) {
      onDelete(String(id));
    }
  };

  // Get unique brands for filter dropdown
  const uniqueBrands = Array.from(new Set(applications.map(app => app.brand)));

  // Apply filters and search
  const getFilteredApplications = () => {
    let filtered = applications;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(app => 
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply brand filter
    if (filterBrand) {
      filtered = filtered.filter(app => app.brand === filterBrand);
    }

    // Apply status filter
    if (filterStatus) {
      filtered = filtered.filter(app => app.status === filterStatus);
    }

    return filtered;
  };

  const filteredApplications = getFilteredApplications();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Applications</h2>
          <p className="text-slate-400">Manage your LoRaWAN applications</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all"
        >
          <Plus className="w-5 h-5" />
          New Application
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, brand, or description..."
                className="pl-10 pr-4 py-2 w-full bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Filter className="w-5 h-5 text-slate-400" />
            <select
              value={filterBrand}
              onChange={(e) => setFilterBrand(e.target.value)}
              className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Brands</option>
              {uniqueBrands.map((brand) => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          {(searchQuery || filterBrand || filterStatus) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterBrand('');
                setFilterStatus('');
              }}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors px-3 py-2 whitespace-nowrap"
            >
              Clear filters
            </button>
          )}
        </div>
        {filteredApplications.length === 0 && (searchQuery || filterBrand || filterStatus) && (
          <div className="text-center py-4 text-slate-400 text-sm mt-3 border-t border-slate-700/50">
            No applications found matching your filters
          </div>
        )}
      </div>

      {/* Applications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredApplications.map((app) => (
          <div
            key={app.id}
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:shadow-2xl hover:shadow-blue-500/10 transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${app.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <Radio className="w-6 h-6 text-white" />
              </div>
              <button 
                onClick={() => handleDelete(app.id)}
                className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 rounded-lg transition-all"
              >
                <MoreVertical className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <h3 className="text-lg font-semibold text-white mb-2">{app.name}</h3>
            <p className="text-sm text-slate-400 mb-2">{app.description}</p>
            <p className="text-xs text-slate-500 mb-4">Brand: {app.brand}</p>

            <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-300">{app.devices} devices</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                app.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
              }`}>
                {app.status}
              </span>
            </div>

            <div className="flex gap-2 mt-4">
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-sm text-white transition-all">
                <Activity className="w-4 h-4" />
                View
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-sm text-white transition-all">
                <Settings className="w-4 h-4" />
                Configure
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Create New Application"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-300 mb-2 block">Application Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Smart Building"
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm text-slate-300 mb-2 block">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Temperature and humidity monitoring"
              rows={3}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm text-slate-300 mb-2 block">Brand *</label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              placeholder="Brand Name"
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setShowAddModal(false)}
              className="flex-1 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-white transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!formData.name || !formData.description || !formData.brand}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Application
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}