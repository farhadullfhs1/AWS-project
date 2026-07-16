export const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
export const ALLOW_MOCK_AUTH = import.meta.env.VITE_ALLOW_MOCK_AUTH === 'true';

export const MOCK_PRODUCTS = [
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

export const MENU_CATEGORY_ORDER = ["All", "Hot Coffee", "Cold Coffee", "Tea", "Bakery", "Breakfast"];
export const PICKUP_BRANCHES = ["Thane", "Mulund", "Bandra", "Kurla", "Dadar"];
export const LIVE_ORDER_STATUSES = new Set(['placed', 'processing', 'preparing', 'ready']);
export const FINAL_ORDER_STATUSES = new Set(['completed', 'cancelled']);

export const STATUS_META = {
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

export const getStatusMeta = (status) => STATUS_META[status] || STATUS_META.processing;

export const normalizeOrderStatus = (status, fallback = 'placed') => {
  const raw = (status || fallback).toString().toLowerCase();
  if (raw.includes('cancel')) return 'cancelled';
  if (raw.includes('complete') || raw.includes('deliver')) return 'completed';
  if (raw.includes('ready')) return 'ready';
  if (raw.includes('prep')) return 'preparing';
  if (raw.includes('process') || raw.includes('place')) return 'placed';
  return raw;
};

export const normalizeLiveOrder = (order, fallbackStatus = 'placed') => {
  if (!order) return null;
  const status = normalizeOrderStatus(order.status, fallbackStatus);
  return {
    id: order.id,
    createdAt: order.createdAt || order.created_at || Date.now(),
    etaMinutes: order.etaMinutes || order.pickup_eta_minutes || 5,
    status,
    pickupBranch: order.pickupBranch || order.pickup_branch || '',
    items: Array.isArray(order.items) ? order.items : [],
    total: order.total ?? 0,
    can_cancel: order.can_cancel,
  };
};

export const isLiveOrder = (order) => !!order && !FINAL_ORDER_STATUSES.has(normalizeOrderStatus(order.status));

export const readStoredUser = () => {
  try {
    const raw = localStorage.getItem('brewhaven-user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const ORDER_STAGES = [
  { key: 'placed', label: 'Order Placed', icon: 'Coffee' },
  { key: 'preparing', label: 'Preparing', icon: 'Coffee' },
  { key: 'ready', label: 'Ready for Pickup', icon: 'Bell' },
  { key: 'completed', label: 'Picked Up', icon: 'CheckCircle' },
];

