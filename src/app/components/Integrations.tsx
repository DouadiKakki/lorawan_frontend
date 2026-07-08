import { Plus, Webhook, Cloud, Code, Link, CheckCircle, XCircle, Settings, Edit, Radio, Server } from 'lucide-react';
import { useState } from 'react';
import { Modal } from './Modal';
import { ConfirmDialog } from './ConfirmDialog';

interface Integration {
  id: number;
  name: string;
  type: string;
  status: string;
  events: number;
  lastSync: string;
  url: string;
  apiKey: string;
}

interface IntegrationsProps {
  integrations: Integration[];
  onCreate: (data: any) => void;
  onUpdate: (id: string, data: any) => void;
  onDelete: (id: string) => void;
}

export function Integrations({ integrations, onCreate, onUpdate, onDelete }: IntegrationsProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingIntegration, setDeletingIntegration] = useState<Integration | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Webhook',
    url: '',
    apiKey: '',
  });

  const handleAdd = () => {
    onCreate({ name: formData.name, type: formData.type, url: formData.url, apiKey: formData.apiKey });
    setShowModal(false);
    setFormData({ name: '', type: 'Webhook', url: '', apiKey: '' });
  };

  const handleEdit = (integration: Integration) => {
    setEditingIntegration(integration);
    setFormData({
      name: integration.name,
      type: integration.type,
      url: integration.url,
      apiKey: integration.apiKey,
    });
    setShowModal(true);
  };

  const handleUpdate = () => {
    if (editingIntegration) {
      onUpdate(String((editingIntegration as any)._id || editingIntegration.id), { name: formData.name, type: formData.type, url: formData.url, apiKey: formData.apiKey });
      setShowModal(false);
      setEditingIntegration(null);
      setFormData({ name: '', type: 'Webhook', url: '', apiKey: '' });
    }
  };

  const handleDelete = (integration: Integration) => {
    setDeletingIntegration(integration);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (deletingIntegration) {
      onDelete(String((deletingIntegration as any)._id || deletingIntegration.id));
      setDeletingIntegration(null);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'Cloud': return Cloud;
      case 'Webhook': return Webhook;
      case 'API': return Code;
      case 'Protocol': return Radio;
      case 'Database': return Code;
      case 'Visualization': return Code;
      case 'Notification': return Webhook;
      case 'Automation': return Code;
      default: return Webhook;
    }
  };

  const getColor = (index: number) => {
    const colors = [
      'from-orange-600 to-red-600',
      'from-blue-600 to-cyan-600',
      'from-purple-600 to-pink-600',
      'from-gray-600 to-slate-600',
      'from-green-600 to-emerald-600',
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Integrations</h2>
          <p className="text-slate-400">Connect external services and platforms</p>
        </div>
        <button 
          onClick={() => {
            setEditingIntegration(null);
            setFormData({ name: '', type: 'Webhook', url: '', apiKey: '' });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all"
        >
          <Plus className="w-5 h-5" />
          New Integration
        </button>
      </div>

      {/* Stats */}
      {(() => {
        const activeCount = integrations.filter(i => i.status === 'active').length;
        const inactiveCount = integrations.length - activeCount;
        const totalEvents = integrations.reduce((sum, i) => sum + (i.events || 0), 0);
        return (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{activeCount}</div>
                  <div className="text-xs text-slate-400">Active</div>
                </div>
              </div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-slate-600 rounded-lg flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{inactiveCount}</div>
                  <div className="text-xs text-slate-400">Inactive</div>
                </div>
              </div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                  <Webhook className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{totalEvents.toLocaleString()}</div>
                  <div className="text-xs text-slate-400">Total Events</div>
                </div>
              </div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <Link className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{integrations.length}</div>
                  <div className="text-xs text-slate-400">Total</div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration, index) => {
          const Icon = getIcon(integration.type);
          return (
            <div
              key={integration.id}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:shadow-2xl hover:shadow-blue-500/10 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${getColor(index)} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                  integration.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    integration.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
                  }`}></div>
                  {integration.status}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-white mb-1">{integration.name}</h3>
              <p className="text-sm text-slate-400 mb-4">{integration.type}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Events Sent</span>
                  <span className="text-sm font-medium text-white">{integration.events.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Last Sync</span>
                  <span className="text-sm text-slate-300">{integration.lastSync}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => handleEdit(integration)}
                  className="flex-1 px-3 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-sm text-white transition-all flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(integration)}
                  className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-sm text-red-400 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Available Integrations */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Available Integrations</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { name: 'Webhook', type: 'Webhook', icon: Webhook },
            { name: 'HTTP/HTTPS', type: 'API', icon: Link },
            { name: 'MQTT', type: 'Protocol', icon: Radio },
            { name: 'AWS IoT', type: 'Cloud', icon: Cloud },
            { name: 'Azure IoT Hub', type: 'Cloud', icon: Cloud },
            { name: 'InfluxDB', type: 'Database', icon: Server },
          ].map(({ name, type, icon: Icon }) => (
            <button
              key={name}
              onClick={() => {
                setEditingIntegration(null);
                setFormData({ name: '', type, url: '', apiKey: '' });
                setShowModal(true);
              }}
              className="p-4 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg text-center transition-all group"
            >
              <div className="w-12 h-12 bg-slate-600/50 rounded-lg mx-auto mb-2 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Icon className="w-6 h-6 text-slate-400" />
              </div>
              <div className="text-sm text-white font-medium">{name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingIntegration(null);
        }}
        title={editingIntegration ? 'Edit Integration' : 'New Integration'}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-300 mb-2 block">Integration Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="AWS IoT Core"
              autoComplete="off"
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm text-slate-300 mb-2 block">Type *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Webhook">Webhook</option>
              <option value="Cloud">Cloud</option>
              <option value="API">API</option>
              <option value="Protocol">Protocol</option>
              <option value="Database">Database</option>
              <option value="Visualization">Visualization</option>
              <option value="Notification">Notification</option>
              <option value="Automation">Automation</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-300 mb-2 block">Endpoint URL *</label>
            <input
              type="text"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://api.example.com/webhook"
              autoComplete="off"
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm text-slate-300 mb-2 block">API Key / Token</label>
            <input
              type="password"
              value={formData.apiKey}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              placeholder="••••••••••••••••"
              autoComplete="new-password"
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                setShowModal(false);
                setEditingIntegration(null);
              }}
              className="flex-1 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-white transition-all"
            >
              Cancel
            </button>
            <button
              onClick={editingIntegration ? handleUpdate : handleAdd}
              disabled={!formData.name || !formData.url}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingIntegration ? 'Update Integration' : 'Create Integration'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Integration"
        message={`Are you sure you want to delete the integration "${deletingIntegration?.name}"?`}
      />
    </div>
  );
}