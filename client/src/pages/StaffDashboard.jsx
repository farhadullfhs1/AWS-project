import React from 'react';
import { Bell, CheckCircle, Coffee, Loader2 } from 'lucide-react';
import { Button, Badge, PageIntro } from '../components/ui';
import { getStatusMeta, normalizeOrderStatus } from '../lib/brewhaven';

export default function StaffDashboard({ orders, loading, onAction, onRefresh, setView, branch = '' }) {
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
            <div className="mt-2 text-xs text-neutral-400">Claimed by: {order.assigned_staff_username || 'unassigned'}</div>
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
    <div className="min-h-screen pt-24 pb-19 px-6 max-w-7xl mx-auto animate-fade-in">
      <PageIntro
        eyebrow="Staff only"
        title={`Cafe queue control${branch ? ` · ${branch}` : ''}`}
        subtitle="Update preparation status from the counter, and every change will reflect live on the customer's tracking page."
        actions={[
          <Button key="refresh" onClick={onRefresh} variant="secondary"><Loader2 size={16}/> Refresh queue</Button>,
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

      {loading && <p className="mt-6 text-sm text-neutral-500">Loading current cafe queue...</p>}
    </div>
  );
}

