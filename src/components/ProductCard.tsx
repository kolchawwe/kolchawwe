/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { ShoppingCart, Flame, ShieldAlert, BadgeCheck, AlertTriangle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const formatCLP = (value: number): string => {
  return `$${value.toLocaleString('es-CL')}`;
};

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, cart } = useStore();
  const [added, setAdded] = useState(false);

  // Find quantity in current cart to see if we reached stock limit
  const cartItem = cart.find((item) => item.product.id === product.id);
  const cartQty = cartItem ? cartItem.quantity : 0;
  const remainingStock = product.stock - cartQty;

  const handleAdd = () => {
    if (remainingStock > 0) {
      addToCart(product, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 1200);
    }
  };

  // Category badge styles
  const categoryColors = {
    IPA: 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20',
    Stout: 'bg-zinc-900/60 text-stone-300 border-zinc-800',
    Lager: 'bg-gold-500/10 text-gold-400 border-gold-500/20',
    Amber: 'bg-red-950/40 text-red-400 border-red-500/25',
    Belgian: 'bg-purple-950/40 text-purple-400 border-purple-500/20',
  };

  return (
    <div
      id={`product-card-${product.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-zinc-950/80 border border-zinc-900 hover:border-gold-500/20 transition-all duration-300 hover:shadow-2xl hover:shadow-gold-500/5 hover:-translate-y-1"
    >
      {/* Product Image Panel */}
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-950">
        <img
          src={product.image}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
        {/* Overlay Darkner */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/10 to-transparent" />

        {/* Category & Vol Labels */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border tracking-wide uppercase ${
              categoryColors[product.category] || categoryColors.Lager
            }`}
          >
            {product.category}
          </span>
          <span className="px-2.5 py-1 text-[11px] font-mono font-medium rounded-lg bg-zinc-950/90 text-zinc-300 border border-zinc-800">
            {product.volume}
          </span>
        </div>

        {/* ABV & IBU metrics on bottom right */}
        <div className="absolute bottom-3 right-3 flex gap-2.5 bg-zinc-950/90 backdrop-blur-sm border border-zinc-850 rounded-lg px-2.5 py-1.5 text-[11px] font-mono">
          <div className="text-zinc-400">
            Alc: <span className="text-gold-400 font-bold">{product.abv}%</span>
          </div>
          <div className="w-px bg-zinc-800 h-3.5 my-auto" />
          <div className="text-zinc-400">
            IBU: <span className="text-gold-400 font-bold">{product.ibu}</span>
          </div>
        </div>
      </div>

      {/* Body details */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex-1">
          <h3 className="text-lg font-bold font-serif text-zinc-100 group-hover:text-gold-400 transition-colors duration-300">
            {product.name}
          </h3>
          <p className="mt-1 text-xs text-gold-500/80 font-medium italic font-serif">
            {product.tagline}
          </p>
          <p className="mt-3 text-sm text-zinc-400 line-clamp-3 leading-relaxed font-light">
            {product.description}
          </p>
        </div>

        {/* Stock warnings */}
        <div className="mt-4 flex items-center justify-between min-h-[24px]">
          {product.stock <= 0 ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertTriangle className="w-3.5 h-3.5" /> Sin Stock
            </span>
          ) : remainingStock <= 0 ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-gold-500/10 text-gold-400 border border-gold-500/20">
              <ShieldAlert className="w-3.5 h-3.5" /> Límite de stock en carro
            </span>
          ) : product.stock < 15 ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/10 text-rose-400">
              ¡Solo {product.stock} unidades!
            </span>
          ) : (
            <span className="text-[11px] text-zinc-500 font-mono">
              Stock disp: {product.stock} un.
            </span>
          )}

          {cartQty > 0 && (
            <span className="text-xs bg-zinc-900 text-zinc-300 font-medium px-2 py-0.5 rounded border border-zinc-800">
              {cartQty} en carro
            </span>
          )}
        </div>

        {/* Pricing tag & Action container */}
        <div className="mt-5 pt-4 border-t border-zinc-900/60 flex items-center justify-between">
          <div>
            <span className="block text-[10px] uppercase font-mono tracking-widest text-zinc-500">
              Costo de Selección
            </span>
            <span className="text-xl font-bold font-serif text-zinc-100">
              {formatCLP(product.price)}
            </span>
          </div>

          <button
            onClick={handleAdd}
            disabled={remainingStock <= 0}
            className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
              remainingStock <= 0
                ? 'bg-zinc-900 text-zinc-500 cursor-not-allowed border border-zinc-800'
                : added
                ? 'bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/20 font-bold scale-[0.98]'
                : 'bg-gradient-to-r from-gold-400 to-gold-600 hover:from-gold-300 hover:to-gold-500 text-zinc-950 active:scale-95 shadow-md shadow-gold-500/10'
            }`}
          >
            {added ? (
              <>
                <BadgeCheck className="w-4 h-4 text-zinc-950" />
                Agregado
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 text-zinc-950" />
                Comprar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
