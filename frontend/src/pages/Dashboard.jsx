import React, { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';
import { Toast } from '../components/Toast';
import { 
  Package, 
  Users, 
  ShoppingCart, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Activity,
  Clock,
  Layers,
  Database
} from 'lucide-react';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCustomers: 0,
    totalOrders: 0,
    lowStockCount: 0,
    totalSales: 0
  });
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  // Toast State
  const [toastMsg, setToastMsg] = useState(null);
  const [toastType, setToastType] = useState('success');

  const triggerToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [productsRes, customersRes, ordersRes] = await Promise.all([
        api.get('/products'),
        api.get('/customers'),
        api.get('/orders')
      ]);

      const products = productsRes.data;
      const customers = customersRes.data;
      const ordersData = ordersRes.data;

      const lowStock = products.filter(p => p.quantity < 10);
      const sales = ordersData.reduce((sum, o) => sum + o.total_amount, 0);

      setStats({
        totalProducts: products.length,
        totalCustomers: customers.length,
        totalOrders: ordersData.length,
        lowStockCount: lowStock.length,
        totalSales: sales
      });

      setLowStockProducts(lowStock);
      setOrders(ordersData.slice(0, 5)); // show top 5 recent orders
    } catch (error) {
      triggerToast('Error loading system analytical indicators', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 font-semibold text-sm">
        <Activity className="w-5 h-5 animate-spin mr-2 text-blue-500" />
        Processing administrative workspace nodes...
      </div>
    );
  }

  // Visual widgets matching screenshots
  const systemLogs = [
    { timestamp: '2026-06-19 22:04:01', node: 'London-Central-01', event: 'Inventory-Reconciliation-Batch', status: 'Verified', severity: 'INFORMATIONAL', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { timestamp: '2026-06-19 21:55:12', node: 'Berlin-Secondary-04', event: 'Stock-Level-Anomaly', status: 'Correction Required', severity: 'CRITICAL', badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
    { timestamp: '2026-06-19 21:38:55', node: 'Singapore-Global-09', event: 'API-Gateway-Auth-Handshake', status: 'Pending Response', severity: 'DEBUG', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20' }
  ];

  return (
    <div className="space-y-6">
      {toastMsg && <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg(null)} />}

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        
        {/* Metric 1 */}
        <div className="glass-panel p-6 rounded-xl border border-slate-800 flex items-start justify-between glow-blue">
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Products</span>
            <span className="text-3xl font-extrabold text-white block">{stats.totalProducts}</span>
            <span className="text-emerald-400 text-xs font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              +12.4% <span className="text-slate-500">vs last month</span>
            </span>
          </div>
          <div className="bg-blue-600/10 p-3 rounded-lg border border-blue-500/20 text-blue-500">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel p-6 rounded-xl border border-slate-800 flex items-start justify-between glow-blue">
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Customers</span>
            <span className="text-3xl font-extrabold text-white block">{stats.totalCustomers}</span>
            <span className="text-emerald-400 text-xs font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              +4% <span className="text-slate-500">vs last month</span>
            </span>
          </div>
          <div className="bg-indigo-600/10 p-3 rounded-lg border border-indigo-500/20 text-indigo-500">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel p-6 rounded-xl border border-slate-800 flex items-start justify-between glow-blue">
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Orders</span>
            <span className="text-3xl font-extrabold text-white block">{stats.totalOrders}</span>
            <span className="text-emerald-400 text-xs font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              +8.2% <span className="text-slate-500">vs last week</span>
            </span>
          </div>
          <div className="bg-emerald-600/10 p-3 rounded-lg border border-emerald-500/20 text-emerald-500">
            <ShoppingCart className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-panel p-6 rounded-xl border border-slate-800 flex items-start justify-between glow-blue">
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Low Stock Alerts</span>
            <span className="text-3xl font-extrabold text-rose-500 block">{stats.lowStockCount}</span>
            {stats.lowStockCount > 0 ? (
              <span className="text-rose-400 text-xs font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Action Required
              </span>
            ) : (
              <span className="text-emerald-400 text-xs font-bold">All stock healthy</span>
            )}
          </div>
          <div className={`p-3 rounded-lg border text-rose-500 ${stats.lowStockCount > 0 ? 'bg-rose-600/10 border-rose-500/20 animate-pulse' : 'bg-slate-800/60 border-slate-800'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grid: Charts & System Status Visuals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Inventory Turnover Velocity Graph Card */}
        <div className="md:col-span-2 glass-panel p-6 rounded-xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Inventory Turnover Velocity</h3>
            </div>
            <div className="flex gap-2">
              <span className="text-[10px] bg-blue-600/15 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-bold">Live Feed</span>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-bold">Last 30 Days</span>
            </div>
          </div>

          {/* SVG Line Chart simulation */}
          <div className="relative h-44 flex items-end">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 100">
              <defs>
                <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="20" x2="500" y2="20" stroke="#1e293b" strokeWidth="0.5" />
              <line x1="0" y1="50" x2="500" y2="50" stroke="#1e293b" strokeWidth="0.5" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="#1e293b" strokeWidth="0.5" />
              
              {/* Fill area */}
              <path d="M 0 80 Q 80 50 160 30 T 320 20 T 480 30 L 500 35 L 500 100 L 0 100 Z" fill="url(#chart-glow)" />
              {/* Main Line */}
              <path d="M 0 80 Q 80 50 160 30 T 320 20 T 480 30 L 500 35" fill="none" stroke="#2563eb" strokeWidth="2.5" />
              
              {/* Dotted threshold line */}
              <path d="M 0 60 Q 100 70 200 65 T 400 55 L 500 60" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 4" />
            </svg>
            
            {/* Overlay tooltips */}
            <div className="absolute top-8 left-[38%] bg-slate-900 border border-slate-700 text-[10px] px-2 py-1 rounded shadow-xl font-bold">
              May 14: +12.4% <br/>
              <span className="text-slate-500 font-medium">Warehouse A Velocity</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 border-t border-slate-800/60 pt-4 text-center">
            <div>
              <span className="block text-[10px] text-slate-500 uppercase font-bold">Throughput</span>
              <span className="text-sm font-extrabold text-slate-200">14.2k <span className="text-emerald-400 text-xs font-bold font-sans">↑ 4%</span></span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-500 uppercase font-bold">Lead Time</span>
              <span className="text-sm font-extrabold text-slate-200">2.4 days <span className="text-rose-400 text-xs font-bold font-sans">↓ 0.2</span></span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-500 uppercase font-bold">Stock Accuracy</span>
              <span className="text-sm font-extrabold text-slate-200">99.8%</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-500 uppercase font-bold">Nodes Active</span>
              <span className="text-sm font-extrabold text-slate-200">42/42</span>
            </div>
          </div>
        </div>

        {/* Warehouse Capacity visual map */}
        <div className="glass-panel p-6 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Warehouse Capacity</h3>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>

          {/* Graphical grid representing capacity blocks */}
          <div className="grid grid-cols-10 gap-1 my-4">
            {Array.from({ length: 50 }).map((_, i) => {
              // Randomly color some dark and light blues to simulate storage density
              let color = 'bg-blue-600/20 border border-blue-500/10';
              if (i === 12 || i === 24 || i === 31 || i === 40) color = 'bg-rose-600/80 border border-rose-500/30';
              else if (i % 3 === 0) color = 'bg-blue-600/90 border border-blue-500/30';
              else if (i % 2 === 0) color = 'bg-blue-600/50 border border-blue-500/20';
              
              return (
                <div 
                  key={i} 
                  className={`h-4 rounded-sm transition-all hover:scale-110 duration-100 ${color}`}
                  title={`Sub-Grid Row ${Math.floor(i/10)} Block ${i%10}`}
                ></div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 border-b border-slate-800/40 pb-3">
            <span>Optimal</span>
            <span>Critical Capacity</span>
          </div>

          {/* Alarm warning */}
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 mt-1">
            <AlertTriangle className="w-4 h-4 text-rose-500 animate-bounce" />
            Cluster D-12 Approaching Limit
          </div>
        </div>
      </div>

      {/* Grid: Low Stock alerts & Event logs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Table of items requiring restock */}
        <div className="md:col-span-2 glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Items Requiring Restock</h3>
            <span className="text-[10px] text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded font-bold">Action Required</span>
          </div>

          {lowStockProducts.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No inventory anomalies. Stock is fully optimized.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5">Product Name</th>
                    <th className="py-2.5">SKU</th>
                    <th className="py-2.5 text-right">Current Stock</th>
                    <th className="py-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {lowStockProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="py-3 font-semibold text-slate-200">{p.name}</td>
                      <td className="py-3 font-mono text-slate-400">{p.sku}</td>
                      <td className="py-3 text-right font-bold text-slate-200">{p.quantity} Units</td>
                      <td className="py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] border ${
                          p.quantity === 0
                            ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        }`}>
                          {p.quantity === 0 ? 'CRITICAL OUT' : 'LOW STOCK'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Real-time System Event Logs */}
        <div className="glass-panel p-6 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3 mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-500" />
                System Event Logs
              </h3>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-4">
              {systemLogs.map((log, i) => (
                <div key={i} className="border border-slate-800/80 bg-slate-950/40 rounded-lg p-3 space-y-1.5 hover:border-slate-700/60 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-slate-500 font-bold">{log.timestamp}</span>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${log.badge}`}>
                      {log.severity}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">{log.event}</span>
                    <span className="text-[10px] text-slate-400">{log.node}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">Status: {log.status}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 border-t border-slate-800/40 pt-4 flex justify-between items-center">
            <span className="text-[9px] text-slate-550 font-bold">Cloud Core Connection</span>
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              99.98% Uptime
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
