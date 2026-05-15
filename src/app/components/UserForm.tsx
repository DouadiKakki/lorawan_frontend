import React from 'react';
import { Modal } from './Modal';

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editData?: any;
}

export function UserForm({ isOpen, onClose, onSubmit, editData }: UserFormProps) {
  const [formData, setFormData] = React.useState({
    name: editData?.name || '',
    email: editData?.email || '',
    role: editData?.role || 'Viewer',
    password: '',
  });

  React.useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name,
        email: editData.email,
        role: editData.role,
        password: '',
      });
    }
  }, [editData]);

  const handleSubmit = () => {
    onSubmit(formData);
    setFormData({ name: '', email: '', role: 'Viewer', password: '' });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editData ? 'Edit User' : 'Add New User'}
    >
      <div className="space-y-4">
        <div>
          <label className="text-sm text-slate-300 mb-2 block">Full Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="John Smith"
            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="text-sm text-slate-300 mb-2 block">Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="john.smith@company.com"
            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="text-sm text-slate-300 mb-2 block">Role *</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Viewer">Viewer</option>
            <option value="Operator">Operator</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        {!editData && (
          <div>
            <label className="text-sm text-slate-300 mb-2 block">Password *</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-white transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!formData.name || !formData.email || (!editData && !formData.password)}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editData ? 'Update User' : 'Add User'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
