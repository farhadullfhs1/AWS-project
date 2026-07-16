import React from 'react';
import { Button } from '../components/ui';

export default function Home({ setView, activeOrder, user }) {
  return (
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
              Order #{activeOrder.id} is on the way - tap to track
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
}

