import React from 'react';
import { Modal } from './Modal';
import { useCompanies } from '@/lib/hooks/useCompanies';
import { AppSelect } from './ui/AppSelect';

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editData?: any;
  serverError?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function UserForm({ isOpen, onClose, onSubmit, editData, serverError }: UserFormProps) {
  const { data: companies = [] } = useCompanies();
  const [formData, setFormData] = React.useState({
    name: editData?.name || '',
    email: editData?.email || '',
    role: editData?.role || 'viewer',
    status: editData?.status || 'active',
    companyId: editData?.companyId || '',
    password: '',
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name,
        email: editData.email,
        role: editData.role,
        status: editData.status || 'active',
        companyId: editData.companyId || '',
        password: '',
      });
    } else {
      setFormData({ name: '', email: '', role: 'viewer', status: 'active', companyId: '', password: '' });
    }
    setErrors({});
  }, [editData, isOpen]);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!formData.name.trim()) next.name = 'Name is required';
    if (!formData.email.trim()) next.email = 'Email is required';
    else if (!EMAIL_RE.test(formData.email)) next.email = 'Enter a valid email address';
    if (!editData && !formData.password) next.password = 'Password is required';
    else if (formData.password && formData.password.length < 8) next.password = 'Password must be at least 8 characters';
    if (formData.role !== 'Super Admin' && !formData.companyId) next.companyId = 'Company is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const { password, status, ...rest } = formData;
    if (editData) {
      onSubmit(password ? { ...rest, status, password } : { ...rest, status });
    } else {
      onSubmit({ ...rest, password });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editData ? 'Edit User' : 'Add New User'}>
      <div className="space-y-4">
        {serverError && (
          <div className="px-4 py-2 bg-red-500/10 border border-red-500/50 rounded-lg text-sm text-red-400">
            {serverError}
          </div>
        )}

        <div>
          <label className="text-sm text-slate-300 mb-2 block">Full Name *</label>
          <input type="text" value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter Full Name"
            autoComplete="off"
            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="text-sm text-slate-300 mb-2 block">Email *</label>
          <input type="email" value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Enter Email Address"
            autoComplete="off"
            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="text-sm text-slate-300 mb-2 block">Company {formData.role !== 'Super Admin' && '*'}</label>
          <AppSelect
            value={formData.companyId}
            onValueChange={(v) => setFormData({ ...formData, companyId: v })}
            disabled={formData.role === 'Super Admin'}
            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            options={[
              { value: '', label: 'Select a company...' },
              ...companies.map((c: any) => ({ value: c._id, label: c.name })),
            ]}
          />
          {errors.companyId && <p className="text-xs text-red-400 mt-1">{errors.companyId}</p>}
        </div>

        <div>
          <label className="text-sm text-slate-300 mb-2 block">Role *</label>
          <AppSelect
            value={formData.role}
            onValueChange={(v) => setFormData({ ...formData, role: v })}
            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            options={[
              { value: 'viewer', label: 'Viewer' },
              { value: 'operator', label: 'Operator' },
              { value: 'admin', label: 'Admin' },
              { value: 'Super Admin', label: 'Super Admin' },
            ]}
          />
        </div>

        {editData && (
          <div>
            <label className="text-sm text-slate-300 mb-2 block">Status *</label>
            <AppSelect
              value={formData.status}
              onValueChange={(v) => setFormData({ ...formData, status: v })}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
            />
          </div>
        )}

        {!editData && (
          <div>
            <label className="text-sm text-slate-300 mb-2 block">Password *</label>
            <input type="password" value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter Password"
              autoComplete="new-password"
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-white transition-all">
            Cancel
          </button>
          <button onClick={handleSubmit}
            disabled={!formData.name || !formData.email || (!editData && !formData.password)}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {editData ? 'Update User' : 'Add User'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
