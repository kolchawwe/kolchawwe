/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Beer, ShoppingCart, ShieldAlert, Sliders, Menu, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { motion, AnimatePresence } from 'motion/react';

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
    <motion.header 
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-40 w-full bg-zinc-950/80 backdrop-blur-xl border-b border-gold-500/15 text-zinc-100" 
      id="main-header"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Logo and brand */}
        <div 
          className="flex items-center gap-3.5 cursor-pointer group" 
          onClick={() => scrollToSection('hero-landing')} 
          id="logo-branding"
        >
          <motion.div 
            whileHover={{ 
              scale: 1.08, 
              rotate: 8,
              boxShadow: "0px 0px 15px rgba(212, 163, 89, 0.45)" 
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="w-11 h-11 bg-zinc-900 rounded-full shadow-lg shadow-gold-500/5 border border-gold-500/30 overflow-hidden flex items-center justify-center shrink-0" 
            id="header-logo-badge"
          >
            <img
              src="/images/colchague-logo.png?v=11"
              alt="Kolchawwe"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-300"
            />
          </motion.div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight font-serif bg-gradient-to-r from-gold-400 via-yellow-200 to-gold-600 bg-clip-text text-transparent uppercase group-hover:brightness-110 transition-all duration-300">
              Cervecería Kolchawwe
            </span>
            <span className="block text-[9px] uppercase tracking-[0.25em] text-gold-400/85 font-bold font-sans transition-all duration-300 group-hover:translate-x-0.5">
              San Fernando · Chile
            </span>
          </div>
        </div>

        {/* Navigation Tabs for Shop Section */}
        {currentView === 'shop' && (
          <nav className="hidden md:flex items-center gap-8" id="desktop-shop-nav">
            {['inicio', 'tierra', 'variedades', 'contacto'].map((tabName, index) => {
              const targetId = tabName === 'inicio' ? 'hero-landing' :
                               tabName === 'tierra' ? 'storytelling-section' :
                               tabName === 'variedades' ? 'filters-panel' : 'main-footer';
              const label = tabName === 'inicio' ? 'Inicio' :
                            tabName === 'tierra' ? 'Nuestra Tierra' :
                            tabName === 'variedades' ? 'Variedades' : 'Contacto';
              return (
                <motion.button
                  key={tabName}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05, duration: 0.4 }}
                  onClick={() => scrollToSection(targetId)}
                  whileHover={{ y: -2 }}
                  className="relative font-serif tracking-widest text-[11px] font-bold text-zinc-350 hover:text-gold-400 uppercase transition-colors duration-300 cursor-pointer focus:outline-none"
                  id={`shop-nav-${tabName}`}
                >
                  {label}
                  <motion.span 
                    className="absolute -bottom-1.5 left-0 w-0 h-0.5 bg-gradient-to-r from-gold-500 to-yellow-300"
                    whileHover={{ width: '100%' }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>
              );
            })}
          </nav>
        )}

        {/* Navigation Tabs for Admin Section */}
        {currentView === 'admin' && (
          <nav className="hidden md:flex space-x-1.5 bg-zinc-900/60 p-1 rounded-xl border border-zinc-800/80" id="desktop-nav">
            <motion.button
              id="nav-btn-shop"
              onClick={() => setView('shop')}
              whileHover={{ backgroundColor: 'rgba(63, 63, 70, 0.4)' }}
              whileTap={{ scale: 0.98 }}
              className="px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 text-zinc-400 hover:text-zinc-100 cursor-pointer"
            >
              Ver Tienda
            </motion.button>
            <motion.button
              id="nav-btn-admin"
              onClick={() => setView('admin')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 bg-gradient-to-r from-gold-500 to-gold-600 text-zinc-950 shadow-md font-semibold cursor-pointer"
            >
              <Sliders className="w-4 h-4" />
              Administración
              {lowStockProducts.length > 0 && (
                <span className="inline-flex w-2 h-2 rounded-full bg-rose-500 shadow-lg shadow-rose-500/50" />
              )}
            </motion.button>
          </nav>
        )}

        {/* Actions (Cart & Admin/Menu toggle for mobile) */}
        <div className="flex items-center gap-3" id="header-actions">
          {/* Cart Badge Button with pop micro-interaction */}
          <motion.button
            id="cart-toggle-btn"
            onClick={toggleCart}
            whileHover={{ scale: 1.05, borderColor: "rgba(212, 163, 89, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            className="relative p-3 bg-zinc-900/90 hover:bg-zinc-800/90 border border-zinc-800 text-zinc-400 hover:text-gold-400 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gold-500 cursor-pointer"
            aria-label="Abrir carrito"
          >
            <ShoppingCart className="w-5 h-5" />
            <AnimatePresence>
              {totalCartItems > 0 && (
                <motion.span 
                  key={totalCartItems}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  className="absolute -top-1.5 -right-1.5 flex h-5 min-w-[20px] px-1.5 items-center justify-center rounded-full bg-gradient-to-r from-gold-400 to-gold-500 text-[10px] font-bold text-zinc-950 border border-zinc-950 shadow-lg font-sans"
                >
                  {totalCartItems}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Mobile shop navigation toggle */}
          {currentView === 'shop' && (
            <motion.button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileTap={{ scale: 0.9 }}
              className="md:hidden p-3 bg-zinc-900/90 hover:bg-zinc-800/90 border border-zinc-800 text-zinc-400 hover:text-gold-400 rounded-xl transition-all duration-300 focus:outline-none cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          )}

          {/* Mobile administration quick toggle (Only visible if already in admin) */}
          {currentView === 'admin' && (
            <motion.button
              id="mobile-nav-btn-admin"
              onClick={() => setView('shop')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              className="md:hidden px-3.5 py-2.5 rounded-xl border transition-all duration-300 text-sm font-medium flex items-center gap-1.5 bg-gradient-to-r from-gold-500 to-gold-600 text-zinc-950 border-gold-500 font-semibold cursor-pointer"
            >
              <Sliders className="w-4.5 h-4.5" />
              <span>Volver</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Mobile Menu Panel with smooth height slide */}
      <AnimatePresence>
        {currentView === 'shop' && mobileMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-zinc-950/95 border-b border-gold-500/15 overflow-hidden" 
            id="mobile-shop-nav-panel"
          >
            <div className="p-4 space-y-3">
              {['inicio', 'tierra', 'variedades', 'contacto'].map((tabName) => {
                const targetId = tabName === 'inicio' ? 'hero-landing' :
                                 tabName === 'tierra' ? 'storytelling-section' :
                                 tabName === 'variedades' ? 'filters-panel' : 'main-footer';
                const label = tabName === 'inicio' ? 'Inicio' :
                              tabName === 'tierra' ? 'Nuestra Tierra' :
                              tabName === 'variedades' ? 'Variedades' : 'Contacto';
                return (
                  <button
                    key={tabName}
                    onClick={() => scrollToSection(targetId)}
                    className="w-full text-left py-2 font-serif tracking-widest text-xs font-bold text-zinc-300 hover:text-gold-400 uppercase transition-all duration-200 block border-b border-zinc-900 focus:outline-none"
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
