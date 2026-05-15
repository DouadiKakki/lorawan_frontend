import { useState } from 'react';
import { Building2, Plus, Edit2, Trash2, Users, Radio, Layers, Share2, Eye, Filter, Search } from 'lucide-react';
import { Modal } from './Modal';

interface Company {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  gateways: number;
  devices: number;
  users: number;
  status: 'active' | 'inactive';
  sharedGateways: string[];
  sharedDevices: string[];
  createdAt: string;
}

interface CompaniesProps {
  companies: Company[];
  setCompanies: (companies: Company[]) => void;
}

export function Companies({ companies, setCompanies }: CompaniesProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [viewingCompany, setViewingCompany] = useState<Company | null>(null);
  
  // Filter and Search state
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const handleAdd = () => {
    const newCompany: Company = {
      id: companies.length + 1,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      gateways: 0,
      devices: 0,
      users: 1,
      status: 'active',
      sharedGateways: [],
      sharedDevices: [],
      createdAt: new Date().toLocaleDateString(),
    };

    setCompanies([...companies, newCompany]);
    setShowAddModal(false);
    setFormData({ name: '', email: '', phone: '', address: '' });
  };

  const handleUpdate = () => {
    if (editingCompany) {
      setCompanies(companies.map(c => 
        c.id === editingCompany.id 
          ? { ...c, ...formData }
          : c
      ));
      setShowAddModal(false);
      setEditingCompany(null);
      setFormData({ name: '', email: '', phone: '', address: '' });
    }
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      email: company.email,
      phone: company.phone,
      address: company.address,
    });
    setShowAddModal(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this company?')) {
      setCompanies(companies.filter(c => c.id !== id));
    }
  };

  const handleViewDetails = (company: Company) => {
    setViewingCompany(company);
    setShowDetailModal(true);
  };

  // Apply filters
  const getFilteredCompanies = () => {
    let filtered = companies;

    // Apply status filter
    if (filterStatus) {
      filtered = filtered.filter(c => c.status === filterStatus);
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredCompanies = getFilteredCompanies();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Companies</h2>
          <p className="text-slate-400">Manage companies and their resource access</p>
        </div>
        <button 
          onClick={() => {
            setEditingCompany(null);
            setFormData({ name: '', email: '', phone: '', address: '' });
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Company
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{companies.length}</div>
              <div className="text-xs text-slate-400">Total Companies</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{companies.filter(c => c.status === 'active').length}</div>
              <div className="text-xs text-slate-400">Active</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{companies.reduce((acc, c) => acc + c.gateways, 0)}</div>
              <div className="text-xs text-slate-400">Total Gateways</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center">
              <Radio className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{companies.reduce((acc, c) => acc + c.devices, 0)}</div>
              <div className="text-xs text-slate-400">Total Devices</div>
            </div>
          </div>
        </div>
      </div>

      {/* Companies Table */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 border-b border-slate-700/50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {filterStatus && (
              <button
                onClick={() => setFilterStatus('')}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Clear filter
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email or address..."
                className="pl-10 pr-4 py-2 w-80 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50 border-b border-slate-700/50">
              <tr>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">Company</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">Contact</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">Status</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">Gateways</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">Devices</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">Users</th>
                <th className="text-left py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">Created</th>
                <th className="text-right py-4 px-6 text-xs text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map((company) => (
                <tr 
                  key={company.id}
                  className="border-b border-slate-700/30 hover:bg-slate-700/30 transition-colors group"
                >
                  <td className="py-4 px-6">
                    <div 
                      className="flex items-center gap-3 cursor-pointer hover:bg-slate-700/30 rounded-lg p-2 -m-2 transition-all group/company"
                      onClick={() => handleViewDetails(company)}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white group-hover/company:text-blue-400 transition-colors">{company.name}</div>
                        <div className="text-xs text-slate-400">{company.address}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-white">{company.email}</div>
                    <div className="text-xs text-slate-400">{company.phone}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                      company.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        company.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
                      }`}></div>
                      {company.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-white">{company.gateways}</span>
                      {company.sharedGateways.length > 0 && (
                        <span className="text-xs text-blue-400">+{company.sharedGateways.length} shared</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-white">{company.devices}</span>
                      {company.sharedDevices.length > 0 && (
                        <span className="text-xs text-blue-400">+{company.sharedDevices.length} shared</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-white">{company.users}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-slate-300">{company.createdAt}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(company)}
                        className="p-2 hover:bg-green-500/20 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-green-400" />
                      </button>
                      <button 
                        onClick={() => handleDelete(company.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingCompany(null);
        }}
        title={editingCompany ? 'Edit Company' : 'Add New Company'}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-300 mb-2 block">Company Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Acme Corporation"
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm text-slate-300 mb-2 block">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="contact@acme.com"
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm text-slate-300 mb-2 block">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 123-4567"
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm text-slate-300 mb-2 block">Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Main St, City, Country"
              rows={3}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                setShowAddModal(false);
                setEditingCompany(null);
              }}
              className="flex-1 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-white transition-all"
            >
              Cancel
            </button>
            <button
              onClick={editingCompany ? handleUpdate : handleAdd}
              disabled={!formData.name || !formData.email}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingCompany ? 'Update Company' : 'Add Company'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setViewingCompany(null);
        }}
        title={`Company Details: ${viewingCompany?.name}`}
        size="lg"
      >
        {viewingCompany && (
          <div className="space-y-6">
            {/* Company Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider">Email</label>
                <p className="text-white mt-1">{viewingCompany.email}</p>
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider">Phone</label>
                <p className="text-white mt-1">{viewingCompany.phone}</p>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-slate-400 uppercase tracking-wider">Address</label>
                <p className="text-white mt-1">{viewingCompany.address}</p>
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider">Status</label>
                <p className="text-white mt-1 capitalize">{viewingCompany.status}</p>
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider">Created</label>
                <p className="text-white mt-1">{viewingCompany.createdAt}</p>
              </div>
            </div>

            {/* Resources */}
            <div className="pt-4 border-t border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Resources</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Layers className="w-5 h-5 text-purple-400" />
                    <span className="text-sm text-slate-400">Gateways</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{viewingCompany.gateways}</p>
                  {viewingCompany.sharedGateways.length > 0 && (
                    <p className="text-xs text-blue-400 mt-1">+{viewingCompany.sharedGateways.length} shared</p>
                  )}
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Radio className="w-5 h-5 text-green-400" />
                    <span className="text-sm text-slate-400">Devices</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{viewingCompany.devices}</p>
                  {viewingCompany.sharedDevices.length > 0 && (
                    <p className="text-xs text-blue-400 mt-1">+{viewingCompany.sharedDevices.length} shared</p>
                  )}
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-yellow-400" />
                    <span className="text-sm text-slate-400">Users</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{viewingCompany.users}</p>
                </div>
              </div>
            </div>

            {/* Shared Resources */}
            {(viewingCompany.sharedGateways.length > 0 || viewingCompany.sharedDevices.length > 0) && (
              <div className="pt-4 border-t border-slate-700/50">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-blue-400" />
                  Shared Resources
                </h3>
                <div className="space-y-3">
                  {viewingCompany.sharedGateways.length > 0 && (
                    <div>
                      <label className="text-xs text-slate-400 uppercase tracking-wider block mb-2">Shared Gateways</label>
                      <div className="flex flex-wrap gap-2">
                        {viewingCompany.sharedGateways.map((gateway, idx) => (
                          <span key={idx} className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                            {gateway}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {viewingCompany.sharedDevices.length > 0 && (
                    <div>
                      <label className="text-xs text-slate-400 uppercase tracking-wider block mb-2">Shared Devices</label>
                      <div className="flex flex-wrap gap-2">
                        {viewingCompany.sharedDevices.map((device, idx) => (
                          <span key={idx} className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                            {device}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}