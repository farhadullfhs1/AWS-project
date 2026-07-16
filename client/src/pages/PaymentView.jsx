import React, { useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';
import { Button, PageIntro, EmptyState } from '../components/ui';

export default function PaymentView({ paymentOrder, onPay, setView }) {
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
}

