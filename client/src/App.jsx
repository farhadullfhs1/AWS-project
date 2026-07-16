import React, { useState, useEffect, useRef, useCallback } from 'react';
import { apiFetch, clearAuthSession, setAuthSession } from './services/api';
import { API_URL, MOCK_PRODUCTS, PICKUP_BRANCHES, LIVE_ORDER_STATUSES, normalizeLiveOrder, normalizeOrderStatus, isLiveOrder, readStoredUser } from './lib/brewhaven';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import MenuView from './pages/MenuView';
import OrderTrackingView from './pages/OrderTrackingView';
import OrdersView from './pages/OrdersView';
import Cart from './pages/Cart';
import PaymentView from './pages/PaymentView';
import Auth from './pages/Auth';
import StaffDashboard from './pages/StaffDashboard';

function App() {
  const [view, setView] = useState('home');
  const [products, setProducts] = useState([]);
  const [isProductLoading, setIsProductLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(() => readStoredUser() || (token ? { username: 'User', is_staff: false } : null));
  const [isOffline, setIsOffline] = useState(false);
  const [staffOrders, setStaffOrders] = useState([]);
  const [isStaffLoading, setIsStaffLoading] = useState(false);
  const [pendingPayment, setPendingPayment] = useState(null);
  const [activeOrders, setActiveOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('brewhaven-active-orders');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed.map(order => normalizeLiveOrder(order)).filter(Boolean) : [];
    } catch {
      return [];
    }
  });
  const [selectedOrderId, setSelectedOrderId] = useState(() => {
    try {
      return localStorage.getItem('brewhaven-selected-order-id') || '';
    } catch {
      return '';
    }
  });
  const pollRef = useRef(null);

  const liveOrders = activeOrders.filter(isLiveOrder);
  const selectedLiveOrder = liveOrders.find(order => String(order.id) === String(selectedOrderId)) || liveOrders[0] || null;

  useEffect(() => {
    try {
      localStorage.setItem('brewhaven-active-orders', JSON.stringify(activeOrders));
    } catch {}
  }, [activeOrders]);

  useEffect(() => {
    try {
      if (selectedOrderId) localStorage.setItem('brewhaven-selected-order-id', String(selectedOrderId));
      else localStorage.removeItem('brewhaven-selected-order-id');
    } catch {}
  }, [selectedOrderId]);

  useEffect(() => {
    try {
      if (user) localStorage.setItem('brewhaven-user', JSON.stringify(user));
      else localStorage.removeItem('brewhaven-user');
    } catch {}
  }, [user]);

  useEffect(() => {
    if (user?.is_staff && view !== 'staff') {
      setView('staff');
    }
  }, [user, view]);

  useEffect(() => {
    setIsProductLoading(true);
    fetch(`${API_URL}/products/`)
      .then(res => { if (!res.ok) throw new Error('API Failed'); return res.json(); })
      .then(data => { if (Array.isArray(data)) { setProducts(data); setIsOffline(false); } else { throw new Error('Invalid Data'); } })
      .catch(err => { console.warn('Backend not detected. Switching to Mock Mode.', err); setProducts(MOCK_PRODUCTS); setIsOffline(true); })
      .finally(() => setIsProductLoading(false));
  }, []);

  const handleLogout = useCallback(() => {
    clearAuthSession();
    localStorage.removeItem('brewhaven-user');
    localStorage.removeItem('brewhaven-active-orders');
    localStorage.removeItem('brewhaven-selected-order-id');
    setToken(null);
    setUser(null);
    setCart([]);
    setPendingPayment(null);
    setActiveOrders([]);
    setStaffOrders([]);
    setSelectedOrderId('');
    setView('home');
  }, []);

  useEffect(() => { if (token && !isOffline) fetchCart(); }, [token, isOffline]);

  const fetchStaffOrders = useCallback(async () => {
    if (!token || !user?.is_staff) return;
    setIsStaffLoading(true);
    try {
      const res = await apiFetch('/orders/staff/orders/');
      if (!res.ok) throw new Error('Failed to fetch staff queue');
      const data = await res.json();
      if (Array.isArray(data)) setStaffOrders(data);
    } catch (error) {
      console.warn('Staff queue fetch failed', error);
    } finally {
      setIsStaffLoading(false);
    }
  }, [token, user?.is_staff]);

  useEffect(() => {
    if (view !== 'staff' || !user?.is_staff) return;
    fetchStaffOrders();
    const timer = setInterval(fetchStaffOrders, 5000);
    return () => clearInterval(timer);
  }, [view, user?.is_staff, fetchStaffOrders]);

  useEffect(() => {
    const handleAuthLogout = () => handleLogout();
    window.addEventListener('brewhaven-auth-logout', handleAuthLogout);
    return () => window.removeEventListener('brewhaven-auth-logout', handleAuthLogout);
  }, [handleLogout]);

  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (!selectedLiveOrder || isOffline || !token) return;
    if (!LIVE_ORDER_STATUSES.has(normalizeOrderStatus(selectedLiveOrder.status))) return;

    pollRef.current = setInterval(async () => {
      try {
        const res = await apiFetch(`/orders/${selectedLiveOrder.id}/status/`);
        if (!res.ok) return;
        const data = await res.json();
        const mapped = normalizeOrderStatus(data.status, selectedLiveOrder.status);
        if (mapped) {
          setActiveOrders(prev => prev.map(order => String(order.id) === String(selectedLiveOrder.id) ? { ...order, status: mapped } : order));
        }
      } catch {}
    }, 6000);

    return () => clearInterval(pollRef.current);
  }, [selectedLiveOrder, isOffline, token]);

  function fetchCart() {
    apiFetch('/orders/cart/')
      .then(async res => {
        if (res.status === 401) { handleLogout(); return []; }
        if (!res.ok) throw new Error('Failed to fetch cart');
        return res.json();
      })
      .then(data => { if (Array.isArray(data)) setCart(data); })
      .catch(console.error);
  }

  const handleLogin = (accessToken, refreshToken, loginUser) => {
    setAuthSession({ access: accessToken, refresh: refreshToken });
    setToken(accessToken);
    const nextUser = typeof loginUser === 'string'
      ? { username: loginUser, is_staff: false, email: '', staff_branch: '', employee_id: '' }
      : {
          username: loginUser?.username || 'User',
          email: loginUser?.email || '',
          is_staff: !!loginUser?.is_staff,
          staff_branch: loginUser?.staff_branch || '',
          employee_id: loginUser?.employee_id || '',
        };
    setUser(nextUser);
    setView(nextUser.is_staff ? 'staff' : 'home');
  };

  const addToCart = async (productOrId, quantity = 1) => {
    if (!token) return setView('login');
    const product = typeof productOrId === 'object' ? productOrId : products.find(p => p.id === productOrId);
    if (!product) {
      alert('That item is no longer available.');
      return;
    }

    if (isOffline) {
      setCart(prev => {
        const safePrev = Array.isArray(prev) ? prev : [];
        const existing = safePrev.find(p => p.id === product.id);
        if (existing) return safePrev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + quantity } : p);
        return [...safePrev, { ...product, product_name: product.name, product_price: product.price, quantity }];
      });
      alert('Added to cart (Mock Mode)');
      return;
    }

    try {
      const res = await apiFetch('/orders/cart/add/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: product.id, quantity })
      });
      if (res.ok) { fetchCart(); alert('Added to cart!'); }
    } catch {
      alert('Failed to add to cart');
    }
  };

  const removeFromCart = async (itemId) => {
    if (isOffline) {
      setCart(prev => prev.filter(item => item.id !== itemId));
      return;
    }
    try {
      const res = await apiFetch(`/orders/cart/remove/${itemId}/`, { method: 'DELETE', headers: {} });
      if (res.ok) fetchCart();
    } catch (error) { console.error('Remove failed', error); }
  };

  const cancelOrder = async (orderId) => {
    if (isOffline) {
      setActiveOrders(prev => prev.map(order => String(order.id) === String(orderId) ? { ...order, status: 'cancelled' } : order));
      return;
    }
    try {
      const res = await apiFetch(`/orders/cancel/${orderId}/`, { method: 'POST', headers: {} });
      if (res.ok) {
        setActiveOrders(prev => prev.map(order => String(order.id) === String(orderId) ? { ...order, status: 'cancelled' } : order));
      } else {
        alert('Could not cancel order');
      }
    } catch (error) { console.error('Cancel failed', error); }
  };

  const cancelActiveOrder = (orderId = selectedLiveOrder?.id) => orderId && cancelOrder(orderId);

  const handleStaffAction = async (orderId, action) => {
    if (!orderId || !user?.is_staff) return;

    if (isOffline) {
      setStaffOrders(prev => prev
        .map(order => String(order.id) === String(orderId)
          ? { ...order, status: action === 'complete' ? 'Delivered' : action === 'ready' ? 'Ready for pickup' : 'Preparing' }
          : order)
        .filter(order => action !== 'complete' || String(order.id) !== String(orderId)));
      setActiveOrders(prev => {
        const nextStatus = action === 'complete' ? 'completed' : action === 'ready' ? 'ready' : 'preparing';
        return prev.map(order => String(order.id) === String(orderId) ? { ...order, status: nextStatus } : order);
      });
      return;
    }

    try {
      const res = await apiFetch(`/orders/staff/orders/${orderId}/action/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || 'Unable to update order status');
        return;
      }

      const normalized = normalizeLiveOrder({ ...data, status: data.status });
      if (normalized) {
        setActiveOrders(prev => prev.map(order => String(order.id) === String(orderId) ? { ...order, status: normalized.status } : order));
      }
      if (action === 'complete') {
        setStaffOrders(prev => prev.filter(order => String(order.id) !== String(orderId)));
      } else {
        setStaffOrders(prev => prev.map(order => String(order.id) === String(orderId) ? { ...order, ...data } : order));
      }
    } catch (error) {
      console.error('Staff action failed', error);
      alert('Unable to update order status');
    }
  };

  const trackExistingOrder = (order) => {
    const trackedOrder = normalizeLiveOrder({
      id: order.id,
      createdAt: order.createdAt || Date.now() - 30 * 1000,
      etaMinutes: order.etaMinutes || 5,
      status: order.status || 'preparing',
      items: order.items,
      total: order.total,
    }, 'preparing');
    setActiveOrders(prev => {
      const withoutCurrent = prev.filter(item => String(item.id) !== String(trackedOrder.id));
      return [...withoutCurrent, trackedOrder];
    });
    setSelectedOrderId(String(trackedOrder.id));
    setView('track');
  };

  const completePendingPayment = async (paymentOrder) => {
    if (!paymentOrder) return;
    const liveOrder = normalizeLiveOrder({
      id: paymentOrder.orderId,
      createdAt: Date.now(),
      etaMinutes: 5,
      status: 'placed',
      pickupBranch: paymentOrder.pickupBranch,
      items: paymentOrder.items.map(item => ({
        product_name: item.product_name,
        quantity: item.quantity,
        price: item.lineTotal,
      })),
      total: paymentOrder.total,
    }, 'placed');
    setActiveOrders(prev => {
      const withoutOrder = prev.filter(order => String(order.id) !== String(liveOrder.id));
      return [...withoutOrder, liveOrder];
    });
    setSelectedOrderId(String(liveOrder.id));
    setPendingPayment(null);
    setView('orders');
  };

  const handleCheckout = async (pickupBranch = PICKUP_BRANCHES[0]) => {
    if (!token) return;
    const nextOrderId = Math.floor(1000 + Math.random() * 9000);
    const cartSnapshot = cart;
    const total = cartSnapshot.reduce((acc, item) => acc + (parseFloat(item.product_price) * item.quantity), 0).toFixed(2);
    const paymentOrder = (orderId) => ({
      orderId,
      pickupBranch,
      total,
      items: cartSnapshot.map(item => ({
        product_name: item.product_name,
        quantity: item.quantity,
        lineTotal: parseFloat(item.product_price) * item.quantity,
      })),
    });

    if (isOffline) {
      setPendingPayment(paymentOrder(nextOrderId));
      setCart([]);
      setView('payment');
      return;
    }

    try {
      const res = await apiFetch('/orders/create/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fulfillment_type: 'pickup', pickup_branch: pickupBranch })
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error || 'Order failed'); return; }
      setPendingPayment(paymentOrder(data.order_id));
      setCart([]);
      setView('payment');
    } catch (error) {
      console.error(error);
      alert('Checkout Error. Please try again.');
    }
  };

  const renderView = () => {
    switch(view) {
      case 'home': return <Home setView={setView} user={user} activeOrder={selectedLiveOrder} />;
      case 'menu': return <MenuView products={products} addToCart={addToCart} isOffline={isOffline} isLoading={isProductLoading} />;
      case 'cart': return <Cart cart={cart} checkout={handleCheckout} removeFromCart={removeFromCart} setView={setView} />;
      case 'payment': return <PaymentView paymentOrder={pendingPayment} onPay={completePendingPayment} setView={setView} />;
      case 'login': return <Auth onLogin={handleLogin} />;
      case 'orders': return <OrdersView token={token} isOffline={isOffline} cancelOrder={cancelOrder} onTrackOrder={trackExistingOrder} liveOrders={liveOrders} setView={setView} selectedOrderId={selectedOrderId} />;
      case 'track': return <OrderTrackingView orders={activeOrders} selectedOrderId={selectedOrderId} isOffline={isOffline} onCancel={cancelActiveOrder} onSelectOrder={setSelectedOrderId} setView={setView} />;
      case 'staff': return user?.is_staff ? <StaffDashboard orders={staffOrders} loading={isStaffLoading} onAction={handleStaffAction} onRefresh={fetchStaffOrders} setView={setView} branch={user?.staff_branch || ''} /> : <Home setView={setView} user={user} activeOrder={selectedLiveOrder} />;
      default: return <Home setView={setView} user={user} activeOrder={selectedLiveOrder} />;
    }
  };

  const safeCartCount = Array.isArray(cart) ? cart.reduce((a,c) => a + c.quantity, 0) : 0;

  return (
    <div className="bg-neutral-950 min-h-screen text-white font-sans selection:bg-amber-500 selection:text-white">
      <Navbar view={view} setView={setView} cartCount={safeCartCount} user={user} onLogout={handleLogout} activeOrder={selectedLiveOrder} />
      <main>{renderView()}</main>
      <Footer />
    </div>
  );
}

export default App;
