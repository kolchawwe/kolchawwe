/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { ProductAdmin } from './components/ProductAdmin';
import { SalesReport } from './components/SalesReport';
import {
  Search,
  Sliders,
  Filter,
  Layers,
  TrendingUp,
  Beer,
  ChevronDown,
  Info,
  ShieldCheck,
  ChevronRight,
  Mail,
  MapPin,
  Compass
} from 'lucide-react';

function Storefront() {
  const { products } = useStore();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'All' | 'IPA' | 'Stout' | 'Lager' | 'Amber' | 'Belgian'>('All');

  // Filter products by search and category
  const filteredProducts = products.filter((prod) => {
    const matchesSearch = prod.name.toLowerCase().includes(search.toLowerCase()) || 
                          prod.tagline.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || prod.category === category;
    return matchesSearch && matchesCategory;
  });

  const categoriesOrder: Array<'All' | 'IPA' | 'Stout' | 'Lager' | 'Amber' | 'Belgian'> = [
    'All', 'IPA', 'Stout', 'Lager', 'Amber', 'Belgian'
  ];

  const categoryLabels: Record<string, string> = {
    All: 'Todos los Estilos',
    IPA: 'IPAs Aromáticas',
    Stout: 'Negras Cremosas',
    Lager: 'Golden Lagers',
    Amber: 'Amber Ales',
    Belgian: 'Belgian Strong',
  };

  return (
    <div className="space-y-8" id="storefront-view-wrapper">
      
      {/* Visual Ambient Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-950 to-zinc-900 border border-gold-500/10 px-6 py-12 md:p-16 text-center md:text-left shadow-2xl" id="hero-landing">
        
        {/* Background visual graphics */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 blur-3xl rounded-full animate-pulse" />
        <div className="absolute -bottom-10 left-10 w-80 h-80 bg-gold-400/5 blur-3xl rounded-full" />

        <div className="relative max-w-xl space-y-5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gold-500/10 text-gold-400 border border-gold-500/20">
            <SparkleIcon className="w-3.5 h-3.5" /> Directo desde la Selva Valdiviana
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif text-zinc-100 leading-tight">
            Cerveza fría, pura y con <span className="text-gold-400 italic">Tradición Sureña</span>
          </h1>
          <p className="text-sm md:text-base text-zinc-400 leading-relaxed max-w-lg font-sans font-light">
            Nuestras cervezas premium de fermentación natural y lúpulos frescos de la Cordillera de la Costa. Simula tu carro de compras con despacho a domicilio el mismo día. ¡Despachos gratis sobre $25.000!
          </p>
          <div className="flex flex-wrap gap-4 pt-2 justify-center md:justify-start text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-gold-400" /> Webpay Pro Sándbox
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-800 my-auto" />
            <div className="flex items-center gap-1.5 text-zinc-400">
              <Compass className="w-4 h-4 text-gold-500" /> Desborde de Lúpulos
            </div>
          </div>
        </div>
      </section>

      {/* FILTER AND SEARCH CONTROLS */}
      <section className="bg-zinc-950/70 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-5 md:p-6" id="filters-panel">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Dynamic Category selectors */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto" id="categorization-bar">
            {categoriesOrder.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
                  category === cat
                    ? 'bg-gradient-to-r from-gold-400 to-gold-600 text-zinc-950 font-bold shadow-lg shadow-gold-500/20 scale-[1.02]'
                    : 'bg-zinc-900/65 text-zinc-400 hover:text-gold-400 border border-zinc-800/80 hover:border-gold-500/20'
                }`}
              >
                {categoryLabels[cat]}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="¿Qué receta buscas hoy?..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-gold-500 transition-colors"
            />
          </div>
        </div>
      </section>

      {/* PRODUCT GRID SHOWCASE */}
      <main id="products-catalogue">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900/40 border border-zinc-800 rounded-2xl space-y-3">
            <Beer className="w-10 h-10 text-zinc-700 mx-auto animate-pulse" />
            <h3 className="text-base font-bold text-zinc-300 font-serif">No encontramos resultados</h3>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto">
              Prueba cambiando el término de búsqueda o seleccionando "Todos los Estilos" para recargar las cervezas.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((beer) => (
              <ProductCard key={beer.id} product={beer} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function MainLayout() {
  const [view, setView] = useState<'shop' | 'admin'>('shop');
  const [adminTab, setAdminTab] = useState<'inventory' | 'sales'>('inventory');
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-150 font-sans selection:bg-gold-500 selection:text-zinc-950" id="spa-layout">
      
      {/* Sticky Main Header */}
      <Header
        currentView={view}
        setView={setView}
        toggleCart={() => setCartOpen(true)}
      />

      {/* Dynamic Main view switcher */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        {view === 'shop' ? (
          <Storefront />
        ) : (
          <div className="space-y-6" id="admin-view-root">
            {/* Admin visual dashboard heading */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-850 pb-5">
              <div>
                <h2 className="text-2xl font-bold font-serif text-zinc-100 flex items-center gap-2">
                  <Sliders className="w-6 h-6 text-gold-500" />
                  Centro de Control Cervecero
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Revisa informes financieros, administra stock de botellas, tarifas de despacho y despacha pedidos.
                </p>
              </div>

              {/* Navigation inside administration */}
              <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-xl text-xs font-semibold sm:w-auto self-start">
                <button
                  onClick={() => setAdminTab('inventory')}
                  className={`px-4 py-2 rounded-lg cursor-pointer transition-all duration-300 ${
                    adminTab === 'inventory' ? 'bg-gradient-to-r from-gold-400 to-gold-600 text-zinc-950 font-bold shadow-md' : 'text-zinc-450 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4" />
                    Inventario & Precios
                  </span>
                </button>
                <button
                  onClick={() => setAdminTab('sales')}
                  className={`px-4 py-2 rounded-lg cursor-pointer transition-all duration-300 ${
                    adminTab === 'sales' ? 'bg-gradient-to-r from-gold-400 to-gold-600 text-zinc-950 font-bold shadow-md' : 'text-zinc-450 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4" />
                    Informe de Ventas
                  </span>
                </button>
              </div>
            </div>

            {/* Inner router tabs */}
            <div className="pt-2 animate-fade-in" id="admin-nested-tab-content">
              {adminTab === 'inventory' ? <ProductAdmin /> : <SalesReport />}
            </div>
          </div>
        )}
      </div>

      {/* DRAWER AND DIALOG OVERLAYS */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => setCheckoutOpen(true)}
      />

      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />

      {/* Footer Area */}
      <footer className="bg-zinc-955 border-t border-zinc-900 text-zinc-500 py-12 mt-20" id="main-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left space-y-1.5">
            <span className="block font-bold text-zinc-400 font-serif">Cervecería Valdiviana SPA</span>
            <span className="block text-xs">Manejo inteligente de stock y pasarela de pago certificada. Valdivia, Chile.</span>
          </div>
          <div className="flex gap-4 text-xs font-mono">
            <span className="text-gold-500/75 font-semibold">• Modo Sándbox Activo</span>
            <span>• No para consumo comercial</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <MainLayout />
    </StoreProvider>
  );
}

// Sparkle helper icon
const SparkleIcon = ({ className }: { className?: string }) => (
  <svg
    id="sparkle-icon"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </svg>
);
