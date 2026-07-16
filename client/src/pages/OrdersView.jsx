import React, { useCallback, useEffect, useState } from 'react';
import { Bell, Ban } from 'lucide-react';
import { apiFetch } from '../services/api';
import { Button, Badge, PageIntro, SkeletonCard, EmptyState } from '../components/ui';
import { FINAL_ORDER_STATUSES, getStatusMeta, normalizeOrderStatus } from '../lib/brewhaven';

export default function OrdersView({ token, isOffline, cancelOrder, onTrackOrder, liveOrders, setView, selectedOrderId }) {
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
                className={`rounded-full border px-3 py-2 text-sm transition-all ${String(selectedOrderId) === String(order.id) ? 'border-amber-500 bg-amber-500 text-neutral-950' : 'border-neutral-700 bg-neutral-950 text-neutral-300 hover:border-amber-500/40'}`}
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
            icon={Bell}
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
}

