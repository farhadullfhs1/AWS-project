import React, { useState } from 'react';
import { Coffee, ShoppingBag, Trash2 } from 'lucide-react';
import { Button, Badge, PageIntro, EmptyState } from '../components/ui';
import { PICKUP_BRANCHES } from '../lib/brewhaven';

export default function Cart({ cart, checkout, removeFromCart, setView }) {
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
}

