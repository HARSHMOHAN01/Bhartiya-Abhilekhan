import React, { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Toast } from '../components/Toast';
import { 
  UserCheck, 
  ShoppingBag, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Loader2,
  Calendar,
  Truck,
  ShieldCheck,
  AlertTriangle,
  Minus
} from 'lucide-react';

export default function StaffOrders() {
  const {
    selectedCustomer,
    cartItems,
    orderLoading,
    selectCustomer,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    estimatedTotal,
    placeOrder
  } = useCart();

  // Component local lookups
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [shippingAddress, setShippingAddress] = useState('4522 Industrial Pkwy, Suite 400\nChicago, IL 60609\nUnited States');

  // Interactive selectors
  const [customerSearch, setCustomerSearch] = useState('');
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [isProductSelectOpen, setIsProductSelectOpen] = useState(false);

  // Toast Alerts
  const [toastMsg, setToastMsg] = useState(null);
  const [toastType, setToastType] = useState('success');

  const triggerToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      const [customersRes, productsRes] = await Promise.all([
        api.get('/customers'),
        api.get('/products')
      ]);
      setCustomers(customersRes.data);
      setProducts(productsRes.data);
    } catch (error) {
      triggerToast('Error loading customer/product databases', 'error');
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.full_name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const handleSelectCustomer = (c) => {
    selectCustomer(c);
    setCustomerSearch(c.full_name);
    setIsCustomerDropdownOpen(false);
    triggerToast(`Customer context set to: ${c.full_name}`, 'success');
  };

  const handleAddProductToCart = (prodId) => {
    const product = products.find(p => p.id === parseInt(prodId));
    if (product) {
      if (product.quantity <= 0) {
        addToCart(product, 0);
        setIsProductSelectOpen(false);
        triggerToast(`Added out-of-stock '${product.name}' to cart (Quantity set to 0)`, 'warning');
      } else {
        addToCart(product, 1);
        setIsProductSelectOpen(false);
        triggerToast(`Added '${product.name}' to cart`, 'success');
      }
    }
  };

  const handleSubmitOrder = async () => {
    if (!selectedCustomer) {
      triggerToast('Please select a customer first', 'error');
      return;
    }
    if (cartItems.length === 0) {
      triggerToast('Your order cart is currently empty', 'error');
      return;
    }

    // Double check inventory errors
    const inventoryError = cartItems.find(item => item.quantity > item.product.quantity);
    if (inventoryError) {
      triggerToast(`Insufficient inventory for ${inventoryError.product.name}`, 'error');
      return;
    }

    const result = await placeOrder();
    if (result.success) {
      triggerToast(`Order #${result.order.id} submitted successfully!`, 'success');
      // Reload products to get latest quantities
      fetchMetadata();
    } else {
      triggerToast(result.error, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {toastMsg && <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg(null)} />}

      {/* Header Notification Error (Alert box matching layout) */}
      {cartItems.some(item => item.quantity > item.product.quantity || item.quantity <= 0) && (
        <div className="flex gap-3 text-rose-500 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20 text-xs animate-pulse-subtle">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p className="font-semibold leading-relaxed">
            400 Bad Request: Some fields require correction before submission. Out-of-stock items (quantity 0) or stock limit violations found.
          </p>
        </div>
      )}

      {/* Two Column Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Column: Customer Profile Details (ColSpan 2) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="bg-blue-600/15 p-2 rounded-lg text-blue-500">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Customer Details</h3>
                <p className="text-[10px] text-slate-500 font-semibold">Assign this order to a client profile</p>
              </div>
            </div>

            {/* Search Input Autocomplete */}
            <div className="relative">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-550 mb-1.5">Search Customer</label>
              <input
                type="text"
                placeholder="Search by client name, email..."
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value);
                  setIsCustomerDropdownOpen(true);
                }}
                onFocus={() => setIsCustomerDropdownOpen(true)}
                className="input-field text-xs"
              />
              
              {/* Autocomplete dropdown */}
              {isCustomerDropdownOpen && filteredCustomers.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 max-h-40 overflow-y-auto bg-slate-900 border border-slate-800 rounded-lg shadow-2xl z-30 divide-y divide-slate-850">
                  {filteredCustomers.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleSelectCustomer(c)}
                      className="w-full text-left px-4 py-2 hover:bg-slate-800 text-xs text-slate-200 block transition-colors"
                    >
                      <span className="font-bold block">{c.full_name}</span>
                      <span className="text-[10px] text-slate-550 block">{c.email}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Customer metadata preview */}
            {selectedCustomer && (
              <div className="space-y-3 pt-3 border-t border-slate-800/60">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-[9px] font-bold uppercase text-slate-500">COMPANY / FULL NAME</span>
                    <span className="text-xs font-bold text-slate-200">{selectedCustomer.full_name}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold uppercase text-slate-500">EMAIL ADDRESS</span>
                    <span className="text-xs font-semibold text-slate-350 truncate block">{selectedCustomer.email}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {selectedCustomer.phone_number && (
                    <div>
                      <span className="block text-[9px] font-bold uppercase text-slate-500">PHONE NUMBER</span>
                      <span className="text-xs font-semibold text-slate-350">{selectedCustomer.phone_number}</span>
                    </div>
                  )}
                  <div>
                    <span className="block text-[9px] font-bold uppercase text-slate-500 font-sans">TIER</span>
                    <span className="inline-block mt-0.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[9px] rounded">
                      Enterprise
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Shipping address area */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-550 mb-1.5">Shipping Address</label>
              <textarea
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                rows="3"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Right Column: Cart items builder (ColSpan 3) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600/15 p-2 rounded-lg text-blue-500">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Product Selection</h3>
                  <p className="text-[10px] text-slate-500 font-semibold">Configure items and quantities</p>
                </div>
              </div>

              {/* Add Product trigger */}
              <div className="relative">
                <button
                  onClick={() => setIsProductSelectOpen(!isProductSelectOpen)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Item
                </button>

                {isProductSelectOpen && (
                  <div className="absolute right-0 top-full mt-1 w-64 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl z-30 max-h-48 overflow-y-auto divide-y divide-slate-850">
                    {products.map((p) => {
                      const isOutOfStock = p.quantity <= 0;
                      return (
                        <button
                          key={p.id}
                          onClick={() => handleAddProductToCart(p.id)}
                          className={`w-full text-left px-4 py-2 hover:bg-slate-800 text-xs block transition-colors ${
                            isOutOfStock ? 'text-slate-500 hover:text-rose-350' : 'text-slate-300 hover:text-white'
                          }`}
                        >
                          <span className="font-bold block flex justify-between items-center">
                            <span>{p.name}</span>
                            {isOutOfStock && <span className="text-[8px] bg-rose-500/10 text-rose-500 border border-rose-500/20 px-1 py-0.5 rounded font-extrabold uppercase ml-1 shrink-0">Out of Stock</span>}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            SKU: {p.sku} • ${p.price.toFixed(2)} • Stock: {p.quantity}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Cart Items List */}
            {cartItems.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-500 font-semibold text-xs border-2 border-dashed border-slate-800/80 rounded-xl bg-slate-950/20">
                <ShoppingBag className="w-8 h-8 text-slate-650 mb-2" />
                Click 'Add Item' to include more products
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => {
                  const isExceeded = item.quantity > item.product.quantity;
                  const isInvalid = item.quantity <= 0 || isExceeded;
                  const itemSubtotal = item.product.price * item.quantity;
                  
                  return (
                    <div 
                      key={item.product.id}
                      className={`flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-xl transition-all border ${
                        isInvalid 
                          ? 'bg-rose-950/20 border-rose-500' 
                          : 'bg-slate-950/40 border-slate-850 hover:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 font-extrabold">
                          {item.product.name.substring(0, 1)}
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide font-mono">SKU: {item.product.sku}</span>
                          <span className="block font-bold text-slate-200 text-xs">{item.product.name}</span>
                          <span className="block text-[10px] text-slate-450 font-bold">${item.product.price.toFixed(2)} / unit</span>
                          {item.product.quantity <= 0 ? (
                            <span className="text-[10px] font-extrabold text-rose-500 mt-1 flex items-center gap-1 animate-pulse">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              OUT OF STOCK (Available: 0 Units)
                            </span>
                          ) : (
                            <>
                              {isExceeded && (
                                <span className="text-[10px] font-extrabold text-rose-500 mt-1 flex items-center gap-1 animate-pulse">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  Insufficient Stock (Available: {item.product.quantity} Units)
                                </span>
                              )}
                              {item.quantity <= 0 && (
                                <span className="text-[10px] font-extrabold text-rose-500 mt-1 flex items-center gap-1 animate-pulse">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  Quantity must be at least 1 unit
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                        {/* Quantity Counter */}
                        <div className="space-y-1">
                          <div className={`flex items-center bg-slate-950 rounded-lg p-0.5 border ${
                            isInvalid ? 'border-rose-500' : 'border-slate-800'
                          } ${item.product.quantity <= 0 ? 'opacity-40' : ''}`}>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              disabled={item.product.quantity <= 0}
                              className="p-1 text-slate-400 hover:text-white hover:bg-slate-900 rounded transition-colors disabled:opacity-35 disabled:pointer-events-none"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              disabled={item.product.quantity <= 0}
                              onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value) || 0)}
                              className="w-10 text-center bg-transparent border-none text-slate-200 text-xs font-bold focus:outline-none disabled:text-slate-500"
                            />
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              disabled={item.product.quantity <= 0}
                              className="p-1 text-slate-400 hover:text-white hover:bg-slate-900 rounded transition-colors disabled:opacity-35 disabled:pointer-events-none"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {item.product.quantity <= 0 ? (
                            <span className="block text-[9px] font-bold text-rose-500 leading-none">
                              Locked: 0 Units
                            </span>
                          ) : (
                            <>
                              {isExceeded && (
                                <span className="block text-[9px] font-bold text-rose-500 leading-none">
                                  Max: {item.product.quantity} units
                                </span>
                              )}
                              {item.quantity <= 0 && (
                                <span className="block text-[9px] font-bold text-rose-500 leading-none">
                                  Min: 1 unit
                                </span>
                              )}
                            </>
                          )}
                        </div>

                        {/* Subtotal & Action */}
                        <div className="text-right">
                          <span className="block text-[9px] font-bold uppercase text-slate-500">SUBTOTAL</span>
                          <span className="block font-extrabold text-blue-500 text-xs">
                            ${itemSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-2 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-colors border border-rose-500/15"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Checkout Bottom Block Card matching layout precisely */}
      <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="grid grid-cols-2 md:grid-cols-2 gap-8 w-full md:w-auto">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-slate-500" />
              <div>
                <span className="block text-[9px] font-bold uppercase text-slate-500">Order Date</span>
                <span className="text-xs font-bold text-slate-300">
                  {new Date().toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-slate-500" />
              <div>
                <span className="block text-[9px] font-bold uppercase text-slate-500 font-sans">Estimated Delivery</span>
                <span className="text-xs font-bold text-slate-350">3-5 Days</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl text-right w-full sm:w-auto sm:min-w-[200px] glow-blue">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">ESTIMATED TOTAL</span>
              <span className="text-2xl font-extrabold text-blue-500 font-sans">
                ${estimatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <span className="block text-[9px] font-bold text-slate-550 mt-0.5 flex items-center gap-1 justify-end">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                Price verified by system
              </span>
            </div>

            <button
              onClick={handleSubmitOrder}
              disabled={orderLoading || cartItems.length === 0 || cartItems.some(item => item.quantity > item.product.quantity || item.quantity <= 0)}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white font-bold text-xs py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/10 min-h-[56px]"
            >
              {orderLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              Submit Order
            </button>
          </div>
        </div>

        {/* Operating status bar */}
        <div className="flex items-center justify-between text-[9px] text-slate-550 border-t border-slate-850 pt-4 font-bold">
          <span>SYSTEM STATUS: <span className="text-emerald-500 uppercase">OPERATIONAL</span></span>
          <span>VERSION: 4.2.0-STABLE</span>
          <span>ENVIRONMENT: PRODUCTION CLUSTER-01</span>
          <span>LAST SYNC: 2M AGO</span>
        </div>
      </div>
    </div>
  );
}
