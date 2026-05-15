import React from 'react';
import { Modal } from './Modal';

interface GatewayFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editData?: any;
}

export function GatewayForm({ isOpen, onClose, onSubmit, editData }: GatewayFormProps) {
  const [formData, setFormData] = React.useState({
    name: editData?.name || '',
    eui: editData?.eui || '',
    location: editData?.location || '',
    latitude: '',
    longitude: '',
    frequency: 'US915',
  });

  React.useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name,
        eui: editData.eui,
        location: editData.location,
        latitude: '',
        longitude: '',
        frequency: 'US915',
      });
    }
  }, [editData]);

  const handleSubmit = () => {
    onSubmit(formData);
    setFormData({ name: '', eui: '', location: '', latitude: '', longitude: '', frequency: 'US915' });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editData ? 'Edit Gateway' : 'Add New Gateway'}
      size="lg"
    >
      <div className="space-y-4">
        <div>
          <label className="text-sm text-slate-300 mb-2 block">Gateway Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Gateway-Central-01"
            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="text-sm text-slate-300 mb-2 block">Gateway EUI *</label>
          <input
            type="text"
            value={formData.eui}
            onChange={(e) => setFormData({ ...formData, eui: e.target.value })}
            placeholder="AA-BB-CC-DD-EE-FF-00-01"
            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white font-mono placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="text-sm text-slate-300 mb-2 block">Location *</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Downtown Office"
            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-300 mb-2 block">Latitude</label>
            <input
              type="text"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              placeholder="40.7128"
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm text-slate-300 mb-2 block">Longitude</label>
            <input
              type="text"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              placeholder="-74.0060"
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-slate-300 mb-2 block">Frequency Plan *</label>
          <select
            value={formData.frequency}
            onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="US915">US915</option>
            <option value="EU868">EU868</option>
            <option value="AS923">AS923</option>
            <option value="AU915">AU915</option>
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-white transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!formData.name || !formData.eui || !formData.location}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editData ? 'Update Gateway' : 'Add Gateway'}
          </button>
        </div>
      </div>
    </Modal>
  );
}