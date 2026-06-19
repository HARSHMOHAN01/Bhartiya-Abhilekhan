import React, { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';
import { Toast } from '../components/Toast';
import { Modal } from '../components/Modal';
import { 
  ShoppingCart, 
  Search, 
  FileText, 
  Eye, 
  Calendar, 
  Truck, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft,
  Printer,
  ChevronRight,
  TrendingUp,
  Activity,
  ArrowDownRight,
  Clock,
  Compass
} from 'lucide-react';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  // Selected Order for Details View
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Toast Alerts
  const [toastMsg, setToastMsg] = useState(null);
  const [toastType, setToastType] = useState('success');

  const triggerToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/orders');
      setOrders(response.data);
    } catch (error) {
      triggerToast('Error connecting to order registry database', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredOrders = () => {
    if (statusFilter === 'All') return orders;
    return orders.filter(order => {
      // Mocking status logic since backend doesn't save state.
      // We can assign status dynamically based on order ID or other criteria for simulation.
      const status = getMockStatus(order.id);
      return status.toLowerCase() === statusFilter.toLowerCase();
    });
  };

  // Helper to generate realistic status for orders based on ID
  const getMockStatus = (id) => {
    if (id % 4 === 0) return 'Completed';
    if (id % 4 === 1) return 'Shipped';
    if (id % 4 === 2) return 'Pending';
    return 'Canceled';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Shipped':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Pending':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
    }
  };

  const handleExportCSV = () => {
    triggerToast('Order register data exported to CSV format', 'success');
  };

  return (
    <div className="space-y-6">
      {toastMsg && <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg(null)} />}

      {/* Main View: List Order History */}
      {!selectedOrder ? (
        <div className="space-y-6">
          {/* Header Panel */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Order History</h2>
              <p className="text-xs text-slate-500 font-medium">Review and manage past transactions across all channels.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleExportCSV}
                className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <FileText className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date Range:</span>
              <select className="bg-slate-950 border border-slate-800 text-xs text-slate-400 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500">
                <option>Last 30 Days</option>
                <option>Last 6 Months</option>
                <option>Year to Date</option>
              </select>
            </div>

            {/* Status filters selection bar */}
            <div className="flex gap-1 bg-slate-950 p-1 border border-slate-850 rounded-lg">
              {['All', 'Completed', 'Shipped', 'Pending', 'Canceled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3.5 py-1 text-[10px] font-bold rounded-md transition-colors ${
                    (status === 'All' && statusFilter === 'All') || statusFilter === status
                      ? 'bg-blue-600/15 text-blue-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {status === 'All' ? 'All Orders' : status}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Table */}
          <div className="glass-panel rounded-xl border border-slate-855 overflow-hidden">
            {loading && orders.length === 0 ? (
              <div className="py-20 text-center text-slate-500 font-semibold text-xs flex items-center justify-center gap-2">
                <Activity className="w-4 h-4 animate-spin text-blue-500" />
                Retrieving registry order databases...
              </div>
            ) : getFilteredOrders().length === 0 ? (
              <div className="py-20 text-center text-slate-500 font-semibold text-xs">
                No orders matching the status query filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900/50 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-6">Order ID</th>
                      <th className="py-3 px-6">Customer</th>
                      <th className="py-3 px-6">Date</th>
                      <th className="py-3 px-6 text-right">Amount</th>
                      <th className="py-3 px-6 text-center">Status</th>
                      <th className="py-3 px-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {getFilteredOrders().map((order) => {
                      const status = getMockStatus(order.id);
                      return (
                        <tr key={order.id} className="hover:bg-slate-800/10 transition-colors">
                          <td className="py-4 px-6 font-bold">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="text-blue-400 hover:text-blue-300 font-bold transition-colors font-mono"
                            >
                              #ORD-{8800 + order.id}
                            </button>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-400 text-[10px]">
                                {order.customer_name?.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <span className="block font-bold text-slate-200">{order.customer_name}</span>
                                <span className="block text-[9px] text-slate-500 font-bold">Client ID: {order.customer_id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-slate-350 font-medium">
                            {new Date(order.created_at).toLocaleDateString(undefined, {
                              month: 'short',
                              day: '2-digit',
                              year: 'numeric'
                            })}{' '}
                            {new Date(order.created_at).toLocaleTimeString(undefined, {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="py-4 px-6 text-right font-extrabold text-slate-200">
                            ${order.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] border uppercase ${getStatusBadge(status)}`}>
                              {status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="p-1.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white transition-colors border border-slate-75"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Bottom analytical metrics matching Order History screenshot */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 pt-4">
            
            {/* Metric 1 */}
            <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Revenue (30d)</span>
              <span className="text-2xl font-extrabold text-slate-200 block">${orders.reduce((sum, o) => sum + o.total_amount, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              <span className="text-emerald-400 text-xs font-semibold flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                +12.4% <span className="text-slate-500 ml-1">vs last period</span>
              </span>
            </div>

            {/* Metric 2 */}
            <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Fulfillment Rate</span>
              <span className="text-2xl font-extrabold text-slate-200 block">98.2%</span>
              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden p-0 border border-slate-850">
                <div className="bg-emerald-500 h-full rounded-full w-[98.2%]"></div>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Average Order Value</span>
              <span className="text-2xl font-extrabold text-slate-200 block">
                ${orders.length > 0 ? (orders.reduce((sum, o) => sum + o.total_amount, 0) / orders.length).toFixed(2) : '0.00'}
              </span>
              <span className="text-rose-400 text-xs font-semibold flex items-center gap-0.5">
                <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />
                -2.1% <span className="text-slate-500 ml-1 font-medium">vs last period</span>
              </span>
            </div>

            {/* Metric 4 */}
            <div className="glass-panel p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Active Shipments</span>
                <span className="text-2xl font-extrabold text-slate-200 block">1,482</span>
              </div>
              <button className="w-full bg-slate-950 hover:bg-slate-850 text-slate-350 text-[10px] font-bold py-1.5 px-3 rounded-lg border border-slate-800 transition-colors mt-2">
                Track All
              </button>
            </div>
          </div>
        </div>
      ) : (
        
        // Detailed Order View Panel matching mock ORD-8821 details screen
        <div className="space-y-6">
          
          {/* Header navigation bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-550 font-bold uppercase tracking-wider">Order Management</span>
                  <span className="text-[10px] text-slate-650">•</span>
                  <span className="text-xs font-mono font-bold text-slate-400">#ORD-{8800 + selectedOrder.id}</span>
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">Order Details</h2>
              </div>
            </div>

            {/* Actions bar details */}
            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] border uppercase ${getStatusBadge(getMockStatus(selectedOrder.id))}`}>
                {getMockStatus(selectedOrder.id)}
              </span>
              
              <button 
                onClick={() => triggerToast('Generating PDF invoice request', 'success')}
                className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Invoice
              </button>
              
              <button 
                onClick={() => triggerToast('Order state updated successfully', 'success')}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
              >
                Update Tracking
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-500 font-semibold leading-none">
            Placed on{' '}
            {new Date(selectedOrder.created_at).toLocaleDateString(undefined, {
              month: 'long',
              day: '2-digit',
              year: 'numeric'
            })}{' '}
            at{' '}
            {new Date(selectedOrder.created_at).toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>

          {/* Main info panel cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Items list & Customer info (Colspan 2) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Customer Information Card */}
              <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800/60 pb-3">
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                  <div>
                    <span className="block text-[9px] font-bold text-slate-500 uppercase mb-1">CLIENT NAME</span>
                    <span className="font-bold text-slate-200">{selectedOrder.customer_name}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-slate-500 uppercase mb-1">CONTACT EMAIL</span>
                    <span className="font-semibold text-slate-350">{selectedOrder.customer?.email || 'procurement@globallogistics.co'}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-slate-500 uppercase mb-1">SHIPPING ADDRESS</span>
                    <span className="font-semibold text-slate-350 leading-relaxed block whitespace-pre-line">
                      4522 Industrial Pkwy, Suite 400{"\n"}Chicago, IL 60609{"\n"}United States
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Items List */}
              <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800/60 pb-3">
                  Order Items ({selectedOrder.items?.length || 0} Items)
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[9px]">
                        <th className="py-2.5">Product</th>
                        <th className="py-2.5">SKU / Code</th>
                        <th className="py-2.5 text-right">Qty</th>
                        <th className="py-2.5 text-right">Price</th>
                        <th className="py-2.5 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {selectedOrder.items?.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-850/20 transition-colors">
                          <td className="py-3 font-semibold text-slate-200">{item.product_name || 'Item Name'}</td>
                          <td className="py-3 font-mono text-slate-450">{item.product?.sku || 'SKU-001'}</td>
                          <td className="py-3 text-right font-bold text-slate-300">{item.quantity}</td>
                          <td className="py-3 text-right font-semibold text-slate-350">${item.unit_price.toFixed(2)}</td>
                          <td className="py-3 text-right font-extrabold text-blue-400">
                            ${(item.unit_price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Financial Summary & Timeline Sidebar */}
            <div className="space-y-6">
              
              {/* Financial calculations */}
              <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
                <h3 className="text-xs font-bold text-slate-350 uppercase tracking-wider border-b border-slate-800/60 pb-3 flex items-center gap-1.5">
                  Financial Summary
                </h3>
                
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-slate-450 font-medium">
                    <span>Subtotal</span>
                    <span>${selectedOrder.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-slate-450 font-medium">
                    <span>Tax (8.25%)</span>
                    <span>${(selectedOrder.total_amount * 0.0825).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-slate-450 font-medium">
                    <span>Shipping Fee</span>
                    <span>$25.00</span>
                  </div>
                  <div className="h-px bg-slate-800 my-1"></div>
                  <div className="flex justify-between text-sm font-extrabold text-slate-100">
                    <span>Total Amount</span>
                    <span className="text-blue-500">${(selectedOrder.total_amount * 1.0825 + 25.00).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className="bg-blue-600/10 border border-blue-500/20 text-blue-400 p-2.5 rounded-lg text-[10px] font-bold flex items-center gap-2 mt-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  Payment Transaction Verified
                </div>
              </div>

              {/* Order Timeline flow */}
              <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
                <h3 className="text-xs font-bold text-slate-350 uppercase tracking-wider border-b border-slate-800/60 pb-3">
                  Order Timeline
                </h3>
                
                <div className="space-y-4 relative pl-4 border-l border-slate-800/80 ml-2">
                  {/* Step 1 */}
                  <div className="relative text-xs">
                    <span className="absolute -left-[21px] top-0 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-[#0b0f19]"></span>
                    <span className="block font-bold text-slate-200">Order Received</span>
                    <span className="block text-[10px] text-slate-500 font-medium">Oct 24, 2023 • 02:45 PM</span>
                  </div>

                  {/* Step 2 */}
                  <div className="relative text-xs">
                    <span className="absolute -left-[21px] top-0 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-[#0b0f19]"></span>
                    <span className="block font-bold text-slate-200">Inventory Packed</span>
                    <span className="block text-[10px] text-slate-500 font-medium">Oct 25, 2023 • 09:12 AM</span>
                  </div>

                  {/* Step 3 */}
                  <div className="relative text-xs">
                    <span className="absolute -left-[21px] top-0 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-[#0b0f19]"></span>
                    <span className="block font-bold text-slate-200">In Transit</span>
                    <span className="block text-[10px] text-slate-500 font-medium">Oct 25, 2023 • 04:30 PM</span>
                  </div>

                  {/* Step 4 */}
                  <div className="relative text-xs">
                    <span className="absolute -left-[21px] top-0 w-2.5 h-2.5 rounded-full bg-slate-850 ring-4 ring-[#0b0f19] border border-slate-800"></span>
                    <span className="block font-bold text-slate-500">Delivered</span>
                    <span className="block text-[10px] text-slate-600 font-medium">Estimated Oct 28, 2023</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
