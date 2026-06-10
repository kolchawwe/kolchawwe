/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Beer, ShoppingCart, ShieldAlert, Sliders, Menu, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface HeaderProps {
  currentView: 'shop' | 'admin';
  setView: (view: 'shop' | 'admin') => void;
  toggleCart: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, setView, toggleCart }) => {
  const { cart, products } = useStore();
  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if any product is critically low on stock (< 10) to alert admin badge
  const lowStockProducts = products.filter(p => p.stock < 10);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    if (currentView !== 'shop') {
      setView('shop');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          const headerOffset = 100;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.scrollY - headerOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 150);
    } else {
      const element = document.getElementById(id);
      if (element) {
        const headerOffset = 100;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-zinc-950/80 backdrop-blur-xl border-b border-gold-500/15 text-zinc-100" id="main-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo and brand */}
        <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => scrollToSection('hero-landing')} id="logo-branding">
          <div className="w-11 h-11 bg-zinc-900 rounded-full shadow-lg shadow-gold-500/10 border border-gold-500/30 overflow-hidden flex items-center justify-center shrink-0" id="header-logo-badge">
            <img
              src="/images/colchague-logo.png?v=11"
              alt="Kolchawwe"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight font-serif bg-gradient-to-r from-gold-400 via-yellow-200 to-gold-600 bg-clip-text text-transparent uppercase">
              Cervecería Kolchawwe
            </span>
            <span className="block text-[9px] uppercase tracking-[0.25em] text-gold-400/80 font-bold font-sans">
              San Fernando · Chile
            </span>
          </div>
        </div>

        {/* Navigation Tabs for Shop Section */}
        {currentView === 'shop' && (
          <nav className="hidden md:flex items-center gap-8" id="desktop-shop-nav">
            <button
              onClick={() => scrollToSection('hero-landing')}
              className="font-serif tracking-widest text-[11px] font-bold text-zinc-350 hover:text-gold-400 uppercase transition-all duration-300 cursor-pointer hover:translate-y-[-1px] focus:outline-none"
              id="shop-nav-inicio"
            >
              Inicio
            </button>
            <button
              onClick={() => scrollToSection('storytelling-section')}
              className="font-serif tracking-widest text-[11px] font-bold text-zinc-350 hover:text-gold-400 uppercase transition-all duration-300 cursor-pointer hover:translate-y-[-1px] focus:outline-none"
              id="shop-nav-tierra"
            >
              Nuestra Tierra
            </button>
            <button
              onClick={() => scrollToSection('filters-panel')}
              className="font-serif tracking-widest text-[11px] font-bold text-zinc-350 hover:text-gold-400 uppercase transition-all duration-300 cursor-pointer hover:translate-y-[-1px] focus:outline-none"
              id="shop-nav-variedades"
            >
              Variedades
            </button>
            <button
              onClick={() => scrollToSection('main-footer')}
              className="font-serif tracking-widest text-[11px] font-bold text-zinc-350 hover:text-gold-400 uppercase transition-all duration-300 cursor-pointer hover:translate-y-[-1px] focus:outline-none"
              id="shop-nav-contacto"
            >
              Contacto
            </button>
          </nav>
        )}

        {/* Navigation Tabs for Admin Section */}
        {currentView === 'admin' && (
          <nav className="hidden md:flex space-x-1.5 bg-zinc-900/60 p-1 rounded-xl border border-zinc-800/80" id="desktop-nav">
            <button
              id="nav-btn-shop"
              onClick={() => setView('shop')}
              className="px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40 cursor-pointer"
            >
              Ver Tienda
            </button>
            <button
              id="nav-btn-admin"
              onClick={() => setView('admin')}
              className="px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 bg-gradient-to-r from-gold-500 to-gold-600 text-zinc-950 shadow-md font-semibold scale-[1.02] cursor-pointer"
            >
              <Sliders className="w-4 h-4" />
              Administración
              {lowStockProducts.length > 0 && (
                <span className="inline-flex w-2 h-2 rounded-full bg-rose-500 shadow-lg shadow-rose-500/50" />
              )}
            </button>
          </nav>
        )}

        {/* Actions (Cart & Admin/Menu toggle for mobile) */}
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

          {/* Mobile shop navigation toggle */}
          {currentView === 'shop' && (
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-3 bg-zinc-900/90 hover:bg-zinc-800/90 border border-zinc-800 text-zinc-400 hover:text-gold-400 rounded-xl transition-all duration-300 focus:outline-none cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          {/* Mobile administration quick toggle (Only visible if already in admin) */}
          {currentView === 'admin' && (
            <button
              id="mobile-nav-btn-admin"
              onClick={() => setView('shop')}
              className="md:hidden px-3.5 py-2.5 rounded-xl border transition-all duration-300 text-sm font-medium flex items-center gap-1.5 bg-gradient-to-r from-gold-500 to-gold-600 text-zinc-950 border-gold-500 font-semibold cursor-pointer"
            >
              <Sliders className="w-4.5 h-4.5" />
              <span>Volver</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {currentView === 'shop' && mobileMenuOpen && (
        <div className="md:hidden bg-zinc-950/95 border-b border-gold-500/15 p-4 space-y-3 animate-fade-in" id="mobile-shop-nav-panel">
          <button
            onClick={() => scrollToSection('hero-landing')}
            className="w-full text-left py-2 font-serif tracking-widest text-xs font-bold text-zinc-300 hover:text-gold-400 uppercase transition-all duration-200 block border-b border-zinc-900 focus:outline-none"
          >
            Inicio
          </button>
          <button
            onClick={() => scrollToSection('storytelling-section')}
            className="w-full text-left py-2 font-serif tracking-widest text-xs font-bold text-zinc-350 hover:text-gold-400 uppercase transition-all duration-200 block border-b border-zinc-900 focus:outline-none"
          >
            Nuestra Tierra
          </button>
          <button
            onClick={() => scrollToSection('filters-panel')}
            className="w-full text-left py-2 font-serif tracking-widest text-xs font-bold text-zinc-350 hover:text-gold-400 uppercase transition-all duration-200 block border-b border-zinc-900 focus:outline-none"
          >
            Variedades
          </button>
          <button
            onClick={() => scrollToSection('main-footer')}
            className="w-full text-left py-2 font-serif tracking-widest text-xs font-bold text-zinc-350 hover:text-gold-400 uppercase transition-all duration-200 block focus:outline-none"
          >
            Contacto
          </button>
        </div>
      )}
    </header>
  );
};
