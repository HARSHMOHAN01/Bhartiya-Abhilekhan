import React, { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';
import { Toast } from '../components/Toast';
import { 
  Eye, 
  Search, 
  Layers, 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  Smartphone,
  Wifi,
  Printer,
  ChevronRight,
  PackageCheck,
  Plus
} from 'lucide-react';

export default function StaffInventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Toast Alerts
  const [toastMsg, setToastMsg] = useState(null);
  const [toastType, setToastType] = useState('success');

  const triggerToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
  };

  // Device Statuses State
  const [scannerBattery, setScannerBattery] = useState(84);
  const [scannerCharging, setScannerCharging] = useState(false);
  const [wifiPing, setWifiPing] = useState(12);
  const [wifiStatus, setWifiStatus] = useState('Stable');
  const [printerRibbon, setPrinterRibbon] = useState(15);

  // Shipments State
  const [shipments, setShipments] = useState([
    { id: 'SH-9011', carrier: 'FedEx Express', time: '14:00 - 16:00', status: 'Assigned', items: '12 Items', zone: 'Zone A', progress: 1 },
    { id: 'SH-9012', carrier: 'DHL Global', time: '15:30 - 17:30', status: 'In Transit', items: '45 Items', zone: 'Zone C', progress: 2 },
    { id: 'SH-9013', carrier: 'BlueDart Express', time: '17:00 - 19:00', status: 'Arrived', items: '8 Items', zone: 'Zone B', progress: 3 },
  ]);

  // Handle Shipment Progress Transition
  const advanceShipment = (id) => {
    setShipments(prev => prev.map(s => {
      if (s.id === id) {
        let nextProgress = s.progress + 1;
        let nextStatus = 'Assigned';
        let toastMsgText = '';

        if (nextProgress === 2) {
          nextStatus = 'In Transit';
          toastMsgText = `Shipment ${id} dispatched via ${s.carrier}!`;
        } else if (nextProgress === 3) {
          nextStatus = 'Arrived';
          toastMsgText = `Shipment ${id} arrived at destination ${s.zone}.`;
        } else if (nextProgress === 4) {
          nextStatus = 'Completed';
          toastMsgText = `Shipment ${id} check-in and unload completed.`;
        }

        if (toastMsgText) {
          triggerToast(toastMsgText, 'success');
        }

        return { ...s, progress: nextProgress, status: nextStatus };
      }
      return s;
    }));
  };

  // Simulating live telemetry updates
  useEffect(() => {
    const timer = setInterval(() => {
      // 1. Scanner Battery
      setScannerBattery(prev => {
        if (scannerCharging) {
          return Math.min(100, prev + 2);
        } else {
          const change = Math.random() > 0.6 ? -1 : 0;
          const newVal = Math.max(1, prev + change);
          if (newVal < 20 && prev >= 20) {
            triggerToast('Handheld Scanner battery critically low!', 'warning');
          }
          return newVal;
        }
      });

      // 2. Wifi Ping telemetry
      setWifiPing(prev => {
        const drift = Math.floor((Math.random() - 0.5) * 6);
        return Math.max(4, Math.min(120, prev + drift));
      });

      // 3. Wifi intermittent drop simulation (1.5% chance)
      if (Math.random() < 0.015) {
        setWifiStatus('Offline');
        triggerToast('Warehouse Mesh terminal connection dropped!', 'error');
        
        setTimeout(() => {
          setWifiStatus('Stable');
          setWifiPing(12);
          triggerToast('Warehouse Mesh terminal connection re-established.', 'success');
        }, 3000);
      }
    }, 4000);

    return () => clearInterval(timer);
  }, [scannerCharging]);

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
      triggerToast('Failed to fetch stock information', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {toastMsg && <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg(null)} />}

      {/* Heading */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Focus Workspace</h2>
        <p className="text-xs text-slate-500 font-medium">
          Good morning, Operator. You have <strong className="text-blue-400">12 high-priority tasks</strong> requiring immediate attention.
        </p>
      </div>

      {/* Search and Action Bar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Scan SKU, Location, or Order ID... [CMD] [K]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-350 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter('')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
              statusFilter === '' 
                ? 'bg-blue-600 border-blue-500 text-white shadow-md' 
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            All Stock
          </button>
          <button
            onClick={() => setStatusFilter('LowStock')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
              statusFilter === 'LowStock' 
                ? 'bg-amber-600 border-amber-500 text-white shadow-md' 
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Low Stock Alerts
          </button>
        </div>
      </div>

      {/* Main Grid: Pick lists & Analytics / Read-only stock */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Active Pick Lists (Left side) */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Pick Lists Widget */}
          <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Active Pick Lists</h3>
              <span className="text-[10px] text-blue-400 font-bold">Zone A & B • 4 Tasks Pending</span>
            </div>

            <div className="space-y-3">
              {/* Batch 1 */}
              <div className="flex items-center justify-between p-4 bg-slate-950/40 border border-slate-850 hover:border-slate-800 rounded-xl transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">Batch #9921 - Electronics</span>
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold">85% Complete</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">Location: A-12-04 • 14 Items</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors">
                  Resume
                </button>
              </div>

              {/* Batch 2 */}
              <div className="flex items-center justify-between p-4 bg-slate-950/40 border border-slate-850 hover:border-slate-800 rounded-xl transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">Batch #9925 - Home Goods</span>
                    <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-bold">Queueing...</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">Location: B-05-11 • 28 Items</p>
                </div>
                <button className="bg-slate-800 hover:bg-slate-750 text-slate-300 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-slate-700 transition-colors">
                  Start Pick
                </button>
              </div>
            </div>
          </div>

          {/* Read-Only Stock View */}
          <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-500" />
                Current Storage Allocations
              </h3>
              <span className="text-[10px] text-slate-400">Total Items Cataloged: {products.length}</span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-500 font-semibold text-xs flex items-center justify-center gap-2">
                <Activity className="w-4 h-4 animate-spin text-blue-500" />
                Syncing warehouse node allocations...
              </div>
            ) : products.length === 0 ? (
              <p className="text-xs text-slate-500 py-12 text-center">No available inventory records.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[9px]">
                      <th className="py-2">Item Name</th>
                      <th className="py-2">SKU</th>
                      <th className="py-2 text-right">Available Qty</th>
                      <th className="py-2 text-center">Inventory Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/60">
                    {products.map((p) => {
                      let levelStyle = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                      let label = 'Optimal';
                      if (p.quantity === 0) {
                        levelStyle = 'bg-rose-500/10 text-rose-500 border-rose-500/20';
                        label = 'Out of Stock';
                      } else if (p.quantity < 10) {
                        levelStyle = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                        label = 'Low Stock';
                      }
                      
                      return (
                        <tr key={p.id} className="hover:bg-slate-800/10 transition-colors">
                          <td className="py-2.5 font-semibold text-slate-200">{p.name}</td>
                          <td className="py-2.5 font-mono text-slate-450">{p.sku}</td>
                          <td className="py-2.5 text-right font-bold text-slate-200">{p.quantity} Units</td>
                          <td className="py-2.5 text-center">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[8px] border uppercase ${levelStyle}`}>
                              {label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right sidebars widgets matching design screenshots */}
        <div className="space-y-6">
          
          {/* Efficiency Score Widget */}
          <div className="glass-panel p-6 rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 to-[#1d1b3a] space-y-4 glow-blue">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Efficiency Score</span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-white">98.4%</span>
              <span className="text-emerald-400 text-xs font-bold flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                ↑ 1.2%
              </span>
            </div>
            <p className="text-[11px] text-slate-450 leading-relaxed font-semibold">
              Top 5% of operators this shift. Keep up the pace!
            </p>
          </div>

          {/* Device Status Sidebar */}
          <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800/60 pb-3 flex items-center justify-between">
              <span>Device Status</span>
              <span className="text-[9px] bg-slate-850 px-2 py-0.5 rounded font-mono text-slate-500 uppercase">Live Telemetry</span>
            </h3>
            
            <div className="space-y-4">
              {/* Device 1 */}
              <div className="flex items-center justify-between text-xs p-2 bg-slate-950/20 border border-slate-900 rounded-lg hover:border-slate-850 transition-colors">
                <div className="space-y-1">
                  <span className="flex items-center gap-2 text-slate-400 font-semibold">
                    <Smartphone className={`w-4 h-4 ${scannerCharging ? 'text-amber-500 animate-pulse' : 'text-blue-500'}`} />
                    Handheld Scanner
                  </span>
                  <span className="block text-[9px] text-slate-550 font-medium">
                    {scannerCharging ? 'Status: Charging...' : 'Status: Discharging'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-bold font-mono text-xs ${scannerBattery < 20 ? 'text-rose-500 animate-pulse' : 'text-slate-250'}`}>
                    {scannerBattery}%
                  </span>
                  <button 
                    onClick={() => {
                      setScannerCharging(prev => !prev);
                      triggerToast(scannerCharging ? 'Scanner unplugged.' : 'Scanner plugged in to charge.', 'info');
                    }}
                    className={`text-[9px] font-bold px-2 py-0.5 rounded border transition-colors ${
                      scannerCharging 
                        ? 'bg-amber-600/10 border-amber-500/20 text-amber-400 hover:bg-amber-600/20' 
                        : 'bg-blue-600/10 border-blue-500/20 text-blue-400 hover:bg-blue-600/20'
                    }`}
                  >
                    {scannerCharging ? 'Unplug' : 'Charge'}
                  </button>
                </div>
              </div>
              
              {/* Device 2 */}
              <div className="flex items-center justify-between text-xs p-2 bg-slate-950/20 border border-slate-900 rounded-lg hover:border-slate-850 transition-colors">
                <div className="space-y-1">
                  <span className="flex items-center gap-2 text-slate-400 font-semibold">
                    <Wifi className={`w-4 h-4 ${wifiStatus === 'Offline' ? 'text-rose-500 animate-pulse' : 'text-emerald-500'}`} />
                    Warehouse Mesh
                  </span>
                  <span className="block text-[9px] text-slate-550 font-medium">
                    {wifiStatus === 'Offline' ? 'Status: Packet Loss' : `RTT Ping: ${wifiPing}ms`}
                  </span>
                </div>
                <div>
                  <span className={`font-bold text-xs ${wifiStatus === 'Offline' ? 'text-rose-500 font-bold animate-pulse' : 'text-emerald-400 font-sans'}`}>
                    {wifiStatus}
                  </span>
                </div>
              </div>

              {/* Device 3 */}
              <div className="flex items-center justify-between text-xs p-2 bg-slate-950/20 border border-slate-900 rounded-lg hover:border-slate-850 transition-colors">
                <div className="space-y-1">
                  <span className="flex items-center gap-2 text-slate-400 font-semibold">
                    <Printer className={`w-4 h-4 ${printerRibbon < 20 ? 'text-rose-550' : 'text-amber-550'}`} />
                    Label Printer B2
                  </span>
                  <span className="block text-[9px] text-slate-550 font-medium">
                    Ribbon status: {printerRibbon}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-xs ${printerRibbon < 20 ? 'text-rose-450' : 'text-slate-350'}`}>
                    {printerRibbon < 20 ? 'Low Ribbon' : 'Ready'}
                  </span>
                  <button 
                    onClick={() => {
                      setPrinterRibbon(100);
                      triggerToast('Ribbon replaced on Label Printer B2.', 'success');
                    }}
                    className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-[9px] font-bold px-2 py-0.5 rounded transition-colors"
                  >
                    Replace
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Shipments / incoming schedules */}
          <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Pending Shipments</h3>
              <span className="text-[9px] bg-rose-500/10 text-rose-500 border border-rose-500/20 px-2 py-0.5 rounded font-bold">
                {shipments.filter(s => s.progress < 4).length} Active
              </span>
            </div>

            <div className="space-y-3">
              {shipments.map((s) => {
                let statusColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                if (s.status === 'In Transit') {
                  statusColor = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
                } else if (s.status === 'Arrived') {
                  statusColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                } else if (s.status === 'Completed') {
                  statusColor = 'bg-slate-800 text-slate-400 border-slate-700/40';
                }

                return (
                  <div key={s.id} className="flex flex-col p-3 bg-slate-950/30 border border-slate-850 rounded-lg hover:border-slate-800 transition-all gap-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="block text-xs font-bold text-slate-200">{s.carrier}</span>
                        <span className="block text-[9px] text-slate-500">Pick-up window: {s.time}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase border ${statusColor}`}>
                        {s.status}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center text-[10px] text-slate-450 border-t border-slate-900/60 pt-2 mt-1">
                      <span>{s.items} • {s.zone}</span>
                      
                      {s.progress === 1 && (
                        <button 
                          onClick={() => advanceShipment(s.id)}
                          className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 text-[9px] font-bold px-2 py-0.5 rounded border border-blue-500/20 transition-all"
                        >
                          Dispatch
                        </button>
                      )}
                      {s.progress === 2 && (
                        <button 
                          onClick={() => advanceShipment(s.id)}
                          className="bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 hover:text-amber-300 text-[9px] font-bold px-2 py-0.5 rounded border border-amber-500/20 transition-all"
                        >
                          Arrived
                        </button>
                      )}
                      {s.progress === 3 && (
                        <button 
                          onClick={() => advanceShipment(s.id)}
                          className="bg-emerald-650 hover:bg-emerald-700 text-white text-[9px] font-bold px-2 py-0.5 rounded transition-all"
                        >
                          Unload
                        </button>
                      )}
                      {s.progress === 4 && (
                        <span className="text-emerald-400 text-[9px] font-bold flex items-center gap-1">
                          ✓ Cataloged
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
