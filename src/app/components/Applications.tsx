import { Plus, Radio, Trash2, Pencil, Users, Activity, Settings, Search, Filter } from 'lucide-react';
import { useState } from 'react';
import { Modal } from './Modal';
import { ConfirmDialog } from './ConfirmDialog';

interface Application {
  _id: string;
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

const emptyForm = { name: '', description: '', brand: '' };

const colors = [
  'from-blue-600 to-cyan-600',
  'from-purple-600 to-pink-600',
  'from-green-600 to-emerald-600',
  'from-orange-600 to-red-600',
  'from-yellow-600 to-orange-600',
];

export function Applications({ applications, onCreate, onUpdate, onDelete }: ApplicationsProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [deletingApp, setDeletingApp] = useState<Application | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [editFormData, setEditFormData] = useState(emptyForm);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const handleAdd = () => {
    onCreate({ name: formData.name, description: formData.description, brand: formData.brand });
    setShowAddModal(false);
    setFormData(emptyForm);
  };

  const handleEditOpen = (app: Application) => {
    setEditingApp(app);
    setEditFormData({ name: app.name, description: app.description, brand: app.brand });
  };

  const handleEditSave = () => {
    if (!editingApp) return;
    onUpdate(editingApp._id, { name: editFormData.name, description: editFormData.description, brand: editFormData.brand });
    setEditingApp(null);
  };

  const uniqueBrands = Array.from(new Set(applications.map(app => app.brand)));

  const filteredApplications = applications.filter(app => {
    if (searchQuery && !(
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.brand.toLowerCase().includes(searchQuery.toLowerCase())
    )) return false;
    if (filterBrand && app.brand !== filterBrand) return false;
    if (filterStatus && app.status !== filterStatus) return false;
    return true;
  });

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
              onClick={() => { setSearchQuery(''); setFilterBrand(''); setFilterStatus(''); }}
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
        {filteredApplications.map((app, i) => (
          <div
            key={app._id}
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:shadow-2xl hover:shadow-blue-500/10 transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${app.color || colors[i % colors.length]} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <Radio className="w-6 h-6 text-white" />
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEditOpen(app)}
                  className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors"
                >
                  <Pencil className="w-4 h-4 text-blue-400" />
                </button>
                <button
                  onClick={() => setDeletingApp(app)}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-white mb-2">{app.name}</h3>
            <p className="text-sm text-slate-400 mb-2">{app.description}</p>
            <p className="text-xs text-slate-500 mb-4">Brand: {app.brand}</p>

            <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-300">{app.devices ?? 0} devices</span>
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
              <button
                onClick={() => handleEditOpen(app)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-sm text-white transition-all"
              >
                <Settings className="w-4 h-4" />
                Configure
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); setFormData(emptyForm); }} title="Create New Application">
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
            <label className="text-sm text-slate-300 mb-2 block">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Temperature and humidity monitoring"
              rows={3}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm text-slate-300 mb-2 block">Brand</label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              placeholder="Brand Name"
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button onClick={() => { setShowAddModal(false); setFormData(emptyForm); }} className="flex-1 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-white transition-all">
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!formData.name}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Application
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editingApp} onClose={() => setEditingApp(null)} title="Edit Application">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-300 mb-2 block">Application Name *</label>
            <input
              type="text"
              value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm text-slate-300 mb-2 block">Description</label>
            <textarea
              value={editFormData.description}
              onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm text-slate-300 mb-2 block">Brand</label>
            <input
              type="text"
              value={editFormData.brand}
              onChange={(e) => setEditFormData({ ...editFormData, brand: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button onClick={() => setEditingApp(null)} className="flex-1 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-white transition-all">
              Cancel
            </button>
            <button
              onClick={handleEditSave}
              disabled={!editFormData.name}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deletingApp}
        onClose={() => setDeletingApp(null)}
        onConfirm={() => { if (deletingApp) { onDelete(deletingApp._id); setDeletingApp(null); } }}
        title="Delete Application"
        message={`Are you sure you want to delete "${deletingApp?.name}"? This cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
}
