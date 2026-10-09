import React, { useState, useEffect } from 'react';
import { Users2, Plus, Phone, Mail, Award, X, Search, MapPin, ShoppingBag } from 'lucide-react';
import api from '../services/api';

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/customers?search=${encodeURIComponent(search)}`);
      if (res.success) setCustomers(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/customers', { name, phone, email, address });
      setModalOpen(false);
      setName('');
      setPhone('');
      setEmail('');
      setAddress('');
      fetchCustomers();
    } catch (err) {
      setError(err.message || 'Failed to save customer');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#DCEBE1] shadow-card">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#E8F8EE] text-[#00966B] flex items-center justify-center font-bold shadow-sm">
            <Users2 className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#14231C]">
              Customer & Loyalty Directory
            </h2>
            <p className="text-xs text-[#66756C] font-medium mt-0.5">
              Track frequent supermarket buyers, contact details, and reward club points
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#66756C] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#F4FAF6] border border-[#DCEBE1] pl-10 pr-4 py-2 rounded-2xl text-xs font-semibold text-[#14231C] placeholder-[#66756C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00966B] w-56 transition-all"
            />
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#00966B] hover:bg-[#007A56] text-white text-xs font-bold rounded-2xl shadow-emerald transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Add Customer
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-[#66756C]">
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-7 h-7 border-2 border-[#00966B] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-medium">Loading customers directory...</span>
            </div>
          </div>
        ) : customers.length === 0 ? (
          <div className="col-span-full py-16 text-center text-[#66756C] bg-white rounded-3xl border border-[#DCEBE1] p-8 shadow-card">
            <Users2 className="w-12 h-12 text-[#00966B]/40 mx-auto mb-3" />
            <p className="text-base font-bold text-[#14231C]">No customers found</p>
            <p className="text-xs text-[#66756C] mt-1">Add regular shoppers to accumulate reward points on checkout.</p>
          </div>
        ) : (
          customers.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-3xl p-5 border border-[#DCEBE1] shadow-card hover:shadow-emerald transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#E8F8EE] text-[#00966B] font-black text-base flex items-center justify-center border border-[#CDE9D6]">
                    {c.name ? c.name[0].toUpperCase() : 'C'}
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold shadow-sm">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    <span>{c.loyaltyPoints || 0} pts</span>
                  </div>
                </div>

                <h3 className="font-black text-[#14231C] text-base group-hover:text-[#00966B] transition-colors">{c.name}</h3>
                <div className="mt-3.5 space-y-2 text-xs text-[#14231C]">
                  <p className="flex items-center gap-2 font-bold bg-[#F4FAF6] p-2 rounded-xl border border-[#DCEBE1]/60">
                    <Phone className="w-3.5 h-3.5 text-[#00966B]" />
                    {c.phone}
                  </p>
                  {c.email && (
                    <p className="flex items-center gap-2 text-[#66756C] truncate px-1">
                      <Mail className="w-3.5 h-3.5 text-[#66756C]" />
                      {c.email}
                    </p>
                  )}
                  {c.address && (
                    <p className="flex items-center gap-2 text-[#66756C] truncate px-1">
                      <MapPin className="w-3.5 h-3.5 text-[#66756C]" />
                      {c.address}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3.5 border-t border-[#DCEBE1] text-xs text-[#66756C] font-semibold flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[#14231C] font-bold">
                  <ShoppingBag className="w-3.5 h-3.5 text-[#00966B]" />
                  {c._count?.stockIssues || 0} purchases
                </span>
                <span className="text-[11px] text-[#00966B] font-bold">Verified Member</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-[#DCEBE1] animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-[#DCEBE1] flex items-center justify-between bg-[#F4FAF6]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E8F8EE] text-[#00966B] flex items-center justify-center font-bold">
                  <Users2 className="w-4 h-4 stroke-[2.5]" />
                </div>
                <h3 className="font-black text-[#14231C] text-base">Add New Customer</h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-[#66756C] hover:text-[#14231C] font-bold p-1">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-[#14231C] mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-[#DCEBE1] rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-[#14231C] focus:outline-none focus:ring-2 focus:ring-[#00966B]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#14231C] mb-1">Phone Number (+91) *</label>
                <input
                  type="text"
                  required
                  placeholder="+91 98450 12345"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white border border-[#DCEBE1] rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-[#14231C] focus:outline-none focus:ring-2 focus:ring-[#00966B]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#14231C] mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="ramesh@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-[#DCEBE1] rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-[#14231C] focus:outline-none focus:ring-2 focus:ring-[#00966B]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#14231C] mb-1">Delivery Address</label>
                <input
                  type="text"
                  placeholder="Door No, Street Name, Area..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-white border border-[#DCEBE1] rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-[#14231C] focus:outline-none focus:ring-2 focus:ring-[#00966B]"
                />
              </div>
              <div className="pt-3 border-t border-[#DCEBE1] flex justify-end gap-2.5">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-2xl text-xs font-bold text-[#14231C]">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-[#00966B] hover:bg-[#007A56] text-white rounded-2xl text-xs font-bold shadow-emerald transition-all">Save Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;
