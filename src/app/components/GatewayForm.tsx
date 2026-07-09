import React from 'react';
import { Modal } from './Modal';
import { useCompanies } from '@/lib/hooks/useCompanies';

interface GatewayFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editData?: any;
}

export function GatewayForm({ isOpen, onClose, onSubmit, editData }: GatewayFormProps) {
  const { data: companies = [] } = useCompanies();
  const [formData, setFormData] = React.useState({
    name: editData?.name || '',
    eui: editData?.eui || '',
    location: editData?.location || '',
    frequency: 'EU868',
    company: '',
    brand: '' as '' | 'Kerlink' | 'Tektelic' | 'Milesight' | 'Other',
    locationType: 'manual' as 'inherited' | 'manual',
    latitude: '',
    longitude: '',
  });

  React.useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name,
        eui: editData.eui,
        location: editData.location,
        frequency: 'EU868',
        company: (editData as any).companyId?.name ?? editData.company ?? '',
        brand: (editData as any).brand ?? '',
        locationType: (editData as any).locationType === 'inherited' ? 'inherited' : 'manual',
        latitude: (editData as any).latitude?.toString() ?? '',
        longitude: (editData as any).longitude?.toString() ?? '',
      });
    } else {
      setFormData({ name: '', eui: '', location: '', frequency: 'EU868', company: '', brand: '', locationType: 'manual', latitude: '', longitude: '' });
    }
  }, [editData]);

  const handleSubmit = () => {
    onSubmit(formData);
    setFormData({ name: '', eui: '', location: '', frequency: 'EU868', company: '', brand: '', locationType: 'manual', latitude: '', longitude: '' });
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
            placeholder="AABBCCDDEEFF0001"
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

        <div>
          <label className="text-sm text-slate-300 mb-2 block">Brand</label>
          <select
            value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value as typeof formData.brand })}
            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select brand</option>
            <option value="Kerlink">Kerlink</option>
            <option value="Tektelic">Tektelic</option>
            <option value="Milesight">Milesight</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-slate-300 mb-2 block">Company</label>
          <select
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select company</option>
            {(companies as any[]).map((c: any) => (
              <option key={c._id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm text-slate-300 mb-2 block">Location</label>
          <div className="flex rounded-lg overflow-hidden border border-slate-600 mb-3">
            {(['inherited', 'manual'] as const).map((type) => (
              <button key={type} type="button"
                onClick={() => setFormData({ ...formData, locationType: type })}
                className={`flex-1 py-2 text-sm font-medium transition-all capitalize ${formData.locationType === type ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'bg-slate-700/50 text-slate-400 hover:text-white'}`}>
                {type}
              </button>
            ))}
          </div>
          {formData.locationType === 'inherited' ? (
            <p className="text-xs text-slate-400 px-1">
              {formData.latitude && formData.longitude
                ? `Last reported: ${formData.latitude}, ${formData.longitude}`
                : 'No GPS data reported yet — this gateway has not sent location data.'}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Latitude</label>
                <input type="number" step="any" value={formData.latitude} onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  placeholder="40.7128"
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Longitude</label>
                <input type="number" step="any" value={formData.longitude} onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  placeholder="-74.0060"
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          )}
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