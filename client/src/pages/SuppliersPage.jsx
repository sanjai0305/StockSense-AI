import React, { useState, useEffect } from 'react';
import { Truck, Plus, Phone, Mail, MapPin, Edit2, Trash2, X, Clock, FileText, Search, Building2, Package } from 'lucide-react';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';

const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editSupplier, setEditSupplier] = useState(null);

  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [leadTimeDays, setLeadTimeDays] = useState('3');
  const [gstin, setGstin] = useState('');
  const [error, setError] = useState('');

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/suppliers?search=${encodeURIComponent(search)}`);
      if (res.success) setSuppliers(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [search]);

  const openModal = (sup = null) => {
    if (sup) {
      setEditSupplier(sup);
      setName(sup.name);
      setCompanyName(sup.companyName);
      setPhone(sup.phone);
      setEmail(sup.email || '');
      setAddress(sup.address || '');
      setLeadTimeDays(String(sup.leadTimeDays || 3));
      setGstin(sup.gstin || '');
    } else {
      setEditSupplier(null);
      setName('');
      setCompanyName('');
      setPhone('');
      setEmail('');
      setAddress('');
      setLeadTimeDays('3');
      setGstin('');
    }
    setError('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        name,
        companyName,
        phone,
        email,
        address,
        leadTimeDays: parseInt(leadTimeDays, 10) || 3,
        gstin,
      };

      if (editSupplier) {
        await api.put(`/suppliers/${editSupplier.id}`, payload);
      } else {
        await api.post('/suppliers', payload);
      }
      setModalOpen(false);
      fetchSuppliers();
    } catch (err) {
      setError(err.message || 'Failed to save supplier');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this supplier?')) {
      try {
        await api.delete(`/suppliers/${id}`);
        fetchSuppliers();
      } catch (err) {
        alert(err.message || 'Failed to delete supplier');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#DCEBE1] shadow-card">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#E8F8EE] text-[#00966B] flex items-center justify-center font-bold shadow-sm">
            <Truck className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#14231C]">
              Distributors & Suppliers Directory
            </h2>
            <p className="text-xs text-[#66756C] font-medium mt-0.5">
              Manage dealer contacts, purchase contracts, and procurement lead times
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#66756C] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search suppliers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#F4FAF6] border border-[#DCEBE1] pl-10 pr-4 py-2 rounded-2xl text-xs font-semibold text-[#14231C] placeholder-[#66756C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00966B] w-56 transition-all"
            />
          </div>

          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#00966B] hover:bg-[#007A56] text-white text-xs font-bold rounded-2xl shadow-emerald transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Add Supplier
          </button>
        </div>
      </div>

      {/* Supplier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-[#66756C]">
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-7 h-7 border-2 border-[#00966B] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-medium">Loading registered suppliers...</span>
            </div>
          </div>
        ) : suppliers.length === 0 ? (
          <div className="col-span-full py-16 text-center text-[#66756C] bg-white rounded-3xl border border-[#DCEBE1] p-8 shadow-card">
            <Truck className="w-12 h-12 text-[#00966B]/40 mx-auto mb-3" />
            <p className="text-base font-bold text-[#14231C]">No suppliers found</p>
            <p className="text-xs text-[#66756C] mt-1">Try refining your search or add a new vendor distributor.</p>
          </div>
        ) : (
          suppliers.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-3xl p-6 border border-[#DCEBE1] shadow-card hover:shadow-emerald transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#E8F8EE] text-[#00966B] flex items-center justify-center font-bold">
                      <Building2 className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div>
                      <h3 className="font-black text-[#14231C] text-base group-hover:text-[#00966B] transition-colors">{s.name}</h3>
                      <p className="text-xs text-[#00966B] font-bold mt-0.5">{s.companyName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#66756C]">
                    <button
                      onClick={() => openModal(s)}
                      className="p-2 hover:text-[#00966B] hover:bg-[#E8F8EE] rounded-xl transition-colors"
                      title="Edit Supplier"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="p-2 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      title="Delete Supplier"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-5 space-y-2.5 text-xs text-[#14231C]">
                  <div className="flex items-center gap-2.5 bg-[#F4FAF6] p-2.5 rounded-2xl border border-[#DCEBE1]/60">
                    <Phone className="w-4 h-4 text-[#00966B] flex-shrink-0" />
                    <span className="font-bold">{s.phone}</span>
                  </div>
                  {s.email && (
                    <div className="flex items-center gap-2.5 px-2.5 text-[#66756C]">
                      <Mail className="w-4 h-4 text-[#66756C] flex-shrink-0" />
                      <span className="truncate">{s.email}</span>
                    </div>
                  )}
                  {s.address && (
                    <div className="flex items-center gap-2.5 px-2.5 text-[#66756C]">
                      <MapPin className="w-4 h-4 text-[#66756C] flex-shrink-0" />
                      <span className="truncate">{s.address}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2.5 px-2.5 text-[#66756C]">
                    <Clock className="w-4 h-4 text-[#66756C] flex-shrink-0" />
                    <span>Lead Time: <strong className="text-[#14231C] font-bold">{s.leadTimeDays} days</strong></span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[#DCEBE1] flex items-center justify-between text-xs font-bold">
                <span className="px-3 py-1 bg-[#E8F8EE] text-[#00966B] rounded-full border border-[#CDE9D6]">
                  {s._count?.products || 0} Products
                </span>
                <span className="text-[#66756C]">
                  {s._count?.stockReceipts || 0} Consignments
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Supplier Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-[#DCEBE1] animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-[#DCEBE1] flex items-center justify-between bg-[#F4FAF6]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#E8F8EE] text-[#00966B] flex items-center justify-center font-bold">
                  <Truck className="w-4 h-4 stroke-[2.5]" />
                </div>
                <h3 className="font-black text-[#14231C] text-base">
                  {editSupplier ? 'Edit Supplier' : 'Add New Supplier / Dealer'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-[#66756C] hover:text-[#14231C] rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#14231C] mb-1">
                    Contact Person / Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Reliance Distributor"
                    className="w-full bg-white border border-[#DCEBE1] rounded-2xl px-3.5 py-2 text-xs font-semibold text-[#14231C] focus:outline-none focus:ring-2 focus:ring-[#00966B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#14231C] mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Reliance Retail Ltd"
                    className="w-full bg-white border border-[#DCEBE1] rounded-2xl px-3.5 py-2 text-xs font-semibold text-[#14231C] focus:outline-none focus:ring-2 focus:ring-[#00966B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#14231C] mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98450 12345"
                    className="w-full bg-white border border-[#DCEBE1] rounded-2xl px-3.5 py-2 text-xs font-semibold text-[#14231C] focus:outline-none focus:ring-2 focus:ring-[#00966B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#14231C] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="distributor@reliance.com"
                    className="w-full bg-white border border-[#DCEBE1] rounded-2xl px-3.5 py-2 text-xs font-semibold text-[#14231C] focus:outline-none focus:ring-2 focus:ring-[#00966B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#14231C] mb-1">
                    Lead Time (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={leadTimeDays}
                    onChange={(e) => setLeadTimeDays(e.target.value)}
                    className="w-full bg-white border border-[#DCEBE1] rounded-2xl px-3.5 py-2 text-xs font-semibold text-[#14231C] focus:outline-none focus:ring-2 focus:ring-[#00966B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#14231C] mb-1">
                    GSTIN (Optional)
                  </label>
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    placeholder="33AAAAA0000A1Z5"
                    className="w-full bg-white border border-[#DCEBE1] rounded-2xl px-3.5 py-2 text-xs font-mono font-semibold text-[#14231C] focus:outline-none focus:ring-2 focus:ring-[#00966B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#14231C] mb-1">
                  Warehouse / Office Address
                </label>
                <textarea
                  rows="2"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Salem Distribution Warehouse..."
                  className="w-full bg-white border border-[#DCEBE1] rounded-2xl px-3.5 py-2 text-xs font-semibold text-[#14231C] focus:outline-none focus:ring-2 focus:ring-[#00966B]"
                />
              </div>

              <div className="pt-3 border-t border-[#DCEBE1] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#14231C] text-xs font-bold rounded-2xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#00966B] hover:bg-[#007A56] text-white text-xs font-bold rounded-2xl shadow-emerald transition-all"
                >
                  {editSupplier ? 'Save Changes' : 'Create Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuppliersPage;
