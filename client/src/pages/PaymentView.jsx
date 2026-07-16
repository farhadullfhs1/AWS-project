import React, { useState } from 'react';
import { CreditCard, Loader2, Smartphone } from 'lucide-react';
import { Button, PageIntro, EmptyState } from '../components/ui';

export default function PaymentView({ paymentOrder, onPay, setView }) {
  const [method, setMethod] = useState('upi');
  const [upiId, setUpiId] = useState(''); // New state for the UPI ID
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
    { id: 'upi', label: 'UPI', description: 'Fast and secure checkout.' },
  ];

  // Basic validation: user must type at least something resembling an ID
  const isPaymentValid = upiId.trim().length > 3;

  const handlePay = async () => {
    if (!isPaymentValid) return;
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1400));
    // We can pass the upiId to the backend if needed in the future
    await onPay({ ...paymentOrder, paymentMethod: method, upiId: upiId });
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen pt-24 pb-24 px-6 max-w-6xl mx-auto animate-fade-in">
      <PageIntro
        eyebrow="Payment"
        title="Complete your mock checkout"
        subtitle="Review the amount due, enter your UPI ID, and confirm to send the order into live tracking."
      />
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6 shadow-lg shadow-black/10">
          <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">Selected Method</div>
          
          <div className="mt-4 grid gap-3">
            {methods.map(option => (
              <div key={option.id} className="space-y-3">
                <button
                  type="button"
                  onClick={() => setMethod(option.id)}
                  className={`w-full rounded-2xl border px-4 py-4 text-left transition-all ${
                    method === option.id
                      ? 'border-amber-500 bg-amber-500/10 text-white'
                      : 'border-neutral-800 bg-neutral-950/70 text-neutral-300 hover:border-amber-500/40'
                  }`}
                >
                  <div className="font-semibold">{option.label}</div>
                  <div className="mt-1 text-xs text-neutral-500">{option.description}</div>
                </button>

                {/* The UPI Input Field */}
                {method === 'upi' && (
                  <div className="animate-fade-in space-y-2 pt-2">
                    <label htmlFor="upi-id" className="text-sm font-medium text-neutral-300 ml-1">
                      Enter UPI ID
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Smartphone size={18} className="text-neutral-500" />
                      </div>
                      <input
                        type="text"
                        id="upi-id"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="e.g. username@okhdfcbank"
                        className="w-full bg-neutral-950/80 border border-neutral-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-950/60 p-4">
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
          <Button 
            onClick={handlePay} 
            className="mt-6 w-full transition-all" 
            disabled={isProcessing || !isPaymentValid}
          >
            {isProcessing ? <Loader2 className="animate-spin" /> : <CreditCard size={16} />}
            {isProcessing ? 'Processing payment...' : 'Make Payment'}
          </Button>
          {!isPaymentValid && (
             <p className="mt-2 text-center text-xs text-amber-500/80">
               Please enter a valid UPI ID to continue.
             </p>
          )}
          <p className="mt-4 text-sm text-neutral-400">
            You’ll be notified when your order is ready for pickup.
          </p>
        </div>
      </div>
    </div>
  );
}