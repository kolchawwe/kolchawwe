/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useStore } from '../context/StoreContext';
import { formatCLP } from './ProductCard';
import { X, Trash2, Plus, Minus, Truck, ShoppingBag, ArrowRight } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onCheckout }) => {
  const { cart, updateCartQuantity, removeFromCart, clearCart, shippingConfig } = useStore();

  if (!isOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const freeThreshold = shippingConfig.freeShippingThreshold;
  const isFreeShipping = subtotal >= freeThreshold;
  const shippingCost = isFreeShipping ? 0 : shippingConfig.basePrice;
  const remainingForFree = Math.max(0, freeThreshold - subtotal);
  const progressPercent = Math.min(100, (subtotal / freeThreshold) * 100);

  const handleCheckoutClick = () => {
    onClose();
    onCheckout();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" id="cart-drawer-container">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        id="cart-drawer-backdrop"
      />

      <div className="absolute inset-y-0 right-0 pl-10 max-w-full flex" id="cart-drawer-wrapper">
        <div className="w-screen max-w-md bg-zinc-900 border-l border-zinc-800 flex flex-col shadow-2xl relative">
          
          {/* Header Panel */}
          <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-gold-400" />
              <h2 className="text-xl font-bold font-serif text-zinc-100">Mi Carrito</h2>
              <span className="text-xs font-mono font-bold bg-gold-500/10 text-gold-450 px-2.5 py-0.5 rounded-full border border-gold-500/20 animate-pulse">
                {cart.length}
              </span>
            </div>
            
            <button
              onClick={onClose}
              id="close-drawer-btn"
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Core Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Free shipping banner / progress */}
            {cart.length > 0 && (
              <div className="bg-zinc-950 p-4 rounded-xl border border-gold-500/10" id="shipping-progress-banner">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isFreeShipping ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gold-500/10 text-gold-400'}`}>
                    <Truck className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-sm font-sans">
                    {isFreeShipping ? (
                      <p className="font-bold text-emerald-400">
                        ¡Tu despacho es gratis!
                      </p>
                    ) : (
                      <p className="text-zinc-350">
                        Agrega <span className="font-bold text-gold-400">{formatCLP(remainingForFree)}</span> más para envío <span className="font-bold text-emerald-400">Gratis</span>.
                      </p>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3 w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      isFreeShipping ? 'bg-emerald-500' : 'bg-gradient-to-r from-gold-500 to-gold-400'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Cart list */}
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12" id="cart-drawer-empty">
                <div className="p-4 bg-zinc-950 rounded-full border border-zinc-800">
                  <ShoppingBag className="w-12 h-12 text-zinc-700" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-300 font-serif">Tu carrito está vacío</h3>
                  <p className="text-sm text-zinc-500 mt-1 max-w-xs mx-auto">
                    ¿Qué tal una refrescante Valdivian Fog IPA o una cremosa Stout Oats? Explora nuestro catálogo.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-gradient-to-r from-gold-400 to-gold-600 hover:from-gold-300 hover:to-gold-500 text-zinc-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-gold-500/10"
                >
                  Explorar Tienda
                </button>
              </div>
            ) : (
              <div className="space-y-4" id="cart-items-list">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    id={`cart-item-${item.product.id}`}
                    className="flex gap-4 p-3 bg-zinc-950/40 rounded-xl border border-zinc-900 hover:border-gold-500/15 transition duration-300"
                  >
                    {/* Thumbnail */}
                    <div className="h-18 w-24 shrink-0 overflow-hidden rounded-lg bg-zinc-950 border border-zinc-800 relative">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                    </div>

                    {/* Meta */}
                    <div className="flex-1 flex flex-col min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-bold text-sm font-serif text-zinc-100 truncate">
                          {item.product.name}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1 text-zinc-600 hover:text-rose-400 rounded-md transition-colors cursor-pointer"
                          aria-label="Quitar producto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <span className="text-xs text-zinc-500 font-mono">
                        {item.product.volume} • Unit: {formatCLP(item.product.price)}
                      </span>

                      {/* Controls and final multiplication */}
                      <div className="mt-auto pt-2 flex items-center justify-between">
                        {/* Selector */}
                        <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-mono font-bold text-zinc-200">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
                            disabled={item.quantity >= item.product.stock}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Subtotal */}
                        <span className="text-sm font-bold text-gold-400 font-serif">
                          {formatCLP(item.product.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Panel */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-zinc-800 bg-zinc-950/70 space-y-4" id="cart-drawer-footer">
              <div className="space-y-2 font-sans text-xs">
                <div className="flex justify-between text-zinc-450">
                  <span>Subtotal selección</span>
                  <span className="font-mono text-zinc-200">{formatCLP(subtotal)}</span>
                </div>
                <div className="flex justify-between text-zinc-455">
                  <span>Costo entrega</span>
                  <span className={`font-mono ${isFreeShipping ? 'text-emerald-400 font-bold' : 'text-zinc-200'}`}>
                    {isFreeShipping ? 'Gratis' : formatCLP(shippingCost)}
                  </span>
                </div>
                <div className="pt-2.5 border-t border-zinc-800/80 flex justify-between text-lg font-bold">
                  <span className="text-zinc-100 font-serif">Total de Clics</span>
                  <span className="text-gold-400 font-serif">{formatCLP(subtotal + shippingCost)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={clearCart}
                  className="py-3 px-4 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 rounded-xl text-xs font-semibold text-zinc-450 hover:text-zinc-200 transition-all cursor-pointer"
                >
                  Vaciar Carro
                </button>
                <button
                  onClick={handleCheckoutClick}
                  className="py-3 px-4 bg-gradient-to-r from-gold-400 to-gold-600 hover:from-gold-300 hover:to-gold-500 text-zinc-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-gold-500/15 cursor-pointer"
                >
                  Pagar Pedido
                  <ArrowRight className="w-4 h-4 text-zinc-950" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
