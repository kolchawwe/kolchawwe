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
import { ClientsAdmin } from './components/ClientsAdmin';
import { AdminGate } from './components/AdminGate';
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
  Compass,
  Users,
  LogOut
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
            <SparkleIcon className="w-3.5 h-3.5" /> Orgullo de San Fernando • Valle de Colchagua
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif text-zinc-100 leading-tight">
            Fuerza y Tradición en <span className="text-gold-400 italic">Cerveza Artesanal</span>
          </h1>
          <p className="text-sm md:text-base text-zinc-400 leading-relaxed max-w-lg font-sans font-light">
            Cervecería KOLCHAWWE fusiona pasión y lúpulos premium seleccionados desde San Fernando, Chile. Descubre botellas de edición limitada con despacho a domicilio local veloz. ¡Despacho gratis sobre $25.000!
          </p>
          <div className="flex flex-wrap gap-4 pt-2 justify-center md:justify-start text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-gold-400" /> Webpay Pro Sándbox
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-800 my-auto" />
            <div className="flex items-center gap-1.5 text-zinc-400">
              <Compass className="w-4 h-4 text-gold-500" /> Selección de Selección
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

      {/* Storytelling Section */}
      <section className="bg-gradient-to-b from-zinc-900/40 to-zinc-950 border border-zinc-900 rounded-3xl p-6 md:p-10 space-y-8 mt-12" id="storytelling-section">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold tracking-[0.3em] uppercase text-gold-400">Nuestra Identidad</span>
          <h2 className="text-2xl md:text-3xl font-bold font-serif text-zinc-100">La Esencia de Kolchawwe</h2>
          <p className="text-zinc-400 text-sm font-sans font-light leading-relaxed">
            Nacidos y criados en la noble tierra de San Fernando, Chile, elaboramos cervezas con el alma, rindiendo tributo a la fuerza, elegancia y pureza de nuestro emblema familiar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tarjeta 1: El Escudo */}
          <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 space-y-3.5 hover:border-gold-500/10 transition-colors">
            <div className="w-11 h-11 rounded-xl bg-gold-400/10 text-gold-400 flex items-center justify-center border border-gold-400/20">
              <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-.153-8.228-.418m16.914 0a9.003 9.003 0 01-11.963 0m0 0a9.003 9.003 0 0011.963 0" />
              </svg>
            </div>
            <h3 className="text-base font-bold font-serif text-zinc-150">El Escudo del Caballo</h3>
            <p className="text-xs text-zinc-450 leading-relaxed font-sans font-light">
              El imponente caballo blanco rampante de nuestro sello evoca el espíritu indómito de la provincia de Colchagua. Es libertad pura, nobleza y rigor, cualidades volcadas en cada molienda.
            </p>
          </div>

          {/* Tarjeta 2: Cuidado en Botella */}
          <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 space-y-3.5 hover:border-gold-500/10 transition-colors">
            <div className="w-11 h-11 rounded-xl bg-gold-400/10 text-gold-400 flex items-center justify-center border border-gold-400/20">
              <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V9.31a2 2 0 01.586-1.414l2.828-2.828A2 2 0 019.828 4.5H14.17a2 2 0 011.414.586l2.828 2.828A2 2 0 0119 9.31V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-base font-bold font-serif text-zinc-150">Artesanía en Botella</h3>
            <p className="text-xs text-zinc-450 leading-relaxed font-sans font-light">
              Desde el lavado, llenado a contrapresión, tapado hermético y el delicado etiquetado a mano que puedes apreciar en nuestro taller; aseguramos que cada botella llegue a ti como si estuviera recién servida de guarda.
            </p>
          </div>

          {/* Tarjeta 3: San Fernando, Chile */}
          <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 space-y-3.5 hover:border-gold-500/10 transition-colors">
            <div className="w-11 h-11 rounded-xl bg-gold-400/10 text-gold-400 flex items-center justify-center border border-gold-400/20">
              <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1115 0z" />
              </svg>
            </div>
            <h3 className="text-base font-bold font-serif text-zinc-150">Identidad de Tierra</h3>
            <p className="text-xs text-zinc-450 leading-relaxed font-sans font-light">
              San Fernando nos brinda el agua más cristalina de deshielo de la Cordillera de los Andes y productores apícolas que nos facilitan la fina miel orgánica con la que equilibramos nuestras mezclas complejas.
            </p>
          </div>
        </div>

        {/* Visual Mock Showcase (inspired by the images of bottle labels) */}
        <div className="relative overflow-hidden rounded-2xl bg-zinc-900/25 p-6 md:p-8 border border-zinc-90 w-full">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
            <div className="shrink-0 flex justify-center">
              {/* Creative vector of a Rearing Horse Emblem in golden colors */}
              <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full border border-gold-500/35 bg-zinc-950 flex items-center justify-center p-2 shadow-xl shadow-gold-500/5">
                <div className="absolute inset-0.5 rounded-full border border-dashed border-gold-500/10" />
                <svg className="w-12 h-12 text-gold-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a9 9 0 0 0-9 9 9 9 0 0 0 9 9 9 9 0 0 0 9-9A9 9 0 0 0 12 3zm0 2c1.332 0 2.585.344 3.676.953A4 4 0 0 1 12 11h-.5a1.5 1.5 0 0 0-1.5 1.5v.5H9A3 3 0 0 1 6 10h.5A2.5 2.5 0 0 0 9 7.5V7a2 2 0 0 1 2-2h1z" />
                </svg>
              </div>
            </div>
            <div className="space-y-2 text-center md:text-left flex-1">
              <h4 className="text-sm font-bold font-serif text-zinc-200">Embotellando Nobleza Santafecina</h4>
              <p className="text-xs text-zinc-450 leading-relaxed font-sans font-light">
                "KOLCHAWWE representa la indómita pasión provinciana. Al igual que el imponente caballo de Colchagua, no descansamos hasta verter la perfección en cada copa. Descorchar una Kolchawwe es rendirse ante el sabor genuino, sin atajos, directo desde la joya del valle central".
              </p>
              <div className="flex items-center gap-1.5 justify-center md:justify-start pt-1">
                <div className="w-1 h-1 rounded-full bg-gold-500" />
                <span className="text-[10px] font-mono tracking-wider uppercase text-gold-400/80">Recetas Clásicas British Golden Ale & Oatmeal Stout Listas para Despacho</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function MainLayout() {
  const [view, setView] = useState<'shop' | 'admin'>('shop');
  const [adminTab, setAdminTab] = useState<'inventory' | 'sales' | 'clients'>('inventory');
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const { successfulOrderToShow } = useStore();
  const [adminAuthorized, setAdminAuthorized] = useState<boolean>(() => {
    return sessionStorage.getItem('kolchawwe_admin_auth') === 'true';
  });

  const handleAuthorize = () => {
    setAdminAuthorized(true);
    sessionStorage.setItem('kolchawwe_admin_auth', 'true');
  };

  const handleLogout = () => {
    setAdminAuthorized(false);
    sessionStorage.removeItem('kolchawwe_admin_auth');
  };

  React.useEffect(() => {
    if (successfulOrderToShow) {
      setCheckoutOpen(true);
    }
  }, [successfulOrderToShow]);

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
        ) : !adminAuthorized ? (
          <AdminGate onSuccess={handleAuthorize} />
        ) : (
          <div className="space-y-6" id="admin-view-root">
            {/* Admin visual dashboard heading */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-850 pb-5">
              <div>
                <h2 className="text-2xl font-bold font-serif text-zinc-100 flex items-center gap-2">
                  <Sliders className="w-6 h-6 text-gold-500" />
                  Centro de Control Cervecero
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Revisa informes financieros, administra stock de botellas, tarifas de despacho y despacha pedidos.
                </p>
              </div>

              {/* Navigation inside administration and logout flag */}
              <div className="flex flex-wrap items-center gap-3">
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
                  <button
                    onClick={() => setAdminTab('clients')}
                    className={`px-4 py-2 rounded-lg cursor-pointer transition-all duration-300 ${
                      adminTab === 'clients' ? 'bg-gradient-to-r from-gold-400 to-gold-600 text-zinc-950 font-bold shadow-md' : 'text-zinc-450 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      Clientes Compradores
                    </span>
                  </button>
                </div>

                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-rose-955/20 hover:bg-rose-900/30 text-rose-400 hover:text-rose-300 border border-rose-900/40 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  title="Cerrar sesión de administración"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Cerrar Sesión
                </button>
              </div>
            </div>

            {/* Inner router tabs */}
            <div className="pt-2 animate-fade-in" id="admin-nested-tab-content">
              {adminTab === 'inventory' ? (
                <ProductAdmin />
              ) : adminTab === 'sales' ? (
                <SalesReport />
              ) : (
                <ClientsAdmin />
              )}
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
            <span className="block font-bold text-zinc-400 font-serif">Cervecería Kolchawwe SPA</span>
            <span className="block text-xs">Manejo inteligente de stock y pasarela de pago certificada. San Fernando, Chile.</span>
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
