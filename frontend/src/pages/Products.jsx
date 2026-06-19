import React, { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';
import { Toast } from '../components/Toast';
import { Modal } from '../components/Modal';
import { 
  Package, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  TrendingUp, 
  AlertTriangle,
  ArrowRight,
  Loader2
} from 'lucide-react';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Selected product state
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');

  // Submission Loader
  const [submitting, setSubmitting] = useState(false);

  // Toast Alerts
  const [toastMsg, setToastMsg] = useState(null);
  const [toastType, setToastType] = useState('success');

  const triggerToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
  };

  useEffect(() => {
    fetchProducts();
  }, [search, statusFilter]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/products', {
        params: {
          search: search || undefined,
          status_filter: statusFilter || undefined
        }
      });
      setProducts(response.data);
    } catch (error) {
      triggerToast('Failed to retrieve inventory node metrics', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Add Product Submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/products', {
        name,
        sku,
        price: parseFloat(price),
        quantity: parseInt(quantity)
      });
      triggerToast('Product cataloged successfully', 'success');
      setIsAddOpen(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      triggerToast(error.response?.data?.detail || 'Error creating product registry', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEdit = (product) => {
    setSelectedProduct(product);
    setName(product.name);
    setSku(product.sku);
    setPrice(product.price.toString());
    setQuantity(product.quantity.toString());
    setIsEditOpen(true);
  };

  // Edit Product Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/products/${selectedProduct.id}`, {
        name,
        sku,
        price: parseFloat(price),
        quantity: parseInt(quantity)
      });
      triggerToast('Product records modified successfully', 'success');
      setIsEditOpen(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      triggerToast(error.response?.data?.detail || 'Error editing product records', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Delete Confirmation
  const openDelete = (product) => {
    setSelectedProduct(product);
    setIsDeleteOpen(true);
  };

  // Execute Delete
  const handleDeleteConfirm = async () => {
    setSubmitting(true);
    try {
      await api.delete(`/products/${selectedProduct.id}`);
      triggerToast('Product removed from database catalog', 'success');
      setIsDeleteOpen(false);
      fetchProducts();
    } catch (error) {
      triggerToast('Error removing product node from repository', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setSku('');
    setPrice('');
    setQuantity('');
    setSelectedProduct(null);
  };

  return (
    <div className="space-y-6">
      {toastMsg && <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg(null)} />}

      {/* Header and Add Action */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Inventory Management</h2>
          <p className="text-xs text-slate-500 font-medium">Efficiently track, edit, and organize your enterprise product catalog.</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsAddOpen(true); }}
          className="bg-blue-600 hover:bg-blue-750 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/10"
        >
          <Plus className="w-4 h-4" />
          Add New Product
        </button>
      </div>

      {/* Filters Panel */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Filter by product name, SKU, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-350 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Filters Group */}
        <div className="flex gap-4 w-full md:w-auto items-center justify-end">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category:</span>
            <select className="bg-slate-950 border border-slate-800 text-xs text-slate-400 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500">
              <option>All Categories</option>
              <option>Electronics</option>
              <option>Fluid Controls</option>
              <option>Energy Storage</option>
              <option>Hardware Sensors</option>
            </select>
          </div>

          <div className="flex gap-1 bg-slate-950 p-1 border border-slate-850 rounded-lg">
            <button
              onClick={() => setStatusFilter('')}
              className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors ${
                statusFilter === '' ? 'bg-blue-600/15 text-blue-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('InStock')}
              className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors ${
                statusFilter === 'InStock' ? 'bg-blue-600/15 text-blue-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              In Stock
            </button>
            <button
              onClick={() => setStatusFilter('LowStock')}
              className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors ${
                statusFilter === 'LowStock' ? 'bg-blue-600/15 text-blue-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Low Stock
            </button>
          </div>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="glass-panel rounded-xl border border-slate-850 overflow-hidden">
        {loading && products.length === 0 ? (
          <div className="py-20 text-center text-slate-500 font-semibold text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            Loading catalog database tables...
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center text-slate-500 font-semibold text-xs">
            No products found matching the filter query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/50 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-6">Product Name</th>
                  <th className="py-3 px-6">SKU / Code</th>
                  <th className="py-3 px-6 text-right">Price</th>
                  <th className="py-3 px-6 text-right">Inventory</th>
                  <th className="py-3 px-6 text-center">Status</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {products.map((product) => {
                  let statusText = 'In Stock';
                  let statusStyle = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                  
                  if (product.quantity === 0) {
                    statusText = 'Out of Stock';
                    statusStyle = 'bg-rose-500/10 text-rose-500 border-rose-500/20';
                  } else if (product.quantity < 10) {
                    statusText = 'Low Stock';
                    statusStyle = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                  }

                  return (
                    <tr key={product.id} className="hover:bg-slate-800/10 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-200">{product.name}</td>
                      <td className="py-4 px-6 font-mono text-slate-400">{product.sku}</td>
                      <td className="py-4 px-6 text-right font-bold text-slate-200">
                        ${product.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-6 text-right font-semibold text-slate-200">
                        <div className="space-y-1">
                          <span>{product.quantity} Units</span>
                          {/* Mini visual indicator bar */}
                          <div className="w-20 bg-slate-950 h-1 rounded-full overflow-hidden p-0 ml-auto border border-slate-850">
                            <div 
                              className={`h-full rounded-full ${
                                product.quantity === 0 ? 'bg-rose-500' : product.quantity < 10 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`} 
                              style={{ width: `${Math.min((product.quantity / 50) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] border uppercase ${statusStyle}`}>
                          {statusText}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => openEdit(product)}
                            className="p-1.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white transition-colors border border-slate-750"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openDelete(product)}
                            className="p-1.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-colors border border-rose-500/20"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Grid: Charts matching Product Page Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Inventory Trends Bar Chart */}
        <div className="md:col-span-2 glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Inventory Trends</h3>
          <p className="text-[11px] text-slate-500 font-medium">Stock levels have increased by 14% this quarter due to seasonal replenishment.</p>
          
          {/* SVG representation of bar graph */}
          <div className="h-28 flex items-end justify-between px-6 pt-4">
            {[45, 30, 58, 24, 75, 90, 65, 80].map((val, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 flex-1 max-w-[40px]">
                <div 
                  className={`w-8 rounded-t bg-gradient-to-t transition-all duration-300 ${
                    i === 5 ? 'from-blue-600 to-indigo-500' : 'from-blue-600/40 to-blue-500/30'
                  }`}
                  style={{ height: `${val}px` }}
                ></div>
                <span className="text-[9px] font-bold text-slate-500">Q{i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stock Alerts CTA Card */}
        <div className="bg-blue-600 p-6 rounded-xl text-white flex flex-col justify-between shadow-xl shadow-blue-600/10">
          <div className="space-y-3">
            <div className="bg-white/10 p-2.5 rounded-lg w-max border border-white/15">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-md font-extrabold tracking-tight">Stock Alerts</h3>
            <p className="text-xs text-blue-200 leading-relaxed font-semibold">
              There are {products.filter(p => p.quantity < 10).length} products currently below safety threshold levels.
            </p>
          </div>
          <button 
            onClick={() => setStatusFilter('LowStock')}
            className="w-full bg-white hover:bg-slate-50 text-blue-600 text-xs font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 transition-colors mt-6"
          >
            Review Alerts
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* --- ADD PRODUCT MODAL --- */}
      <Modal isOpen={isAddOpen} title="Catalog New Product" onClose={() => setIsAddOpen(false)}>
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Product Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Laser Sensor X"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">SKU / Code</label>
              <input
                type="text"
                required
                placeholder="e.g. SN-LAS-01"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Unit Price ($)</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="e.g. 29.99"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Initial Quantity</label>
            <input
              type="number"
              required
              placeholder="e.g. 100"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="input-field"
            />
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
              Create Product Registry
            </button>
          </div>
        </form>
      </Modal>

      {/* --- EDIT PRODUCT MODAL --- */}
      <Modal isOpen={isEditOpen} title="Edit Product Node" onClose={() => setIsEditOpen(false)}>
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Product Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">SKU / Code</label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Unit Price ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Available Stock</label>
            <input
              type="number"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="input-field"
            />
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
              Save Modifications
            </button>
          </div>
        </form>
      </Modal>

      {/* --- DELETE CONFIRM MODAL --- */}
      <Modal isOpen={isDeleteOpen} title="Dangerous Node Depletion" onClose={() => setIsDeleteOpen(false)}>
        <div className="space-y-4">
          <div className="flex gap-3 text-rose-500 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20 text-xs">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p className="font-semibold leading-relaxed">
              Caution: Deleting this product record will purge all associated history and items. This operation is permanent and irreversible.
            </p>
          </div>
          
          <p className="text-xs text-slate-400">
            Are you sure you want to delete the product registry for: <strong className="text-slate-200">'{selectedProduct?.name}'</strong> (SKU: {selectedProduct?.sku})?
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
              Confirm Deletion
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
