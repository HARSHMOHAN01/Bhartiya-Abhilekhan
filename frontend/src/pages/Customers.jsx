import React, { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';
import { Toast } from '../components/Toast';
import { Modal } from '../components/Modal';
import { 
  Users, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Mail, 
  Phone,
  Shield,
  AlertTriangle,
  Loader2,
  TrendingUp,
  Briefcase,
  DollarSign,
  Percent
} from 'lucide-react';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Selected customer state
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('staff');

  // Loader state
  const [submitting, setSubmitting] = useState(false);

  // Toast Alerts
  const [toastMsg, setToastMsg] = useState(null);
  const [toastType, setToastType] = useState('success');

  const triggerToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/customers', {
        params: {
          search: search || undefined
        }
      });
      setCustomers(response.data);
    } catch (error) {
      triggerToast('Failed to retrieve customer profiles', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Add Customer Submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/customers', {
        full_name: fullName,
        email,
        phone_number: phoneNumber || null,
        role
      });
      triggerToast('Customer profile registered successfully', 'success');
      setIsAddOpen(false);
      resetForm();
      fetchCustomers();
    } catch (error) {
      triggerToast(error.response?.data?.detail || 'Error creating customer record', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEdit = (customer) => {
    setSelectedCustomer(customer);
    setFullName(customer.full_name);
    setEmail(customer.email);
    setPhoneNumber(customer.phone_number || '');
    setRole(customer.role);
    setIsEditOpen(true);
  };

  // Edit Customer Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/customers/${selectedCustomer.id}`, {
        full_name: fullName,
        email,
        phone_number: phoneNumber || null,
        role
      });
      triggerToast('Customer profile updated successfully', 'success');
      setIsEditOpen(false);
      resetForm();
      fetchCustomers();
    } catch (error) {
      triggerToast(error.response?.data?.detail || 'Error updating customer profile', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Delete Confirmation
  const openDelete = (customer) => {
    setSelectedCustomer(customer);
    setIsDeleteOpen(true);
  };

  // Execute Delete
  const handleDeleteConfirm = async () => {
    setSubmitting(true);
    try {
      await api.delete(`/customers/${selectedCustomer.id}`);
      triggerToast('Customer profile removed from system directory', 'success');
      setIsDeleteOpen(false);
      fetchCustomers();
    } catch (error) {
      triggerToast('Error deleting customer node', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setPhoneNumber('');
    setRole('staff');
    setSelectedCustomer(null);
  };

  return (
    <div className="space-y-6">
      {toastMsg && <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg(null)} />}

      {/* Header Panel */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Customer Directory</h2>
          <p className="text-xs text-slate-500 font-medium">Manage your client base and communication preferences.</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsAddOpen(true); }}
          className="bg-blue-600 hover:bg-blue-755 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/10"
        >
          <Plus className="w-4 h-4" />
          Add New Customer
        </button>
      </div>

      {/* Summary KPI Cards matching Customer Directory screenshot */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Total Customers</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-100">{customers.length}</span>
            <span className="text-emerald-400 text-xs font-bold">+12%</span>
          </div>
        </div>
        <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Active Contracts</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-100">{Math.floor(customers.length * 0.8)}</span>
            <span className="text-emerald-400 text-xs font-bold">+5%</span>
          </div>
        </div>
        <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Monthly Revenue</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-100">$1.2M</span>
            <span className="text-emerald-400 text-xs font-bold">+8.2%</span>
          </div>
        </div>
        <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Avg. Retention</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-100">94.8%</span>
            <span className="text-rose-500 text-xs font-bold">-0.4%</span>
          </div>
        </div>
      </div>

      {/* Filter / Search Tool */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search customers by name, email, or registry ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-350 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Customers List Table */}
      <div className="glass-panel rounded-xl border border-slate-850 overflow-hidden">
        {loading && customers.length === 0 ? (
          <div className="py-20 text-center text-slate-500 font-semibold text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            Connecting to customer directory services...
          </div>
        ) : customers.length === 0 ? (
          <div className="py-20 text-center text-slate-500 font-semibold text-xs">
            No customer directory profiles registered in database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/50 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-6">Customer</th>
                  <th className="py-3 px-6">Contact Info</th>
                  <th className="py-3 px-6">Administrative Level</th>
                  <th className="py-3 px-6 text-center">TOTP Status</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/10 transition-colors">
                    {/* Customer Info Name/Initials */}
                    <td className="py-4 px-6 font-bold text-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600/15 border border-blue-500/25 flex items-center justify-center text-blue-400 font-extrabold text-xs">
                          {c.full_name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="block font-bold text-slate-200">{c.full_name}</span>
                          <span className="block text-[9px] text-slate-500 font-bold font-mono">REG-ID: {c.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="py-4 px-6 text-slate-300">
                      <div className="space-y-1">
                        <span className="flex items-center gap-1.5 text-xs text-slate-350">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          {c.email}
                        </span>
                        {c.phone_number && (
                          <span className="flex items-center gap-1.5 text-xs text-slate-450">
                            <Phone className="w-3.5 h-3.5 text-slate-600" />
                            {c.phone_number}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold border ${
                        c.role === 'admin' 
                          ? 'bg-blue-600/10 text-blue-400 border-blue-500/20' 
                          : 'bg-slate-800 text-slate-400 border-slate-700/60'
                      }`}>
                        <Shield className="w-3 h-3" />
                        {c.role === 'admin' ? 'Administrator' : 'Staff Operator'}
                      </span>
                    </td>

                    {/* Authenticator State */}
                    <td className="py-4 px-6 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] border uppercase ${
                        c.is_totp_enabled
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-slate-800 text-slate-500 border-slate-700/60'
                      }`}>
                        {c.is_totp_enabled ? 'TOTP Activated' : 'Pending Activation'}
                      </span>
                    </td>

                    {/* CRUD Actions */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => openEdit(c)}
                          className="p-1.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white transition-colors border border-slate-750"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openDelete(c)}
                          className="p-1.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-colors border border-rose-500/20"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- ADD CUSTOMER MODAL --- */}
      <Modal isOpen={isAddOpen} title="Register Customer Account" onClose={() => setIsAddOpen(false)}>
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Full Name / Organization</label>
            <input
              type="text"
              required
              placeholder="e.g. Acme Solutions"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Email Address</label>
            <input
              type="email"
              required
              placeholder="e.g. procurement@acme.corp"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Phone Number (Optional)</label>
            <input
              type="text"
              placeholder="e.g. +1 (555) 789-0100"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">System Privilege Level</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="staff">Staff Operator (Inventory Workspace / Order Placement)</option>
              <option value="admin">System Admin (Full CRUD access)</option>
            </select>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors border border-transparent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-md flex items-center gap-1.5"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Create Profile Record
            </button>
          </div>
        </form>
      </Modal>

      {/* --- EDIT CUSTOMER MODAL --- */}
      <Modal isOpen={isEditOpen} title="Modify Customer Profile" onClose={() => setIsEditOpen(false)}>
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Full Name / Organization</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Phone Number (Optional)</label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">System Privilege Level</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="staff">Staff Operator</option>
              <option value="admin">System Admin</option>
            </select>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors border border-transparent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-md flex items-center gap-1.5"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Save Profile Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* --- DELETE CONFIRM MODAL --- */}
      <Modal isOpen={isDeleteOpen} title="Purge Customer Account" onClose={() => setIsDeleteOpen(false)}>
        <div className="space-y-4">
          <div className="flex gap-3 text-rose-500 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20 text-xs">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p className="font-semibold leading-relaxed">
              Caution: Purging this profile will delete their order logs and active contracts. This is an administrative overwrite action.
            </p>
          </div>
          
          <p className="text-xs text-slate-400">
            Are you sure you want to delete the directory records for: <strong className="text-slate-200">'{selectedCustomer?.full_name}'</strong> ({selectedCustomer?.email})?
          </p>

          <div className="flex gap-3 justify-end pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsDeleteOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors border border-transparent"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={submitting}
              className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-rose-650/10"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Confirm Purge
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
