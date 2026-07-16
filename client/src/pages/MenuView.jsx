import React, { useEffect, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { Button, Badge, PageIntro, SkeletonCard } from '../components/ui';
import { MENU_CATEGORY_ORDER } from '../lib/brewhaven';

export default function MenuView({ products, addToCart, isOffline, isLoading }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const productList = Array.isArray(products) ? products : [];
  const [quantities, setQuantities] = useState({});
  const availableCategories = [
    'All',
    ...MENU_CATEGORY_ORDER.filter(category => category !== 'All' && productList.some(product => product.category === category)),
    ...Array.from(new Set(productList.map(product => product.category).filter(Boolean))).filter(category => !MENU_CATEGORY_ORDER.includes(category)),
  ];
  const safeSelectedCategory = availableCategories.includes(selectedCategory) ? selectedCategory : 'All';
  const filteredProducts = safeSelectedCategory === 'All' ? productList : productList.filter(product => product.category === safeSelectedCategory);

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
    setQuantities(prev => ({ ...prev, [productId]: Math.max(1, (prev[productId] || 1) + delta) }));
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
            <button key={category} onClick={() => setSelectedCategory(category)} className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${active ? 'border-amber-500 bg-amber-500 text-neutral-950' : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-amber-500/40 hover:text-white'}`}>
              {category}
            </button>
          );
        })}
      </div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="text-sm text-neutral-500">{filteredProducts.length} item{filteredProducts.length === 1 ? '' : 's'} in this section</p>
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
}

