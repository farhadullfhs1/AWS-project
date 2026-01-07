import React, { useState, useEffect } from 'react';
import { 
  Coffee, ShoppingBag, User, Menu as MenuIcon, X, 
  ChevronRight, Star, MapPin, Phone, Instagram, 
  Facebook, Twitter, Trash2, Plus, Minus, LogOut,
  LayoutDashboard, Package, Loader2, CreditCard, CheckCircle, Ban
} from 'lucide-react';

const API_URL = "https://farha17.pythonanywhere.com/api"; 
// Note: If testing locally, switch to "http://127.0.0.1:8000/api"

// --- MOCK DATA FOR FALLBACK ---
const MOCK_PRODUCTS = [
  { id: 1, name: "Signature Espresso", price: 120, category: "Hot Coffee", image: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=600&q=80", desc: "Rich, bold, and intense." },
  { id: 2, name: "Caramel Cappuccino", price: 150, category: "Hot Coffee", image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=600&q=80", desc: "Sweet caramel with frothy milk." },
  { id: 3, name: "Iced Americano", price: 140, category: "Cold Coffee", image: "https://images.unsplash.com/photo-1517701604599-bb29b5dd7359?auto=format&fit=crop&w=600&q=80", desc: "Chilled perfection for hot days." },
  { id: 4, name: "Vanilla Latte", price: 160, category: "Hot Coffee", image: "https://images.unsplash.com/photo-1570968992194-79569335af21?auto=format&fit=crop&w=600&q=80", desc: "Smooth espresso with vanilla syrup." },
  { id: 5, name: "Cold Brew", price: 180, category: "Cold Coffee", image: "https://images.unsplash.com/photo-1461023058943-48dbf13994c6?auto=format&fit=crop&w=600&q=80", desc: "Steeped for 12 hours for smoothness." },
  { id: 6, name: "Chocolate Muffin", price: 90, category: "Snacks", image: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=600&q=80", desc: "Decadent double chocolate delight." },
  { id: 7, name: "Croissant", price: 110, category: "Snacks", image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80", desc: "Buttery, flaky, and baked fresh daily." },
  { id: 8, name: "Matcha Latte", price: 170, category: "Tea", image: "https://images.unsplash.com/photo-1515823664972-6d9094ce13d2?auto=format&fit=crop&w=600&q=80", desc: "Premium Japanese green tea with steamed milk." },
];

// --- REUSABLE COMPONENTS ---

const Button = ({ children, onClick, variant = 'primary', className = '', type = 'button', disabled = false }) => {
  const baseStyle = "px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/20",
    secondary: "bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700",
    outline: "border-2 border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white",
    danger: "bg-red-600 hover:bg-red-500 text-white",
    ghost: "text-neutral-400 hover:text-white hover:bg-white/5"
  };
  return <button type={type} onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`} disabled={disabled}>{children}</button>;
};

const Input = ({ label, type = "text", placeholder, value, onChange }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-neutral-400 mb-1.5">{label}</label>
    <input 
      type={type} 
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors placeholder-neutral-600"
    />
  </div>
);

const Badge = ({ children, color = "amber" }) => {
  const colors = {
    amber: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    green: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    red: "bg-red-500/10 text-red-500 border-red-500/20",
    blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    neutral: "bg-neutral-800 text-neutral-400 border-neutral-700"
  };
  return <span className={`px-2 py-1 rounded text-xs font-medium border ${colors[color] || colors.neutral}`}>{children}</span>;
};

// --- LAYOUT COMPONENTS ---

const Navbar = ({ view, setView, cartCount, user, onLogout }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800 py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        
        {/* LOGO */}
        <div onClick={() => setView('home')} className="flex items-center gap-3 cursor-pointer group select-none">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl rotate-3 flex items-center justify-center text-white shadow-lg shadow-amber-600/20 group-hover:rotate-6 group-hover:shadow-amber-600/40 transition-all duration-300 ease-out">
            <Coffee size={22} strokeWidth={2.5} className="-rotate-3" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold text-white tracking-tight leading-none font-sans">
              BREW<span className="text-amber-500">HAVEN</span>
            </span>
            <span className="text-[10px] font-medium text-neutral-400 tracking-[0.2em] uppercase leading-none mt-1 group-hover:text-amber-500/80 transition-colors">
              Coffee Co.
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {['Home', 'Menu'].map((item) => (
            <button key={item} onClick={() => setView(item.toLowerCase())} className={`text-sm font-medium transition-colors hover:text-amber-500 ${view === item.toLowerCase() ? 'text-amber-500' : 'text-neutral-300'}`}>{item}</button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-neutral-400">Hi, {user.username || 'User'}</span>
              <button onClick={() => setView('orders')} className="text-neutral-300 hover:text-amber-500" title="Orders"><Package size={20} /></button>
              <button onClick={onLogout} className="text-neutral-300 hover:text-red-500" title="Logout"><LogOut size={20} /></button>
            </div>
          ) : (
             <div className="flex items-center gap-4">
              <button onClick={() => setView('login')} className="text-neutral-300 hover:text-white font-medium text-sm">Log In</button>
            </div>
          )}
          <button onClick={() => setView('cart')} className="relative p-2 text-neutral-300 hover:text-amber-500 transition-colors">
            <ShoppingBag size={22} />
            {cartCount > 0 && <span className="absolute top-0 right-0 w-5 h-5 bg-amber-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-neutral-950">{cartCount}</span>}
          </button>
        </div>
        
        <button className="md:hidden text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <MenuIcon />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-neutral-900 border-b border-neutral-800 absolute w-full px-4 py-4 flex flex-col gap-4">
          <button onClick={() => { setView('home'); setIsMobileMenuOpen(false); }} className="text-left text-white py-2">Home</button>
          <button onClick={() => { setView('menu'); setIsMobileMenuOpen(false); }} className="text-left text-white py-2">Menu</button>
          <button onClick={() => { setView('cart'); setIsMobileMenuOpen(false); }} className="text-left text-white py-2">Cart ({cartCount})</button>
          {!user ? (
            <button onClick={() => { setView('login'); setIsMobileMenuOpen(false); }} className="text-left text-amber-500 py-2">Login</button>
          ) : (
            <button onClick={() => { setView('orders'); setIsMobileMenuOpen(false); }} className="text-left text-amber-500 py-2">Orders</button>
          )}
        </div>
      )}
    </nav>
  );
};

const Footer = () => (
  <footer className="bg-neutral-950 border-t border-neutral-900 pt-16 pb-8">
    <div className="max-w-7xl mx-auto px-6 text-center text-neutral-600 text-sm">
      © 2026 BrewHaven Coffee Co. All rights reserved.
    </div>
  </footer>
);

// --- PAGES ---

const Home = ({ setView }) => (
  <div className="animate-fade-in">
    <div className="relative h-screen min-h-[600px] flex items-center">
      <div className="absolute inset-0 z-0">
        <img src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=2000" alt="Hero" className="w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/50 to-neutral-950/30" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">Wake Up & <br/><span className="text-amber-500">Smell the Coffee</span></h1>
        <Button onClick={() => setView('menu')}>Order Now</Button>
      </div>
    </div>
  </div>
);

const Menu = ({ products, addToCart, isOffline }) => (
  <div className="min-h-screen pt-24 pb-24 px-6 max-w-7xl mx-auto animate-fade-in">
    <h1 className="text-4xl font-bold text-white mb-4 text-center">Our Menu</h1>
    {isOffline && (
      <div className="max-w-md mx-auto mb-8 bg-amber-500/10 border border-amber-500/20 text-amber-500 px-4 py-2 rounded-lg text-center text-sm">
        Running in Preview Mode (Mock Data) - Check Console (F12) for API Error
      </div>
    )}
    
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {products.map(product => (
        <div key={product.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 hover:border-amber-600/30 transition-all group flex flex-col">
          <div className="relative rounded-xl overflow-hidden mb-4 aspect-square bg-neutral-800">
            {product.image && <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
          </div>
          <div className="mb-4 flex-1">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-bold text-white leading-tight">{product.name}</h3>
              <span className="text-amber-500 font-bold">₹{product.price}</span>
            </div>
            <p className="text-sm text-neutral-500 line-clamp-2">{product.desc}</p>
          </div>
          <Button onClick={() => addToCart(product)} variant="secondary" className="w-full">Add to Cart</Button>
        </div>
      ))}
    </div>
  </div>
);

const Cart = ({ cart, checkout, removeFromCart, setView }) => {
  const safeCart = Array.isArray(cart) ? cart : [];
  if (safeCart.length === 0) return <div className="min-h-screen pt-24 flex items-center justify-center text-neutral-500 flex-col"><ShoppingBag size={48} className="mb-4"/><p>Your cart is empty.</p><Button onClick={() => setView('menu')} className="mt-4">Go to Menu</Button></div>;
  const total = safeCart.reduce((acc, item) => acc + (parseFloat(item.product_price) * item.quantity), 0);

  return (
    <div className="min-h-screen pt-28 pb-24 px-6 max-w-7xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold text-white mb-8">Shopping Cart</h1>
      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-4">
          {safeCart.map(item => (
            <div key={item.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex gap-4 items-center group">
              <div className="w-20 h-20 bg-neutral-800 rounded-lg flex items-center justify-center text-neutral-600"><Coffee/></div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <h3 className="font-bold text-white">{item.product_name}</h3>
                  <span className="font-bold text-white">₹{(item.product_price * item.quantity).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-neutral-400">Qty: {item.quantity}</div>
                  <button onClick={() => removeFromCart(item.id)} className="text-neutral-600 hover:text-red-500 p-2 transition-colors" title="Remove Item">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 h-fit sticky top-24">
          <div className="flex justify-between text-white font-bold text-lg mb-6"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
          <Button onClick={checkout} className="w-full">Proceed to Pay</Button>
        </div>
      </div>
    </div>
  );
};

const Auth = ({ setView, onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const endpoint = isRegistering ? `${API_URL}/auth/register/` : `${API_URL}/auth/login/`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (res.status === 401 || res.status === 400) {
        let data = {}; try { data = await res.json(); } catch (e) {}
        setError(data.detail || data.error || "Invalid credentials or User exists.");
        setLoading(false); return; 
      }
      
      if (!res.ok) throw new Error("API Failed");
      const data = await res.json();
      
      if (isRegistering) {
        setIsRegistering(false);
        setError("Account created! Please log in.");
        setLoading(false);
      } else {
        onLogin(data.access, username);
      }
    } catch (err) {
      console.warn("Network error or Backend down:", err);
      setTimeout(() => { onLogin("mock-token-123", username || "Guest User"); }, 1000);
    } finally { if (!isRegistering) setLoading(false); }
  };

  return (
    <div className="min-h-screen pt-20 px-6 flex items-center justify-center animate-fade-in">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 p-8 rounded-2xl shadow-2xl">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">{isRegistering ? 'Create Account' : 'Welcome Back'}</h1>
        <p className="text-neutral-400 text-sm text-center mb-8">{isRegistering ? 'Join the community to start ordering' : 'Login to order your favorite coffee'}</p>
        {error && <div className={`p-3 rounded mb-4 text-sm text-center ${error.includes('created') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <Input label="Username" value={username} onChange={e => setUsername(e.target.value)} placeholder="username" />
          <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          <Button type="submit" className="w-full mt-6" disabled={loading}>{loading ? <Loader2 className="animate-spin"/> : (isRegistering ? 'Sign Up' : 'Log In')}</Button>
        </form>
        <div className="mt-6 text-center text-sm text-neutral-500">
          {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
          <button onClick={() => { setIsRegistering(!isRegistering); setError(""); }} className="text-amber-500 hover:underline font-medium">{isRegistering ? 'Log In' : 'Sign Up'}</button>
        </div>
      </div>
    </div>
  );
};

const Orders = ({ token, isOffline, cancelOrder }) => {
  const [orders, setOrders] = useState([]);

  const fetchOrders = () => {
    if (!token) return;
    fetch(`${API_URL}/orders/history/`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => { if (!res.ok) throw new Error("API Failed"); return res.json(); })
      .then(data => { if (Array.isArray(data)) setOrders(data); })
      .catch(err => {
        if (isOffline) {
          setOrders([ { id: 99, date: "2024-02-20", total: 450, status: 'Delivered', items: [{product_name: "Signature Espresso", quantity: 2, price: 240}] } ]);
        }
      });
  };

  useEffect(() => {
    fetchOrders();
  }, [token, isOffline]);

  const handleCancel = async (id) => {
    await cancelOrder(id);
    fetchOrders(); // Refresh list after cancel
  };

  return (
    <div className="min-h-screen pt-28 pb-12 px-6 max-w-4xl mx-auto animate-fade-in flex flex-col h-full">
      <h1 className="text-3xl font-bold text-white mb-8">Order History</h1>
      {/* Scrollable Container Fix */}
      <div className="space-y-4 overflow-y-auto flex-1 max-h-[70vh] pr-2 custom-scrollbar">
        {orders.length === 0 ? <p className="text-neutral-500">No orders found.</p> : orders.map(order => (
          <div key={order.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <div><span className="text-lg font-bold text-white block">Order #{order.id}</span><span className="text-neutral-500 text-sm">{order.date}</span></div>
              <div className="flex items-center gap-3">
                <Badge color={order.status === 'Delivered' ? 'green' : order.status === 'Cancelled' ? 'red' : 'amber'}>{order.status}</Badge>
                {order.status === 'Processing' && (
                  <button onClick={() => handleCancel(order.id)} className="text-neutral-500 hover:text-red-500 text-sm border border-neutral-700 px-3 py-1 rounded hover:border-red-500 transition-all flex items-center gap-1">
                    <Ban size={14}/> Cancel
                  </button>
                )}
              </div>
            </div>
            <div className="border-t border-neutral-800 pt-4">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm text-neutral-400 mb-1"><span>{item.quantity} x {item.product_name}</span><span>₹{item.price}</span></div>
              ))}
              <div className="flex justify-between text-white font-bold mt-2 pt-2 border-t border-neutral-800"><span>Total</span><span>₹{order.total}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- MAIN APP ---

function App() {
  const [view, setView] = useState('home');
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(token ? { username: 'User' } : null);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/products/`)
      .then(res => { if (!res.ok) throw new Error("API Failed"); return res.json(); })
      .then(data => { if (Array.isArray(data)) { setProducts(data); setIsOffline(false); } else { throw new Error("Invalid Data"); } })
      .catch(err => { console.warn("Backend not detected. Switching to Mock Mode.", err); setProducts(MOCK_PRODUCTS); setIsOffline(true); });
  }, []);

  useEffect(() => { if (token && !isOffline) fetchCart(); }, [token, isOffline]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setCart([]);
    setView('home');
  };

  const fetchCart = () => {
    fetch(`${API_URL}/orders/cart/`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(async res => {
        if (res.status === 401) { handleLogout(); return []; }
        if (!res.ok) throw new Error("Failed to fetch cart");
        return res.json();
      })
      .then(data => { if (Array.isArray(data)) setCart(data); })
      .catch(console.error);
  };

  const handleLogin = (accessToken, username) => {
    localStorage.setItem('token', accessToken);
    setToken(accessToken);
    setUser({ username });
    setView('home');
  };

  const addToCart = async (productOrId) => {
    if (!token) return setView('login');
    const product = typeof productOrId === 'object' ? productOrId : products.find(p => p.id === productOrId);
    
    if (isOffline) {
      setCart(prev => {
        const safePrev = Array.isArray(prev) ? prev : [];
        const existing = safePrev.find(p => p.id === product.id);
        if (existing) { return safePrev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p); }
        return [...safePrev, { ...product, product_name: product.name, product_price: product.price, quantity: 1 }];
      });
      alert("Added to cart (Mock Mode)");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/orders/cart/add/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ product_id: product.id })
      });
      if (res.ok) { fetchCart(); alert("Added to cart!"); }
    } catch (err) { alert("Failed to add to cart"); }
  };

  // --- NEW: Remove from Cart ---
  const removeFromCart = async (itemId) => {
    if (isOffline) {
      setCart(prev => prev.filter(item => item.id !== itemId));
      return;
    }
    
    try {
      const res = await fetch(`${API_URL}/orders/cart/remove/${itemId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchCart();
    } catch (err) { console.error("Remove failed", err); }
  };

  // --- NEW: Cancel Order ---
  const cancelOrder = async (orderId) => {
    if (isOffline) { alert("Cannot cancel in mock mode"); return; }
    
    if (!confirm("Are you sure you want to cancel this order?")) return;

    try {
      const res = await fetch(`${API_URL}/orders/cancel/${orderId}/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert("Order Cancelled Successfully");
      } else {
        alert("Could not cancel order (It might already be delivered)");
      }
    } catch (err) { console.error("Cancel failed", err); }
  };

  // --- RAZORPAY & INDIAN PAYMENTS LOGIC ---

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    if (!token) return;
    if (isOffline) { alert("Order placed! (Mock Mode)"); setCart([]); setView('orders'); return; }

    try {
      // 1. Create Order
      const res = await fetch(`${API_URL}/orders/create/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ fulfillment_type: 'pickup' })
      });
      const data = await res.json();
      
      if (!res.ok) { alert(data.error || "Order failed"); return; }

      const isLoaded = await loadRazorpay();
      if (!isLoaded) { alert("Razorpay SDK failed to load."); return; }

      const options = {
        key: data.key || "rzp_test_YOUR_KEY_HERE", // Use key from backend if available
        amount: data.amount,
        currency: data.currency,
        name: "BrewHaven Coffee",
        description: "Freshly Brewed Order",
        order_id: data.razorpay_order_id, 
        handler: function (response) {
            alert(`Payment Successful!\nPayment ID: ${response.razorpay_payment_id}`);
            setCart([]);
            setView('orders');
        },
        modal: {
            ondismiss: async function() {
                // User closed the popup without paying.
                if (confirm("Payment was cancelled. Do you want to cancel this order?")) {
                    await fetch(`${API_URL}/orders/cancel/${data.order_id}/`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    alert("Order cancelled.");
                } else {
                    setCart([]); 
                    setView('orders');
                }
            }
        },
        prefill: {
            name: user.username,
            email: "customer@example.com",
            contact: "9999999999"
        },
        theme: { color: "#d97706" }
      };
      
      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', async function (response){
            alert(`Payment Failed: ${response.error.description}`);
            // Auto-cancel order on failure
            await fetch(`${API_URL}/orders/cancel/${data.order_id}/`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
      });
      rzp1.open();

    } catch (err) {
      console.error(err);
      alert("Backend not configured for Razorpay yet. Order placed via COD.");
      setCart([]);
      setView('orders');
    }
  };

  const renderView = () => {
    switch(view) {
      case 'home': return <Home setView={setView} />;
      case 'menu': return <Menu products={products} addToCart={addToCart} isOffline={isOffline} />;
      case 'cart': return <Cart cart={cart} checkout={handleCheckout} removeFromCart={removeFromCart} setView={setView} />;
      case 'login': return <Auth setView={setView} onLogin={handleLogin} />;
      case 'orders': return <Orders token={token} isOffline={isOffline} cancelOrder={cancelOrder} />;
      default: return <Home setView={setView} />;
    }
  };

  const safeCartCount = Array.isArray(cart) ? cart.reduce((a,c) => a + c.quantity, 0) : 0;

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-amber-500/30">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap'); body { font-family: 'Outfit', sans-serif; } .animate-fade-in { animation: fadeIn 0.5s ease-out; } @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      <Navbar view={view} setView={setView} cartCount={safeCartCount} user={user} onLogout={handleLogout} />
      <main>{renderView()}</main>
      <Footer />
    </div>
  );
}

export default App;
