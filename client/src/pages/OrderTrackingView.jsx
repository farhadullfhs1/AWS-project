import React, { useEffect, useState } from 'react';
import { Bell, Ban, Clock, Navigation, Package, ArrowLeft } from 'lucide-react';
import BrewCup from '../components/BrewCup';
import Stepper from '../components/Stepper';
import { Button, Badge, EmptyState, PageIntro } from '../components/ui';
import { normalizeOrderStatus, isLiveOrder } from '../lib/brewhaven';

export default function OrderTrackingView({ orders, selectedOrderId, isOffline, onCancel, onSelectOrder, setView }) {
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
  const rawPercent = liveStage === 'completed'
    ? 100
    : liveStage === 'ready'
      ? 100
      : liveStage === 'preparing'
        ? Math.min(82, 35 + (elapsedSeconds / etaSeconds) * 28)
        : Math.min(32, Math.max(8, (elapsedSeconds / etaSeconds) * 32));
  const currentItems = Array.isArray(selectedOrder.items) ? selectedOrder.items : [];
  const pickupBranch = selectedOrder.pickupBranch || selectedOrder.pickup_branch || 'Thane';

  return (
    <div className="min-h-screen pt-28 pb-12 px-6 max-w-4xl mx-auto animate-fade-in">
      
      {/* --- BACK BUTTON ADDED HERE --- */}
      <button 
        onClick={() => setView('orders')} 
        className="mb-8 flex items-center gap-3 text-neutral-400 hover:text-amber-500 transition-colors group w-fit"
      >
        <div className="p-2 rounded-full bg-neutral-900 border border-neutral-800 group-hover:border-amber-500/50 transition-colors">
          <ArrowLeft size={18} />
        </div>
        <span className="text-sm font-medium">Back to Orders</span>
      </button>

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
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${String(selectedOrderId) === String(order.id) ? 'border-amber-500 bg-amber-500 text-neutral-950' : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-amber-500/40 hover:text-white'}`}
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
        <BrewCup percent={rawPercent} stage={liveStage} />
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
        {liveStage === 'placed' && (
          <Button onClick={() => onCancel(selectedOrder.id)} variant="secondary" className="flex-1"><Ban size={18}/> Cancel Order</Button>
        )}
        {liveStage === 'completed' && (
          <Button onClick={() => setView('menu')} className="flex-1">Order Again</Button>
        )}
      </div>

      {isOffline && <p className="mt-6 text-center text-xs text-neutral-600">Preview Mode - timing is simulated locally.</p>}
    </div>
  );
}