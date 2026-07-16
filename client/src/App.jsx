import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Coffee, ShoppingBag, User, Menu as MenuIcon, X, 
  ChevronRight, Star, MapPin, Phone, Instagram, 
  Facebook, Twitter, Trash2, Plus, Minus, LogOut,
  LayoutDashboard, Package, Loader2, CreditCard, CheckCircle, Ban,
  ReceiptText, Bell, Clock, Navigation
} from 'lucide-react';
import { apiFetch, clearAuthSession, setAuthSession } from './services/api';

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
const ALLOW_MOCK_AUTH = import.meta.env.VITE_ALLOW_MOCK_AUTH === 'true';

// --- MOCK DATA FOR FALLBACK ---
const MOCK_PRODUCTS = [
  { id: 1, name: "Signature Espresso", price: 120, category: "Hot Coffee", image: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=600&q=80", desc: "Rich, bold, and intense." },
  { id: 2, name: "Caramel Cappuccino", price: 150, category: "Hot Coffee", image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=600&q=80", desc: "Sweet caramel with frothy milk." },
  { id: 3, name: "Vanilla Latte", price: 160, category: "Hot Coffee", image: "https://images.unsplash.com/photo-1570968992194-79569335af21?auto=format&fit=crop&w=600&q=80", desc: "Smooth espresso with vanilla syrup." },
  { id: 4, name: "Mocha Cortado", price: 145, category: "Hot Coffee", image: "https://images.unsplash.com/photo-1507914372368-bebd1c6e0af5?auto=format&fit=crop&w=600&q=80", desc: "Tiny cup, big chocolate-coffee punch." },
  { id: 5, name: "Iced Americano", price: 140, category: "Cold Coffee", image: "https://images.unsplash.com/photo-1517701604599-bb29b5dd7359?auto=format&fit=crop&w=600&q=80", desc: "Chilled perfection for hot days." },
  { id: 6, name: "Cold Brew", price: 180, category: "Cold Coffee", image: "https://images.unsplash.com/photo-1461023058943-48dbf13994c6?auto=format&fit=crop&w=600&q=80", desc: "Steeped for 12 hours for smoothness." },
  { id: 7, name: "Iced Mocha", price: 175, category: "Cold Coffee", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80", desc: "Cool, chocolatey, and commute-friendly." },
  { id: 8, name: "Matcha Latte", price: 170, category: "Tea", image: "https://images.unsplash.com/photo-1515823664972-6d9094ce13d2?auto=format&fit=crop&w=600&q=80", desc: "Premium Japanese green tea with steamed milk." },
  { id: 9, name: "Masala Chai", price: 90, category: "Tea", image: "https://images.unsplash.com/photo-1515823663682-6f802a7d8d74?auto=format&fit=crop&w=600&q=80", desc: "Spiced, warm, and aromatic." },
  { id: 10, name: "Butter Croissant", price: 110, category: "Bakery", image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80", desc: "Buttery, flaky, and baked fresh daily." },
  { id: 11, name: "Chocolate Muffin", price: 95, category: "Bakery", image: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=600&q=80", desc: "Decadent double chocolate delight." },
  { id: 12, name: "Veg Sandwich", price: 130, category: "Breakfast", image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80", desc: "Fresh, filling, and easy to grab on the move." },
];

const MENU_CATEGORY_ORDER = ["All", "Hot Coffee", "Cold Coffee", "Tea", "Bakery", "Breakfast"];
const PICKUP_BRANCHES = [
  "Thane",
  "Mulund",
  "Bandra",
  "Kurla",
  "Dadar",
];
const LIVE_ORDER_STATUSES = new Set(['placed', 'processing', 'preparing', 'ready']);
const FINAL_ORDER_STATUSES = new Set(['completed', 'cancelled']);

// Small design-system button used across the app for consistent CTA styling.
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

// Reusable labeled input field for auth and form screens.
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

// Status pill used for order states, categories, and quick info labels.
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

const STATUS_META = {
  placed: { label: 'Placed', color: 'amber', description: 'Order received' },
  processing: { label: 'Placed', color: 'amber', description: 'Order received' },
  preparing: { label: 'Preparing', color: 'amber', description: 'Barista is working on it' },
  ready: { label: 'Ready for pickup', color: 'blue', description: 'Head to the counter' },
  completed: { label: 'Completed', color: 'green', description: 'Order collected' },
  Processing: { label: 'Placed', color: 'amber', description: 'Order received' },
  Preparing: { label: 'Preparing', color: 'amber', description: 'Barista is working on it' },
  'Ready for pickup': { label: 'Ready for pickup', color: 'blue', description: 'Head to the counter' },
  Delivered: { label: 'Completed', color: 'green', description: 'Order collected' },
  Cancelled: { label: 'Cancelled', color: 'red', description: 'Order stopped' },
  cancelled: { label: 'Cancelled', color: 'red', description: 'Order stopped' },
};

const getStatusMeta = (status) => STATUS_META[status] || STATUS_META.processing;

const normalizeOrderStatus = (status, fallback = 'placed') => {
  const raw = (status || fallback).toString().toLowerCase();
  if (raw.includes('cancel')) return 'cancelled';
  if (raw.includes('complete') || raw.includes('deliver')) return 'completed';
  if (raw.includes('ready')) return 'ready';
  if (raw.includes('prep')) return 'preparing';
  if (raw.includes('process') || raw.includes('place')) return 'placed';
  return raw;
};

const normalizeLiveOrder = (order, fallbackStatus = 'placed') => {
  if (!order) return null;
  const status = normalizeOrderStatus(order.status, fallbackStatus);
  return {
    id: order.id,
    createdAt: order.createdAt || Date.now(),
    etaMinutes: order.etaMinutes || 5,
    status,
    pickupBranch: order.pickupBranch || order.pickup_branch || '',
    items: Array.isArray(order.items) ? order.items : [],
    total: order.total ?? 0,
  };
};

const isLiveOrder = (order) => !!order && !FINAL_ORDER_STATUSES.has(normalizeOrderStatus(order.status));

const readStoredUser = () => {
  try {
    const raw = localStorage.getItem('brewhaven-user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// Shared page header block that keeps every screen visually aligned.
const PageIntro = ({ eyebrow, title, subtitle, actions }) => (
  <div className="mb-8 md:mb-10">
    {eyebrow && <Badge color="blue">{eyebrow}</Badge>}
    <h1 className="mt-4 text-3xl md:text-4xl font-bold text-white tracking-tight">{title}</h1>
    {subtitle && <p className="mt-3 max-w-2xl text-sm md:text-base text-neutral-400">{subtitle}</p>}
    {actions && <div className="mt-6 flex flex-wrap gap-3">{actions}</div>}
  </div>
);

// Skeleton card shown while menus, orders, or dashboards are loading.
const SkeletonCard = () => (
  <div className="animate-pulse rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
    <div className="aspect-square rounded-xl bg-neutral-800 mb-4" />
    <div className="h-4 w-3/5 rounded bg-neutral-800 mb-3" />
    <div className="h-3 w-4/5 rounded bg-neutral-800 mb-2" />
    <div className="h-3 w-2/5 rounded bg-neutral-800 mb-5" />
    <div className="h-11 rounded-lg bg-neutral-800" />
  </div>
);

// Empty-state panel for screens that need a friendly "nothing here yet" message.
const EmptyState = ({ icon, title, message, action }) => {
  const Icon = icon || Coffee;
  return (
    <div className="min-h-[55vh] flex items-center justify-center px-6">
      <div className="max-w-md w-full rounded-3xl border border-neutral-800 bg-neutral-900/90 p-8 text-center shadow-2xl shadow-black/20">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
          <Icon size={28} />
        </div>
        <h3 className="text-2xl font-bold text-white">{title}</h3>
        <p className="mt-3 text-sm text-neutral-400">{message}</p>
        {action && <div className="mt-6 flex justify-center">{action}</div>}
      </div>
    </div>
  );
};

// Top navigation bar with login, cart, tracking, and staff entry points.
const Navbar = ({ view, setView, cartCount, user, onLogout, activeOrder }) => {
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

        {user?.is_staff && (
          <div className="hidden md:flex items-center gap-4">
            <div className="flex flex-col text-right">
              <span className="text-sm font-semibold text-white">Staff Dashboard</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">{user.staff_branch || 'Unassigned branch'}</span>
            </div>
            <button onClick={onLogout} className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900 px-4 py-2 text-sm font-medium text-neutral-200 hover:border-red-500/40 hover:text-red-400 transition-colors" title="Logout">
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}

        <div className={`hidden md:flex items-center gap-8 ${user?.is_staff ? 'hidden' : ''}`}>
          {['Home', 'Menu'].map((item) => (
            <button key={item} onClick={() => setView(item.toLowerCase())} className={`text-sm font-medium transition-colors hover:text-amber-500 ${view === item.toLowerCase() ? 'text-amber-500' : 'text-neutral-300'}`}>{item}</button>
          ))}
          {user && activeOrder && (
            <button onClick={() => setView('track')} className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${view === 'track' ? 'text-amber-500' : 'text-neutral-300 hover:text-amber-500'}`}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              Track Order
            </button>
          )}
        </div>

        <div className={`hidden md:flex items-center gap-4 ${user?.is_staff ? 'hidden' : ''}`}>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-neutral-400">Hi, {user.username || 'User'}{user.staff_branch ? ` · ${user.staff_branch}` : ''}</span>
              {user.is_staff && (
                <button onClick={() => setView('staff')} className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${view === 'staff' ? 'text-amber-500' : 'text-neutral-300 hover:text-amber-500'}`}>
                  Staff Queue
                </button>
              )}
              <button onClick={() => setView('orders')} className="inline-flex items-center gap-2 text-neutral-300 hover:text-amber-500" title="My Orders">
                <ReceiptText size={20} />
                <span className="text-sm font-medium">My Orders</span>
              </button>
              <button onClick={onLogout} className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900 px-4 py-2 text-sm font-medium text-neutral-200 hover:border-red-500/40 hover:text-red-400 transition-colors" title="Logout">
                <LogOut size={16} />
                Logout
              </button>
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
        
        <button className={`md:hidden text-white ${user?.is_staff ? 'hidden' : ''}`} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <MenuIcon />}
        </button>
      </div>

      {!user?.is_staff && isMobileMenuOpen && (
        <div className="md:hidden bg-neutral-900 border-b border-neutral-800 absolute w-full px-4 py-4 flex flex-col gap-4">
          <button onClick={() => { setView('home'); setIsMobileMenuOpen(false); }} className="text-left text-white py-2">Home</button>
          <button onClick={() => { setView('menu'); setIsMobileMenuOpen(false); }} className="text-left text-white py-2">Menu</button>
          {user && activeOrder && <button onClick={() => { setView('track'); setIsMobileMenuOpen(false); }} className="text-left text-amber-500 py-2 flex items-center gap-2"><Bell size={16}/> Track Order</button>}
          <button onClick={() => { setView('cart'); setIsMobileMenuOpen(false); }} className="text-left text-white py-2">Cart ({cartCount})</button>
          {!user ? (
            <button onClick={() => { setView('login'); setIsMobileMenuOpen(false); }} className="text-left text-amber-500 py-2">Login</button>
          ) : (
            <div className="flex gap-2">
              {user.is_staff && (
                <button onClick={() => { setView('staff'); setIsMobileMenuOpen(false); }} className="flex-1 text-left text-amber-500 py-2">Staff Queue</button>
              )}
              <button onClick={() => { setView('orders'); setIsMobileMenuOpen(false); }} className="flex-1 text-left text-amber-500 py-2">My Orders</button>
              <button
                onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-700 px-3 py-2 text-neutral-200"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

// Simple footer that closes out the landing page and keeps branding consistent.
const Footer = () => (
  <footer className="bg-neutral-950 border-t border-neutral-900 pt-16 pb-8">
    <div className="max-w-7xl mx-auto px-6 text-center text-neutral-600 text-sm">
      © 2026 BrewHaven Coffee Co. All rights reserved.
    </div>
  </footer>
);

// Home/landing page that sells the pre-ordering and pickup workflow.
const Home = ({ setView, activeOrder, user }) => (
  <div className="animate-fade-in">
    <div className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=2000" alt="Hero" className="w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-neutral-950/30" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 w-full">
        {user && activeOrder && (
          <button onClick={() => setView('track')} className="mb-6 inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-2 rounded-full text-sm font-medium hover:bg-amber-500/20 transition-colors">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            Order #{activeOrder.id} is on the way — tap to track
          </button>
        )}
        <h1 className="mt-6 text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight">Order while you travel,<br/><span className="text-amber-500">pick up on arrival.</span></h1>
        <p className="mt-6 max-w-2xl text-lg text-neutral-300">BrewHaven is built for the commute: pre-order your coffee or snack, watch the status update, and walk in to collect it without queueing.</p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Button onClick={() => setView('menu')}>Book Your Order</Button>
          {user && <Button onClick={() => setView('orders')} variant="secondary">Track My Order</Button>}
        </div>
      </div>
    </div>
  </div>
);

// Main menu screen with category filtering and add-to-cart actions.
const MenuView = ({ products, addToCart, isOffline, isLoading }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const productList = Array.isArray(products) ? products : [];
  const [quantities, setQuantities] = useState({});
  const availableCategories = [
    'All',
    ...MENU_CATEGORY_ORDER.filter(category => category !== 'All' && productList.some(product => product.category === category)),
    ...Array.from(new Set(productList.map(product => product.category).filter(Boolean))).filter(category => !MENU_CATEGORY_ORDER.includes(category)),
  ];
  const safeSelectedCategory = availableCategories.includes(selectedCategory) ? selectedCategory : 'All';
  const filteredProducts = safeSelectedCategory === 'All'
    ? productList
    : productList.filter(product => product.category === safeSelectedCategory);

  useEffect(() => {
    setQuantities(prev => {
      const next = {};
      productList.forEach(product => {
        next[product.id] = Math.max(1, prev[product.id] || 1);
      });
      return next;
    });
  }, [productList]);

  const setQuantity = (productId, delta) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + delta),
    }));
  };

  return (
    <div className="min-h-screen pt-24 pb-24 px-6 max-w-7xl mx-auto animate-fade-in">
      <PageIntro
        eyebrow="Menu"
        title="Fresh picks for the commute"
        subtitle="Tap any coffee or snack, choose a quantity, and head in with a pickup order already in progress."
      />
      {isOffline && (
        <div className="mb-8 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          Running in preview mode with mock data because the backend is offline.
        </div>
      )}

      <div className="mb-8 flex flex-wrap gap-3">
        {availableCategories.map(category => {
          const active = selectedCategory === category;
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                active
                  ? 'border-amber-500 bg-amber-500 text-neutral-950'
                  : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-amber-500/40 hover:text-white'
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="text-sm text-neutral-500">
          {filteredProducts.length} item{filteredProducts.length === 1 ? '' : 's'} in this section
        </p>
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-600">Pickup friendly menu</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {isLoading ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />) : filteredProducts.map(product => (
          <div key={product.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 hover:border-amber-600/30 transition-all group flex flex-col shadow-lg shadow-black/10">
            <div className="relative rounded-xl overflow-hidden mb-4 aspect-square bg-neutral-800">
              {product.image && <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
            </div>
            <div className="mb-4 flex-1">
              <div className="flex justify-between items-start mb-2 gap-4">
                <h3 className="text-lg font-bold text-white leading-tight">{product.name}</h3>
                <span className="text-amber-500 font-bold">₹{product.price}</span>
              </div>
              <div className="mb-3 flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-950/70 px-3 py-2">
                <button type="button" onClick={() => setQuantity(product.id, -1)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-700 text-neutral-300 transition-colors hover:border-amber-500 hover:text-amber-500" aria-label={`Decrease quantity for ${product.name}`}><Minus size={14} /></button>
                <span className="min-w-8 text-center text-sm font-semibold text-white">{quantities[product.id] || 1}</span>
                <button type="button" onClick={() => setQuantity(product.id, 1)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-700 text-neutral-300 transition-colors hover:border-amber-500 hover:text-amber-500" aria-label={`Increase quantity for ${product.name}`}><Plus size={14} /></button>
              </div>
              <div className="mb-2">
                <Badge color="neutral">{product.category}</Badge>
              </div>
              <p className="text-sm text-neutral-500 line-clamp-2">{product.desc}</p>
            </div>
            <Button onClick={() => addToCart(product, quantities[product.id] || 1)} variant="secondary" className="w-full">Add to Cart</Button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Live customer tracking screen that shows the brewing progress and cancel window.
const OrderTrackingView = ({ orders, selectedOrderId, isOffline, onCancel, onSelectOrder, setView }) => {
  const orderList = Array.isArray(orders) ? orders : [];
  const liveOrders = orderList.filter(isLiveOrder);
  const selectedOrder = orderList.find(order => String(order.id) === String(selectedOrderId)) || (selectedOrderId ? null : liveOrders[0]) || null;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!selectedOrder) {
    return (
      <EmptyState
        icon={Package}
        title="No active orders"
        message="Once you place a pickup order, you will see it here with live status and pickup timing."
        action={<Button onClick={() => setView('menu')}>Browse Menu</Button>}
      />
    );
  }

  const liveStage = normalizeOrderStatus(selectedOrder.status);
  const createdAt = selectedOrder.createdAt || now;
  const etaSeconds = (selectedOrder.etaMinutes || 5) * 60;
  const elapsedSeconds = Math.max(0, (now - createdAt) / 1000);
  const secondsLeft = Math.max(0, Math.round(etaSeconds - elapsedSeconds));
  const canCancel = liveStage === 'placed';
  const rawPercent = liveStage === 'completed'
    ? 100
    : liveStage === 'ready'
      ? 100
      : liveStage === 'preparing'
        ? Math.min(82, 35 + (elapsedSeconds / etaSeconds) * 28)
        : Math.min(32, Math.max(8, (elapsedSeconds / etaSeconds) * 32));
  const currentItems = Array.isArray(selectedOrder.items) ? selectedOrder.items : [];
  const fillStage = liveStage;
  const pickupBranch = selectedOrder.pickupBranch || selectedOrder.pickup_branch || 'Thane';

  return (
    <div className="min-h-screen pt-28 pb-12 px-6 max-w-4xl mx-auto animate-fade-in">
      <PageIntro
        eyebrow="Live orders"
        title="Track every pickup order"
        subtitle="When you place a second order, it appears beside the first one so you can switch between them without losing your place."
      />

      {liveOrders.length > 1 && (
        <div className="mb-6 flex flex-wrap gap-3">
          {liveOrders.map(order => (
            <button
              key={order.id}
              onClick={() => onSelectOrder(order.id)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                String(selectedOrderId) === String(order.id)
                  ? 'border-amber-500 bg-amber-500 text-neutral-950'
                  : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-amber-500/40 hover:text-white'
              }`}
            >
              Order #{order.id}
            </button>
          ))}
        </div>
      )}

      <p className="text-center text-sm text-neutral-400 mb-4">Your pickup order is moving through the cafe queue and will update live as staff changes its status.</p>
      <h1 className="text-3xl font-bold text-white text-center mb-8">
        {liveStage === 'ready' ? "It's ready! Come grab it ☕" :
         liveStage === 'preparing' ? "We're brewing your order" :
         liveStage === 'completed' ? "Order picked up - enjoy!" :
         liveStage === 'cancelled' ? "Order cancelled" :
         "We've got your order"}
      </h1>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 mb-8">
        <BrewCup percent={rawPercent} stage={fillStage} />

        <div className="text-center my-6">
          {liveStage === 'ready' ? (
            <Badge color="blue">Ready for pickup at the counter</Badge>
          ) : liveStage === 'completed' ? (
            <Badge color="green">Completed</Badge>
          ) : liveStage === 'cancelled' ? (
            <Badge color="red">Cancelled</Badge>
          ) : (
            <div className="space-y-1">
              <div className="text-sm text-neutral-400">Live status updates from the cafe will keep this card moving automatically.</div>
            </div>
          )}
        </div>

        <Stepper currentStage={liveStage} progress={rawPercent} />
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 mb-4 shadow-lg shadow-black/10">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Navigation size={16} className="text-amber-500"/> Pickup Details</h3>
        <div className="space-y-2 text-sm text-neutral-400">
          <div className="flex justify-between gap-4"><span>Order</span><span className="text-neutral-200 text-right">{currentItems.map(i => `${i.quantity}× ${i.product_name}`).join(', ')}</span></div>
          <div className="flex justify-between"><span>Total</span><span className="text-neutral-200 font-medium">₹{selectedOrder.total}</span></div>
          <div className="flex justify-between"><span>Pickup</span><span className="text-neutral-200">Counter Pickup</span></div>
          <div className="flex justify-between"><span>Branch</span><span className="text-neutral-200">{pickupBranch}</span></div>
        </div>
      </div>

      {liveStage === 'placed' && (
        <div className="mb-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-4 text-sm text-amber-100">
          <div className="font-semibold text-amber-200 mb-1">Cancellation window is open</div>
          You can cancel this order only until the staff starts preparing it.
        </div>
      )}

      {liveStage === 'preparing' && (
        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm text-red-100">
          <div className="font-semibold text-red-200 mb-1">Order is now locked</div>
          The cafe has started your order, so cancellation is no longer available.
        </div>
      )}

      {liveStage === 'ready' && (
        <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-100">
          <div className="font-semibold text-emerald-200 mb-1">Ready for pickup</div>
          Your order is waiting at the counter. Staff will mark it complete after pickup.
        </div>
      )}

      <div className="flex gap-3">
        {canCancel && (
          <Button onClick={() => onCancel(selectedOrder.id)} variant="secondary" className="flex-1"><Ban size={18}/> Cancel Order</Button>
        )}
        {liveStage === 'completed' && (
          <Button onClick={() => setView('menu')} className="flex-1">Order Again</Button>
        )}
      </div>
      {isOffline && <p className="text-center text-xs text-neutral-600 mt-6">Preview Mode - timing is simulated locally.</p>}
    </div>
  );
};

// Order history screen that lists past and active orders for the customer.
const OrdersView = ({ token, isOffline, cancelOrder, onTrackOrder, liveOrders, setView, selectedOrderId }) => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const fetchOrders = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await apiFetch(`/orders/history/`);
      if (!res.ok) throw new Error("API Failed");
      const data = await res.json();
      if (Array.isArray(data)) setOrders(data);
    } catch {
      if (isOffline) {
        setOrders([{ id: 99, date: "2024-02-20", total: 450, status: 'Ready for pickup', items: [{product_name: "Signature Espresso", quantity: 2, price: 240}] }]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, isOffline]);

  useEffect(() => {
    const timer = setTimeout(() => { fetchOrders(); }, 0);
    return () => clearTimeout(timer);
  }, [fetchOrders]);

  const handleCancel = async (id) => {
    await cancelOrder(id);
    fetchOrders();
  };

  return (
    <div className="min-h-screen pt-28 pb-12 px-6 max-w-4xl mx-auto animate-fade-in flex flex-col h-full">
      <PageIntro
        eyebrow="Tracking"
        title="Follow every pickup order"
        subtitle="See what is placed, preparing, and ready at the counter without digging through the backend."
      />

      {Array.isArray(liveOrders) && liveOrders.length > 0 && (
        <div className="mb-8 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-white font-semibold">Active cafe queue</h3>
              <p className="text-sm text-amber-200/80">Your in-progress pickup orders</p>
            </div>
            <Button variant="secondary" onClick={() => setView('track')}>Open Tracker</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {liveOrders.map(order => (
              <button
              key={order.id}
              onClick={() => onTrackOrder(order)}
              className={`rounded-full border px-3 py-2 text-sm transition-all ${
                  String(selectedOrderId) === String(order.id)
                    ? 'border-amber-500 bg-amber-500 text-neutral-950'
                    : 'border-neutral-700 bg-neutral-950 text-neutral-300 hover:border-amber-500/40'
                }`}
              >
                Order #{order.id}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4 overflow-y-auto flex-1 max-h-[70vh] pr-2 custom-scrollbar">
        {isLoading ? (
          <div className="grid gap-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No orders yet"
            message="Once you place a pickup order, it will appear here with a status badge and tracking summary."
            action={<Button onClick={() => setView('menu')} variant="secondary">Browse Menu</Button>}
          />
        ) : orders.map(order => {
          const normalizedStatus = normalizeOrderStatus(order.status);
          const canTrackOrder = !FINAL_ORDER_STATUSES.has(normalizedStatus);
          const canCancelOrder = order.can_cancel ?? normalizedStatus === 'placed';
          return (
          <div key={order.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-lg shadow-black/10">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div>
                <span className="text-xs uppercase tracking-[0.2em] text-neutral-500 block">Order #{order.id}</span>
                <span className="mt-1 text-sm text-neutral-400 block">{order.date}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge color={getStatusMeta(order.status).color}>{getStatusMeta(order.status).label}</Badge>
                {canTrackOrder && (
                  <>
                    <button onClick={() => onTrackOrder(order)} className="inline-flex items-center gap-1.5 rounded-lg border border-amber-600/40 px-3 py-2 text-sm text-amber-400 hover:border-amber-500 hover:bg-amber-500/10 transition-all">
                      <Bell size={14}/> Track
                    </button>
                    {canCancelOrder && (
                      <button onClick={() => handleCancel(order.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 px-3 py-2 text-sm text-neutral-400 hover:border-red-500 hover:text-red-400 transition-all">
                        <Ban size={14}/> Cancel
                      </button>
                    )}
                  </>
                )}
                {normalizedStatus === 'preparing' && (
                  <span className="text-xs text-amber-300">Preparing in progress, cancellation locked.</span>
                )}
              </div>
            </div>
            <div className="border-t border-neutral-800 pt-4">
              <div className="flex justify-between text-sm text-neutral-500 mb-3">
                <span>Branch</span>
                <span>{order.pickup_branch || order.pickupBranch || 'Thane'}</span>
              </div>
              {order.items.map((item, i) => (
                <div key={`${order.id}-${item.product_name}-${i}`} className="flex justify-between text-sm text-neutral-400 mb-1"><span>{item.quantity} x {item.product_name}</span><span>₹{item.price}</span></div>
              ))}
              <div className="flex justify-between text-white font-bold mt-2 pt-2 border-t border-neutral-800"><span>Total</span><span>₹{order.total}</span></div>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
};

// Legacy compact menu renderer kept for reference and older view wiring.
const Menu = ({ products, addToCart, isOffline, isLoading }) => (
  <div className="min-h-screen pt-24 pb-24 px-6 max-w-7xl mx-auto animate-fade-in">
    <PageIntro
      eyebrow="Menu"
      title="Fresh picks for the commute"
      subtitle="Tap any coffee or snack, add it to your cart, and head in with a pickup order already in progress."
    />
    {isOffline && (
      <div className="mb-8 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
        Running in preview mode with mock data because the backend is offline.
      </div>
    )}
    
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {isLoading ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />) : products.map(product => (
        <div key={product.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 hover:border-amber-600/30 transition-all group flex flex-col shadow-lg shadow-black/10">
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

// Cart page where the user reviews items, removes entries, and selects a branch.
const Cart = ({ cart, checkout, removeFromCart, setView }) => {
  const safeCart = Array.isArray(cart) ? cart : [];
  const [selectedBranch, setSelectedBranch] = useState(PICKUP_BRANCHES[0]);
  if (safeCart.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your cart is empty"
        message="Build your pickup order here, then head out knowing the cafe is already working on it."
        action={<Button onClick={() => setView('menu')}>Go to Menu</Button>}
      />
    );
  }
  const total = safeCart.reduce((acc, item) => acc + (parseFloat(item.product_price) * item.quantity), 0);

  return (
    <div className="min-h-screen pt-28 pb-24 px-6 max-w-7xl mx-auto animate-fade-in">
      <PageIntro
        eyebrow="Cart"
        title="Review your pickup order"
        subtitle="Double-check your items before checkout. Once placed, the order moves straight into the kitchen queue."
      />
      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-4">
          {safeCart.map(item => (
            <div key={item.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex gap-4 items-center group shadow-lg shadow-black/10">
              <div className="w-20 h-20 bg-neutral-800 rounded-xl flex items-center justify-center text-neutral-600"><Coffee/></div>
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
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 h-fit sticky top-24 shadow-lg shadow-black/10">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-4 mb-5">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Pickup branch</p>
            <label className="mt-3 block">
              <span className="sr-only">Select pickup branch</span>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              >
                {PICKUP_BRANCHES.map(branch => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
            </label>
            <div className="mt-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">Selected branch</div>
                <div className="mt-1 text-2xl font-bold text-white">{selectedBranch}</div>
              </div>
              <Badge color="blue">Pickup ready</Badge>
            </div>
            <p className="mt-3 text-sm text-neutral-400">Choose the branch that is closest to your route so your order is waiting when you arrive.</p>
          </div>
          <div className="flex justify-between text-white font-bold text-lg mb-6"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
          <Button onClick={() => checkout(selectedBranch)} className="w-full">Proceed to Pay</Button>
        </div>
      </div>
    </div>
  );
};

// Mock payment step shown after checkout and before the order appears in My Orders.
const PaymentView = ({ paymentOrder, onPay, setView }) => {
  const [method, setMethod] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!paymentOrder) {
    return (
      <EmptyState
        icon={CreditCard}
        title="No payment pending"
        message="Add items to your cart and continue to checkout to open the payment screen."
        action={<Button onClick={() => setView('menu')}>Browse Menu</Button>}
      />
    );
  }

  const total = Number(paymentOrder.total || 0).toFixed(2);
  const methods = [
    { id: 'upi', label: 'UPI', description: 'Fastest mock checkout.' },
    { id: 'card', label: 'Card', description: 'Classic card-style flow.' },
    { id: 'wallet', label: 'Wallet', description: 'Stored balance / wallet.' },
  ];

  const handlePay = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1400));
    await onPay({ ...paymentOrder, paymentMethod: method });
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen pt-24 pb-24 px-6 max-w-6xl mx-auto animate-fade-in">
      <PageIntro
        eyebrow="Payment"
        title="Complete your mock checkout"
        subtitle="Review the amount due, choose a payment method, and confirm to send the order into live tracking."
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6 shadow-lg shadow-black/10">
          <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">Choose a method</div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {methods.map(option => (
              <button
                key={option.id}
                type="button"
                onClick={() => setMethod(option.id)}
                className={`rounded-2xl border px-4 py-4 text-left transition-all ${
                  method === option.id
                    ? 'border-amber-500 bg-amber-500/10 text-white'
                    : 'border-neutral-800 bg-neutral-950/70 text-neutral-300 hover:border-amber-500/40'
                }`}
              >
                <div className="font-semibold">{option.label}</div>
                <div className="mt-1 text-xs text-neutral-500">{option.description}</div>
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-950/60 p-4">
            <div className="flex items-center justify-between text-sm text-neutral-400">
              <span>Branch</span>
              <span>{paymentOrder.pickupBranch}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm text-neutral-400">
              <span>Items</span>
              <span>{paymentOrder.items.length}</span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-neutral-800 pt-3 text-lg font-bold text-white">
              <span>Amount due</span>
              <span>₹{total}</span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6 shadow-lg shadow-black/10">
          <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">Order summary</div>
          <div className="mt-4 space-y-3">
            {paymentOrder.items.map((item, index) => (
              <div key={`${paymentOrder.orderId}-${item.product_name}-${index}`} className="rounded-2xl border border-neutral-800 bg-neutral-950/60 px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-medium text-white">{item.product_name}</div>
                    <div className="text-xs text-neutral-500">Qty {item.quantity}</div>
                  </div>
                  <div className="font-semibold text-amber-400">₹{item.lineTotal.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>

          <Button onClick={handlePay} className="mt-6 w-full" disabled={isProcessing}>
            {isProcessing ? <Loader2 className="animate-spin" /> : <CreditCard size={16} />}
            {isProcessing ? 'Processing payment...' : 'Make Payment'}
          </Button>
          <p className="mt-4 text-sm text-neutral-400">
            You’ll be notified when your order is ready for pickup.
          </p>
        </div>
      </div>
    </div>
  );
};

// Login/register form that talks to the backend JWT auth endpoints.
const Auth = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const passwordHints = [
    "At least 8 characters",
    "Include upper and lower case letters",
    "Include a number or symbol",
  ];
  const passwordRules = [
    { label: "8+ chars", met: password.length >= 8 },
    { label: "Uppercase", met: /[A-Z]/.test(password) },
    { label: "Lowercase", met: /[a-z]/.test(password) },
    { label: "Number/symbol", met: /[0-9\W_]/.test(password) },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = isRegistering ? "/auth/register/" : "/auth/login/";
      const payload = isRegistering
        ? { email, password, username: identifier.trim() || email.trim() }
        : { username: identifier || email, password };
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.status === 401 || res.status === 400) {
        let data = {};
        try { data = await res.json(); } catch { /* Ignore invalid JSON payloads. */ }
        setError(data.detail || data.error || "Invalid credentials or account already exists.");
        setLoading(false); return; 
      }
      
      if (!res.ok) throw new Error("API Failed");
      const data = await res.json();
      
      if (isRegistering) {
        setIsRegistering(false);
        onLogin(data.access, data.refresh, {
          username: data.username || identifier || email,
          email: data.email || email,
          is_staff: !!data.is_staff,
          staff_branch: data.staff_branch || '',
          employee_id: data.employee_id || '',
        });
      } else {
        onLogin(data.access, data.refresh, {
          username: data.username || identifier || email,
          email: data.email || '',
          is_staff: !!data.is_staff,
          staff_branch: data.staff_branch || '',
          employee_id: data.employee_id || '',
        });
      }
    } catch (error) {
      console.warn("Network error or Backend down:", error);
      if (ALLOW_MOCK_AUTH) {
        setTimeout(() => { onLogin("mock-token-123", "mock-refresh-token-123", { username: identifier || email || "Guest User", email: email || "", is_staff: false, staff_branch: "", employee_id: "" }); }, 1000);
      } else {
        setError("Unable to reach the authentication server.");
      }
    } finally { if (!isRegistering) setLoading(false); }
  };

  return (
    <div className="min-h-screen pt-20 px-6 flex items-center justify-center animate-fade-in">
      <div className="w-full max-w-md rounded-[28px] border border-neutral-800 bg-gradient-to-b from-neutral-900 to-neutral-950 p-8 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
            <Coffee size={28} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{isRegistering ? 'Create Account' : 'Welcome Back'}</h1>
          <p className="text-neutral-400 text-sm">{isRegistering ? 'Create an account with your email to get order updates later.' : 'Use your email or username to log in.'}</p>
        </div>

        {error && (
          <div className={`mb-5 rounded-2xl border px-4 py-3 text-sm ${
            error.toLowerCase().includes('created')
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
              : 'border-red-500/20 bg-red-500/10 text-red-300'
          }`}>
            <div className="font-medium mb-1">{error.toLowerCase().includes('created') ? 'Success' : 'Something needs attention'}</div>
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegistering ? (
            <>
              <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" />
              <Input label="Display Name" value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder="optional" />
            </>
          ) : (
            <Input label="Email or Username" value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder="name@example.com" />
          )}
          <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          {isRegistering && (
            <div className="mb-4 rounded-2xl border border-neutral-800 bg-neutral-950/70 p-4 text-xs text-neutral-400">
              <div className="mb-3 font-medium text-neutral-300">Password must:</div>
              <div className="grid grid-cols-2 gap-2">
                {passwordRules.map(rule => (
                  <div
                    key={rule.label}
                    className={`rounded-xl border px-3 py-2 text-[11px] transition-colors ${
                      rule.met ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-neutral-800 bg-neutral-900 text-neutral-500'
                    }`}
                  >
                    {rule.met ? '✓ ' : '• '}{rule.label}
                  </div>
                ))}
              </div>
              <ul className="mt-3 space-y-1 list-disc pl-4 text-neutral-500">
                {passwordHints.map(hint => <li key={hint}>{hint}</li>)}
              </ul>
            </div>
          )}
          <Button type="submit" className="w-full mt-6" disabled={loading}>{loading ? <Loader2 className="animate-spin"/> : (isRegistering ? 'Sign Up' : 'Log In')}</Button>
        </form>
        <div className="mt-6 flex flex-col gap-3 text-center text-sm text-neutral-500">
          <div>
            {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
            <button onClick={() => { setIsRegistering(!isRegistering); setError(""); }} className="text-amber-500 hover:underline font-medium">{isRegistering ? 'Log In' : 'Sign Up'}</button>
          </div>
          <p className="text-[11px] leading-relaxed text-neutral-600">
            We’ll use your email later for order updates and, eventually, SNS notifications.
          </p>
        </div>
      </div>
    </div>
  );
};

// Visual stages used by both the tracking page and the staff dashboard.
const ORDER_STAGES = [
  { key: 'placed',    label: 'Order Placed',     icon: CheckCircle },
  { key: 'preparing', label: 'Preparing',        icon: Coffee },
  { key: 'ready',     label: 'Ready for Pickup', icon: Bell },
  { key: 'completed', label: 'Picked Up',        icon: Package },
];

const stageIndex = (key) => ORDER_STAGES.findIndex(s => s.key === key);

// Animated cup graphic used to visualize brewing progress on tracking screens.
const BrewCup = ({ percent, stage }) => {
  const clamped = Math.max(0, Math.min(100, percent));
  const fillY = 118 - (98 * clamped / 100);
  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg viewBox="0 0 120 140" className="w-full h-full">
        <defs>
          <linearGradient id="coffeeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#92400e" />
          </linearGradient>
          <clipPath id="cupClip">
            <path d="M20,20 L100,20 L91,120 Q60,133 29,120 Z" />
          </clipPath>
        </defs>
        <rect x="10" y={fillY} width="100" height={140 - fillY} fill="url(#coffeeGrad)" clipPath="url(#cupClip)" style={{ transition: 'y 1.2s ease-out' }} />
        <path d="M20,20 L100,20 L91,120 Q60,133 29,120 Z" fill="none" stroke="#57534e" strokeWidth="3.5" />
        <path d="M99,34 Q120,34 120,54 Q120,76 99,76" fill="none" stroke="#57534e" strokeWidth="3.5" />
        <line x1="16" y1="20" x2="104" y2="20" stroke="#78716c" strokeWidth="3.5" strokeLinecap="round" />
        {stage === 'preparing' && (
          <g opacity="0.8">
            <path d="M45,10 Q40,0 45,-8 Q50,-16 45,-24" stroke="#d6d3d1" strokeWidth="2.5" fill="none" strokeLinecap="round" className="steam-1" />
            <path d="M65,10 Q60,0 65,-8 Q70,-16 65,-24" stroke="#d6d3d1" strokeWidth="2.5" fill="none" strokeLinecap="round" className="steam-2" />
          </g>
        )}
      </svg>
      {stage === 'ready' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-emerald-500 rounded-full p-2 shadow-lg shadow-emerald-500/40 animate-bounce-slow">
            <Bell size={20} className="text-white" />
          </div>
        </div>
      )}
    </div>
  );
};

// Horizontal stage indicator that mirrors the order lifecycle.
const Stepper = ({ currentStage, progress = 0 }) => {
  const idx = stageIndex(currentStage);
  return (
    <div className="flex items-center w-full max-w-xl mx-auto">
      {ORDER_STAGES.map((stage, i) => {
        const Icon = stage.icon;
        const done = i < idx;
        const active = i === idx;
        const segmentFill = Math.max(0, Math.min(100, (progress - i * 33.3333) * 3));
        return (
          <React.Fragment key={stage.key}>
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-500 ${
                done ? 'bg-amber-600 border-amber-600 text-white' :
                active ? 'border-amber-500 text-amber-500 bg-amber-500/10' :
                'border-neutral-700 text-neutral-600'
              }`}>
                <Icon size={18} className={active && stage.key !== 'ready' ? 'animate-pulse' : ''} />
              </div>
              <span className={`text-[11px] font-medium text-center leading-tight ${active || done ? 'text-neutral-200' : 'text-neutral-600'}`}>{stage.label}</span>
            </div>
            {i < ORDER_STAGES.length - 1 && (
              <div className="flex-1 h-0.5 mx-1 mb-5 bg-neutral-800 relative overflow-hidden rounded">
                <div
                  className="absolute inset-y-0 left-0 bg-amber-600 transition-all duration-700"
                  style={{ width: `${i < idx ? 100 : Math.max(0, Math.min(100, segmentFill))}%` }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const formatCountdown = (totalSeconds) => {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
};

// Legacy single-order tracking screen kept alongside the newer multi-order view.
const OrderTracking = ({ order, isOffline, onCancel, setView }) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!order) {
    return (
      <EmptyState
        icon={Coffee}
        title="No active order to track"
        message="Place a pickup order first and this screen will become your live status dashboard."
        action={<Button onClick={() => setView('menu')}>Order Something</Button>}
      />
    );
  }

  const etaMs = order.createdAt + order.etaMinutes * 60 * 1000;
  const elapsedMs = now - order.createdAt;
  const totalMs = order.etaMinutes * 60 * 1000;
  const rawPercent = order.status === 'completed' ? 100 : Math.min(100, (elapsedMs / totalMs) * 100);

  // Derive live stage from elapsed time, unless manually completed or cancelled
  let liveStage = order.status;
  if (order.status !== 'completed' && order.status !== 'cancelled') {
    if (rawPercent < 8) liveStage = 'placed';
    else if (rawPercent < 96) liveStage = 'preparing';
    else liveStage = 'ready';
  }

  const secondsLeft = Math.max(0, (etaMs - now) / 1000);
  const canCancel = liveStage === 'placed';

  return (
    <div className="min-h-screen pt-28 pb-24 px-6 max-w-2xl mx-auto animate-fade-in">
      <div className="text-center mb-2">
        <Badge color={getStatusMeta(liveStage).color}>{getStatusMeta(liveStage).label}</Badge>
      </div>
      <p className="text-center text-sm text-neutral-400 mb-4">Your pickup order is moving through the cafe queue and should be ready in about 5 minutes.</p>
      <h1 className="text-3xl font-bold text-white text-center mb-8">
        {liveStage === 'ready' ? "It's ready! Come grab it ☕" :
         liveStage === 'preparing' ? "We're brewing your order" :
         liveStage === 'completed' ? "Order picked up — enjoy!" :
         "We've got your order"}
      </h1>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 mb-8">
        <BrewCup percent={rawPercent} stage={liveStage} />

        <div className="text-center my-6">
          {liveStage === 'ready' ? (
            <Badge color="blue">Ready for pickup at the counter</Badge>
          ) : liveStage === 'completed' ? (
            <Badge color="green">Completed</Badge>
          ) : (
            <div>
              <div className="text-4xl font-bold text-white tabular-nums mb-1">{formatCountdown(secondsLeft)}</div>
              <p className="text-neutral-500 text-sm flex items-center justify-center gap-1.5"><Clock size={14}/> estimated time remaining</p>
            </div>
          )}
        </div>

        <Stepper currentStage={liveStage} />
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 mb-6 shadow-lg shadow-black/10">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Navigation size={16} className="text-amber-500"/> Pickup Details</h3>
        <div className="space-y-2 text-sm text-neutral-400">
          <div className="flex justify-between"><span>Order</span><span className="text-neutral-200">{order.items?.map(i => `${i.quantity}× ${i.product_name}`).join(', ')}</span></div>
          <div className="flex justify-between"><span>Total</span><span className="text-neutral-200 font-medium">₹{order.total}</span></div>
          <div className="flex justify-between"><span>Pickup</span><span className="text-neutral-200">Counter Pickup</span></div>
        </div>
      </div>

      {liveStage === 'placed' && (
        <div className="mb-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-4 text-sm text-amber-100">
          <div className="font-semibold text-amber-200 mb-1">Cancellation window is open</div>
          You can cancel this order only until the staff starts preparing it.
        </div>
      )}

      {liveStage === 'preparing' && (
        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm text-red-100">
          <div className="font-semibold text-red-200 mb-1">Order is now locked</div>
          The cafe has started your order, so cancellation is no longer available.
        </div>
      )}

      {liveStage === 'ready' && (
        <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-100">
          <div className="font-semibold text-emerald-200 mb-1">Ready for pickup</div>
          Your order is waiting at the counter. Staff will mark it complete after pickup.
        </div>
      )}

      <div className="flex gap-3">
        {canCancel && (
          <Button onClick={onCancel} variant="secondary" className="flex-1"><Ban size={18}/> Cancel Order</Button>
        )}
        {liveStage === 'completed' && (
          <Button onClick={() => setView('menu')} className="flex-1">Order Again</Button>
        )}
      </div>
      {isOffline && <p className="text-center text-xs text-neutral-600 mt-6">Preview Mode — timing is simulated locally.</p>}
    </div>
  );
};

// Legacy order history screen kept for comparison with the newer list view.
const Orders = ({ token, isOffline, cancelOrder, onTrackOrder, setView }) => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const fetchOrders = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await apiFetch(`/orders/history/`);
      if (!res.ok) throw new Error("API Failed");
      const data = await res.json();
      if (Array.isArray(data)) setOrders(data);
    } catch {
      if (isOffline) {
        setOrders([{ id: 99, date: "2024-02-20", total: 450, status: 'Ready for pickup', items: [{product_name: "Signature Espresso", quantity: 2, price: 240}] }]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, isOffline]);

  useEffect(() => {
    const timer = setTimeout(() => { fetchOrders(); }, 0);
    return () => clearTimeout(timer);
  }, [fetchOrders]);

  const handleCancel = async (id) => {
    await cancelOrder(id);
    fetchOrders(); // Refresh list after cancel
  };

  return (
    <div className="min-h-screen pt-28 pb-12 px-6 max-w-4xl mx-auto animate-fade-in flex flex-col h-full">
      <PageIntro
        eyebrow="Tracking"
        title="Follow every pickup order"
        subtitle="See what’s placed, preparing, and ready at the counter without digging through the backend."
      />
      <div className="space-y-4 overflow-y-auto flex-1 max-h-[70vh] pr-2 custom-scrollbar">
        {isLoading ? (
          <div className="grid gap-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No orders yet"
            message="Once you place a pickup order, it will appear here with a status badge and tracking summary."
            action={<Button onClick={() => setView('menu')} variant="secondary">Browse Menu</Button>}
          />
        ) : orders.map(order => (
          <div key={order.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-lg shadow-black/10">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div>
                <span className="text-xs uppercase tracking-[0.2em] text-neutral-500 block">Order #{order.id}</span>
                <span className="mt-1 text-sm text-neutral-400 block">{order.date}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge color={getStatusMeta(order.status).color}>{getStatusMeta(order.status).label}</Badge>
                {!FINAL_ORDER_STATUSES.has(normalizeOrderStatus(order.status)) && (
                  <>
                    <button onClick={() => onTrackOrder(order)} className="inline-flex items-center gap-1.5 rounded-lg border border-amber-600/40 px-3 py-2 text-sm text-amber-400 hover:border-amber-500 hover:bg-amber-500/10 transition-all">
                      <Bell size={14}/> Track
                    </button>
                    {(order.can_cancel ?? normalizeOrderStatus(order.status) === 'placed') && (
                      <button onClick={() => handleCancel(order.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 px-3 py-2 text-sm text-neutral-400 hover:border-red-500 hover:text-red-400 transition-all">
                        <Ban size={14}/> Cancel
                      </button>
                    )}
                  </>
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

// Staff-only queue manager for branch employees to move orders through prep stages.
const StaffDashboard = ({ orders, loading, onAction, onRefresh, setView, branch = '' }) => {
  const activeOrders = Array.isArray(orders) ? orders : [];
  const placed = activeOrders.filter(order => normalizeOrderStatus(order.status) === 'placed');
  const preparing = activeOrders.filter(order => normalizeOrderStatus(order.status) === 'preparing');
  const ready = activeOrders.filter(order => normalizeOrderStatus(order.status) === 'ready');

  const Stat = ({ label, value, tone = 'amber' }) => (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
      <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">{label}</div>
      <div className={`mt-2 text-3xl font-bold ${tone === 'amber' ? 'text-amber-400' : tone === 'green' ? 'text-emerald-400' : 'text-blue-400'}`}>{value}</div>
    </div>
  );

  const StageColumn = ({ title, count, emptyLabel, children, tone = 'neutral' }) => (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-950/70 p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">{title}</div>
          <div className={`mt-1 text-2xl font-bold ${tone === 'amber' ? 'text-amber-400' : tone === 'green' ? 'text-emerald-400' : 'text-white'}`}>{count}</div>
        </div>
      </div>
      <div className="space-y-3">
        {count === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/70 p-4 text-sm text-neutral-500">{emptyLabel}</div>
        ) : children}
      </div>
    </div>
  );

  const OrderCard = ({ order }) => {
    const items = Array.isArray(order.items) ? order.items : [];
    const status = normalizeOrderStatus(order.status);
    const canStart = status === 'placed';
    const canReady = status === 'preparing';
    const canComplete = status === 'ready';
    return (
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 shadow-lg shadow-black/10">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">Order #{order.id}</div>
            <div className="mt-1 text-base font-semibold text-white">{order.customer_name || 'Guest'}</div>
            <div className="mt-1 text-xs text-neutral-500">{order.date} · {order.pickup_branch || 'Thane'}</div>
            <div className="mt-2 text-xs text-neutral-400">
              Claimed by: {order.assigned_staff_username || 'unassigned'}
            </div>
          </div>
          <Badge color={getStatusMeta(order.status).color}>{getStatusMeta(order.status).label}</Badge>
        </div>
        <div className="space-y-2 border-t border-neutral-800 pt-3">
          {items.map((item, index) => (
            <div key={`${order.id}-${item.product_name}-${index}`} className="flex justify-between text-sm text-neutral-400">
              <span>{item.quantity} x {item.product_name}</span>
              <span>₹{item.price}</span>
            </div>
          ))}
          <div className="flex justify-between pt-2 text-white font-bold border-t border-neutral-800">
            <span>Total</span>
            <span>₹{order.total}</span>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button disabled={!canStart} onClick={() => onAction(order.id, 'preparing')} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border transition-all ${canStart ? 'border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20' : 'border-neutral-800 bg-neutral-950 text-neutral-600 cursor-not-allowed'}`}>
            <Coffee size={14} />
            Preparing
          </button>
          <button disabled={!canReady} onClick={() => onAction(order.id, 'ready')} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border transition-all ${canReady ? 'border-blue-500/40 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20' : 'border-neutral-800 bg-neutral-950 text-neutral-600 cursor-not-allowed'}`}>
            <Bell size={14} />
            Ready
          </button>
          <button disabled={!canComplete} onClick={() => onAction(order.id, 'complete')} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border transition-all ${canComplete ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20' : 'border-neutral-800 bg-neutral-950 text-neutral-600 cursor-not-allowed'}`}>
            <CheckCircle size={14} />
            Tick
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 max-w-7xl mx-auto animate-fade-in">
      <PageIntro
        eyebrow="Staff only"
        title={`Cafe queue control${branch ? ` · ${branch}` : ''}`}
        subtitle="Update preparation status from the counter, and every change will reflect live on the customer's tracking page."
        actions={[
          <Button key="refresh" onClick={onRefresh} variant="secondary"><Loader2 size={16}/> Refresh queue</Button>,
          <Button key="menu" onClick={() => setView('home')} variant="ghost">Back to site</Button>
        ]}
      />

      {!branch && (
        <div className="mb-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          This account is marked as staff, but no branch is assigned yet. Please add the staff profile in Django admin so orders can be routed correctly.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Stat label="Placed" value={placed.length} tone="amber" />
        <Stat label="Preparing" value={preparing.length} tone="blue" />
        <Stat label="Ready" value={ready.length} tone="green" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <StageColumn title="Placed" count={placed.length} emptyLabel="No new tickets waiting." tone="amber">
          {placed.map(order => <OrderCard key={order.id} order={order} />)}
        </StageColumn>
        <StageColumn title="Preparing" count={preparing.length} emptyLabel="Nothing is currently in prep." tone="blue">
          {preparing.map(order => <OrderCard key={order.id} order={order} />)}
        </StageColumn>
        <StageColumn title="Ready for pickup" count={ready.length} emptyLabel="No ready orders right now." tone="green">
          {ready.map(order => <OrderCard key={order.id} order={order} />)}
        </StageColumn>
      </div>

      {loading && (
        <p className="mt-6 text-sm text-neutral-500">Loading current cafe queue...</p>
      )}
    </div>
  );
};

// Main app shell that owns auth state, cart state, live orders, and view routing.
function App() {
  // Global UI state: controls the active page and all data the shell needs to render.
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

  // Keep the active orders list in localStorage so refreshes do not lose progress.
  useEffect(() => {
    try {
      localStorage.setItem('brewhaven-active-orders', JSON.stringify(activeOrders));
    } catch { /* Ignore storage write failures. */ }
  }, [activeOrders]);

  // Remember which live order is selected when the user switches between tracking cards.
  useEffect(() => {
    try {
      if (selectedOrderId) localStorage.setItem('brewhaven-selected-order-id', String(selectedOrderId));
      else localStorage.removeItem('brewhaven-selected-order-id');
    } catch { /* Ignore storage write failures. */ }
  }, [selectedOrderId]);

  // Store the logged-in user profile so the app can restore the session after refresh.
  useEffect(() => {
    try {
      if (user) localStorage.setItem('brewhaven-user', JSON.stringify(user));
      else localStorage.removeItem('brewhaven-user');
    } catch { /* Ignore storage write failures. */ }
  }, [user]);

  // Staff accounts should immediately land on the staff dashboard instead of the customer flow.
  useEffect(() => {
    if (user?.is_staff && view !== 'staff') {
      setView('staff');
    }
  }, [user, view]);

  // Load products from the API and fall back to mock data when the backend is unavailable.
  useEffect(() => {
    setIsProductLoading(true);
    fetch(`${API_URL}/products/`)
      .then(res => { if (!res.ok) throw new Error("API Failed"); return res.json(); })
      .then(data => { if (Array.isArray(data)) { setProducts(data); setIsOffline(false); } else { throw new Error("Invalid Data"); } })
      .catch(err => { console.warn("Backend not detected. Switching to Mock Mode.", err); setProducts(MOCK_PRODUCTS); setIsOffline(true); })
      .finally(() => setIsProductLoading(false));
  }, []);

  // Refresh the cart when a token exists and the app is online.
  useEffect(() => { if (token && !isOffline) fetchCart(); }, [token, isOffline, fetchCart]);

  // Fetch the branch queue for staff users so the staff dashboard shows live tickets.
  const fetchStaffOrders = useCallback(async () => {
    if (!token || !user?.is_staff) return;
    setIsStaffLoading(true);
    try {
      const res = await apiFetch('/orders/staff/orders/');
      if (!res.ok) throw new Error("Failed to fetch staff queue");
      const data = await res.json();
      if (Array.isArray(data)) setStaffOrders(data);
    } catch (error) {
      console.warn("Staff queue fetch failed", error);
    } finally {
      setIsStaffLoading(false);
    }
  }, [token, user?.is_staff]);

  // Poll the staff queue while the staff dashboard is open.
  useEffect(() => {
    if (view !== 'staff' || !user?.is_staff) return;
    fetchStaffOrders();
    const timer = setInterval(fetchStaffOrders, 5000);
    return () => clearInterval(timer);
  }, [view, user?.is_staff, fetchStaffOrders]);

  // Clear everything when logout happens from any tab or browser hook.
  useEffect(() => {
    const handleAuthLogout = () => {
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
    };
    window.addEventListener('brewhaven-auth-logout', handleAuthLogout);
    return () => window.removeEventListener('brewhaven-auth-logout', handleAuthLogout);
  }, []);

  // Poll backend for real order status when we have an active, non-final order and are online.
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
      } catch {
        // Silently rely on local time-based simulation.
      }
    }, 6000);

    return () => clearInterval(pollRef.current);
  }, [selectedLiveOrder, isOffline, token]);

  // Reset the full session and return to the home screen on logout.
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

  // Read the cart from the backend and keep the UI state in sync.
  function fetchCart() {
    apiFetch(`/orders/cart/`)
      .then(async res => {
        if (res.status === 401) { handleLogout(); return []; }
        if (!res.ok) throw new Error("Failed to fetch cart");
        return res.json();
      })
      .then(data => { if (Array.isArray(data)) setCart(data); })
      .catch(console.error);
  }

  // Store auth tokens and a normalized user profile after login succeeds.
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

  // Add items to cart using the backend when online, or mock state when offline.
  const addToCart = async (productOrId, quantity = 1) => {
    if (!token) return setView('login');
    const product = typeof productOrId === 'object' ? productOrId : products.find(p => p.id === productOrId);
    if (!product) {
      alert("That item is no longer available.");
      return;
    }
    
    if (isOffline) {
      setCart(prev => {
        const safePrev = Array.isArray(prev) ? prev : [];
        const existing = safePrev.find(p => p.id === product.id);
        if (existing) { return safePrev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + quantity } : p); }
        return [...safePrev, { ...product, product_name: product.name, product_price: product.price, quantity }];
      });
      alert("Added to cart (Mock Mode)");
      return;
    }

    try {
      const res = await apiFetch(`/orders/cart/add/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: product.id, quantity })
      });
      if (res.ok) { fetchCart(); alert("Added to cart!"); }
    } catch {
      alert("Failed to add to cart");
    }
  };

  // Remove a cart row by its database id.
  const removeFromCart = async (itemId) => {
    if (isOffline) {
      setCart(prev => prev.filter(item => item.id !== itemId));
      return;
    }
    
    try {
      const res = await apiFetch(`/orders/cart/remove/${itemId}/`, {
        method: 'DELETE',
        headers: {}
      });
      if (res.ok) fetchCart();
    } catch (error) { console.error("Remove failed", error); }
  };

  // Cancel an order while it is still allowed by backend status rules.
  const cancelOrder = async (orderId) => {
    if (isOffline) {
      setActiveOrders(prev => prev.map(order => String(order.id) === String(orderId) ? { ...order, status: 'cancelled' } : order));
      return;
    }
    
    try {
      const res = await apiFetch(`/orders/cancel/${orderId}/`, {
        method: 'POST',
        headers: {}
      });
      if (res.ok) {
        setActiveOrders(prev => prev.map(order => String(order.id) === String(orderId) ? { ...order, status: 'cancelled' } : order));
      } else {
        alert("Could not cancel order");
      }
    } catch (error) { console.error("Cancel failed", error); }
  };

  // Small wrapper used by the tracking page cancel button.
  const cancelActiveOrder = (orderId = selectedLiveOrder?.id) => orderId && cancelOrder(orderId);

  // Send staff actions to the branch-aware backend workflow.
  const handleStaffAction = async (orderId, action) => {
    if (!orderId || !user?.is_staff) return;

    if (isOffline) {
      setStaffOrders(prev => {
        return prev
          .map(order => String(order.id) === String(orderId)
            ? { ...order, status: action === 'complete' ? 'Delivered' : action === 'ready' ? 'Ready for pickup' : 'Preparing' }
            : order)
          .filter(order => action !== 'complete' || String(order.id) !== String(orderId));
      });
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

      const normalized = normalizeLiveOrder({
        ...data,
        status: data.status
      });

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

  // Re-open an existing order in live tracking mode from order history.
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

  // Finalize the mock payment, add the order to live tracking, and move to My Orders.
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

  // Lazy-load the Razorpay checkout script before opening the payment modal.
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Create the order, request Razorpay checkout data, and move the user into tracking.
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
      // 1. Create Order
      const res = await apiFetch(`/orders/create/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fulfillment_type: 'pickup', pickup_branch: pickupBranch })
      });
      const data = await res.json();
      
      if (!res.ok) { alert(data.error || "Order failed"); return; }
      setPendingPayment(paymentOrder(data.order_id));
      setCart([]);
      setView('payment');
      return;
    } catch (error) {
      console.error(error);
      alert("Checkout Error. Please try again.");
    }
  };

  // Decide which page component to render for the current app view.
  const renderView = () => {
    switch(view) {
      case 'home': return <Home setView={setView} user={user} activeOrder={selectedLiveOrder} />;
      case 'menu': return <MenuView products={products} addToCart={addToCart} isOffline={isOffline} isLoading={isProductLoading} />;
      case 'cart': return <Cart cart={cart} checkout={handleCheckout} removeFromCart={removeFromCart} setView={setView} />;
      case 'payment': return <PaymentView paymentOrder={pendingPayment} onPay={completePendingPayment} setView={setView} />;
      case 'login': return <Auth setView={setView} onLogin={handleLogin} />;
      case 'orders': return <OrdersView token={token} isOffline={isOffline} cancelOrder={cancelOrder} onTrackOrder={trackExistingOrder} liveOrders={liveOrders} setView={setView} selectedOrderId={selectedOrderId} />;
      case 'track': return <OrderTrackingView orders={activeOrders} selectedOrderId={selectedOrderId} isOffline={isOffline} onCancel={cancelActiveOrder} onSelectOrder={setSelectedOrderId} setView={setView} />;
      case 'staff': return user?.is_staff ? <StaffDashboard orders={staffOrders} loading={isStaffLoading} onAction={handleStaffAction} onRefresh={fetchStaffOrders} setView={setView} branch={user?.staff_branch || ''} /> : <Home setView={setView} user={user} activeOrder={selectedLiveOrder} />;
      default: return <Home setView={setView} user={user} activeOrder={selectedLiveOrder} />;
    }
  };

  const safeCartCount = Array.isArray(cart) ? cart.reduce((a,c) => a + c.quantity, 0) : 0;
  const trackableOrder = selectedLiveOrder;

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-amber-500/30">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
        body { font-family: 'Outfit', sans-serif; }
        .animate-fade-in { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .steam-1 { animation: steamRise 2.2s ease-in-out infinite; transform-origin: bottom; }
        .steam-2 { animation: steamRise 2.2s ease-in-out infinite 0.6s; transform-origin: bottom; }
        @keyframes steamRise { 0% { opacity: 0; transform: translateY(6px) scaleY(0.8); } 40% { opacity: 0.9; } 100% { opacity: 0; transform: translateY(-8px) scaleY(1.1); } }
        .animate-bounce-slow { animation: bounceSlow 1.4s ease-in-out infinite; }
        @keyframes bounceSlow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        .tabular-nums { font-variant-numeric: tabular-nums; }
      `}</style>
      <Navbar view={view} setView={setView} cartCount={safeCartCount} user={user} onLogout={handleLogout} activeOrder={trackableOrder} />
      <main>{renderView()}</main>
      <Footer />
    </div>
  );
}

export default App;
