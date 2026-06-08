/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Beer, ShoppingCart, ShieldAlert, Sliders } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface HeaderProps {
  currentView: 'shop' | 'admin';
  setView: (view: 'shop' | 'admin') => void;
  toggleCart: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, setView, toggleCart }) => {
  const { cart, products } = useStore();
  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Check if any product is critically low on stock (< 10) to alert admin badge
  const lowStockProducts = products.filter(p => p.stock < 10);

  return (
    <header className="sticky top-0 z-40 w-full bg-zinc-950/80 backdrop-blur-xl border-b border-gold-500/15 text-zinc-100" id="main-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo and brand */}
        <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => setView('shop')} id="logo-branding">
          <div className="p-2.5 bg-gradient-to-br from-gold-400 to-gold-600 text-zinc-950 rounded-lg shadow-xl shadow-gold-500/10 border border-gold-400/20">
            <Beer className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight font-serif bg-gradient-to-r from-gold-400 via-yellow-200 to-gold-600 bg-clip-text text-transparent">
              Cervecería Valdiviana
            </span>
            <span className="block text-[9px] uppercase tracking-[0.25em] text-gold-400/80 font-bold font-sans">
              Colección Suprema
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex space-x-1.5 bg-zinc-900/60 p-1 rounded-xl border border-zinc-800/80" id="desktop-nav">
          <button
            id="nav-btn-shop"
            onClick={() => setView('shop')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              currentView === 'shop'
                ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-zinc-950 shadow-md font-semibold scale-[1.02]'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40'
            }`}
          >
            Tienda de Cavas
          </button>
          <button
            id="nav-btn-admin"
            onClick={() => setView('admin')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
              currentView === 'admin'
                ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-zinc-950 shadow-md font-semibold scale-[1.02]'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40'
            }`}
          >
            <Sliders className="w-4 h-4" />
            Administración
            {lowStockProducts.length > 0 && (
              <span className="inline-flex w-2 h-2 rounded-full bg-rose-500 shadow-lg shadow-rose-500/50" />
            )}
          </button>
        </nav>

        {/* Actions (Cart & Admin toggle for mobile) */}
        <div className="flex items-center gap-3" id="header-actions">
          {/* Cart Badge Button */}
          <button
            id="cart-toggle-btn"
            onClick={toggleCart}
            className="relative p-3 bg-zinc-900/90 hover:bg-zinc-800/90 hover:border-gold-500/40 border border-zinc-800 text-zinc-400 hover:text-gold-400 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gold-500 cursor-pointer"
            aria-label="Abrir carrito"
          >
            <ShoppingCart className="w-5 h-5" />
            {totalCartItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-[20px] px-1.5 items-center justify-center rounded-full bg-gradient-to-r from-gold-400 to-gold-500 text-[10px] font-bold text-zinc-950 border border-zinc-950 shadow-lg font-sans">
                {totalCartItems}
              </span>
            )}
          </button>

          {/* Mobile administration quick toggle */}
          <button
            id="mobile-nav-btn-admin"
            onClick={() => setView(currentView === 'shop' ? 'admin' : 'shop')}
            className={`md:hidden px-3.5 py-2.5 rounded-xl border transition-all duration-300 text-sm font-medium flex items-center gap-1.5 ${
              currentView === 'admin'
                ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-zinc-950 border-gold-500 font-semibold'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800/80'
            }`}
          >
            <Sliders className="w-4.5 h-4.5" />
            <span className="sr-only">Admin</span>
          </button>
        </div>
      </div>
    </header>
  );
};
