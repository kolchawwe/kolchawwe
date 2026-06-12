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
  LogOut,
  Instagram,
  Facebook,
  MessageSquare
} from 'lucide-react';

function Storefront() {
  const { products } = useStore();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'All' | 'IPA' | 'Stout' | 'Lager' | 'Amber' | 'Belgian'>('All');

  // Filter products by search and category, and hide disabled ones
  const filteredProducts = products.filter((prod) => {
    if (prod.hidden) return false;
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

        <div className="relative z-10 w-full flex flex-col items-center text-center space-y-6" id="hero-full-width-container">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gold-500/10 text-gold-400 border border-gold-500/20">
            <SparkleIcon className="w-3.5 h-3.5" /> Orgullo de San Fernando • Valle de Colchagua
          </span>
          {/* Logo de la marca arriba del título */}
          <div className="block max-w-[200px] sm:max-w-[240px] md:max-w-[280px] w-full mb-2" id="hero-brand-banner-wrapper">
            <img
              src="/images/colchague-logo.png?v=11"
              alt="Logo Premium Kolchawwe"
              referrerPolicy="no-referrer"
              className="w-full h-auto object-contain mx-auto rounded-2xl shadow-xl shadow-black/40 border border-gold-500/15 hover:border-gold-500/35 transition-all duration-300"
            />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-zinc-100 leading-tight">
            Fuerza y Tradición en <span className="text-gold-400 italic">Cerveza Artesanal</span>
          </h1>
          <div className="space-y-4 text-sm md:text-base text-zinc-400 leading-relaxed max-w-4xl mx-auto font-sans font-light" id="hero-storytelling">
            <p className="font-medium text-gold-400 text-[15px] md:text-[17px]">
              Todo tiene un origen. El nuestro, está escrito en la tierra.
            </p>
            <p>
              En el corazón del valle de Colchagua, donde el viento baja de la cordillera y acaricia los campos de San Fernando, nace algo más que granos y agua. Nace una conexión con nuestras raíces.
            </p>
            <p className="text-zinc-350">
              Cuando nombramos nuestra cerveza <span className="font-semibold text-zinc-100">Kolchawwe</span>, no solo estamos rindiendo honor a la voz mapudungun que bautizó nuestra provincia. Estamos rescatando la esencia del <span className="italic text-gold-400">"lugar donde hay renacuajos"</span> o <span className="italic text-gold-400">"lugar de las pequeñas lagunas"</span>: un territorio fértil, bendecido por el sol y trabajado por manos que respetan la tradición.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 pt-4 justify-center text-xs font-semibold">
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

      {/* Storytelling & Visual Gallery Section */}
      <section className="bg-zinc-950/40 border border-zinc-900/80 rounded-3xl p-6 md:p-10 space-y-12" id="storytelling-section">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold tracking-[0.25em] uppercase text-gold-500 block font-serif">Galería Kolchawwe</span>
          <h2 className="text-3xl md:text-4.5xl font-bold font-serif text-zinc-100 leading-tight">La Esencia de Nuestra Tradición</h2>
          <p className="text-zinc-400 text-sm md:text-base font-sans font-light leading-relaxed">
            Nacidos y criados en la noble tierra de San Fernando, Chile, elaboramos cervezas con el alma, rindiendo tributo a la fuerza, elegancia y pureza de nuestro emblema familiar.
          </p>
        </div>

        {/* 4-Column Clean Traditional Gallery Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="brand-visual-gallery">
          
          {/* Card 1: Identidad */}
          <div className="flex flex-col space-y-3" id="gallery-item-logo">
            <div className="aspect-square w-full overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-950">
              <img
                src="/images/colchague-logo.png?v=11"
                alt="Sello de Kolchawwe"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
            <div className="space-y-1 flex-1 flex flex-col pt-1">
              <span className="text-[10px] font-mono tracking-widest text-[#C29F5C] uppercase font-bold block">Identidad</span>
              <h4 className="text-sm font-bold text-zinc-100 font-serif">Sello de Kolchawwe</h4>
              <p className="text-xs text-zinc-400 font-sans font-light leading-relaxed">Inspirado por el caballo rampante de Colchagua, símbolo de libertad y nobleza.</p>
            </div>
          </div>

          {/* Card 2: Frescura */}
          <div className="flex flex-col space-y-3" id="gallery-item-mug">
            <div className="aspect-square w-full overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-950">
              <img
                src="/images/kolchawwe_mug_1781035668859.png"
                alt="Copa de Selección"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
            <div className="space-y-1 flex-1 flex flex-col pt-1">
              <span className="text-[10px] font-mono tracking-widest text-[#C29F5C] uppercase font-bold block">Frescura</span>
              <h4 className="text-sm font-bold text-zinc-100 font-serif">Copa de Selección</h4>
              <p className="text-xs text-zinc-400 font-sans font-light leading-relaxed">Cremosa corona de espuma en una jarra helada rebosante de carácter artesanal.</p>
            </div>
          </div>

          {/* Card 3: Envasado */}
          <div className="flex flex-col space-y-3" id="gallery-item-golden-ale">
            <div className="aspect-square w-full overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-950">
              <img
                src="/images/kolchawwe_golden_ale_1781035680844.png"
                alt="British Golden Ale"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
            <div className="space-y-1 flex-1 flex flex-col pt-1">
              <span className="text-[10px] font-mono tracking-widest text-[#C29F5C] uppercase font-bold block">Envasado</span>
              <h4 className="text-sm font-bold text-zinc-100 font-serif">British Golden Ale</h4>
              <p className="text-xs text-zinc-400 font-sans font-light leading-relaxed">Nuestra joya dorada premium con finos lúpulos cosechados con rigor.</p>
            </div>
          </div>

          {/* Card 4: Origen */}
          <div className="flex flex-col space-y-3" id="gallery-item-stout-river">
            <div className="aspect-square w-full overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-950">
              <img
                src="/images/kolchawwe_stout_1781035692102.png"
                alt="Oatmeal Stout de los Andes"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
            <div className="space-y-1 flex-1 flex flex-col pt-1">
              <span className="text-[10px] font-mono tracking-widest text-[#C29F5C] uppercase font-bold block">Origen</span>
              <h4 className="text-sm font-bold text-zinc-100 font-serif">Oatmeal Stout de los Andes</h4>
              <p className="text-xs text-zinc-400 font-sans font-light leading-relaxed">Cerveza robusta negra refrescada junto a las aguas cordilleranas del San Fernando.</p>
            </div>
          </div>

        </div>

        {/* Framed Horizontal Brand Manifesto Box */}
        <div className="relative overflow-hidden rounded-2xl bg-zinc-950/20 p-6 md:p-8 border border-zinc-800/80 w-full" id="brand-manifest-container">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
            <div className="shrink-0 flex justify-center">
              <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full border border-gold-500/35 bg-zinc-950 flex items-center justify-center p-2 shadow-xl shadow-gold-500/5">
                <div className="absolute inset-0.5 rounded-full border border-dashed border-gold-500/10" />
                <img
                  src="/images/colchague-logo.png?v=11"
                  alt="Sello Kolchawwe"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            </div>
            <div className="space-y-3 text-center md:text-left flex-1">
              <h4 className="text-base md:text-lg font-bold font-serif text-zinc-100">Embotellando Nobleza Santafecina</h4>
              <p className="text-xs md:text-sm text-zinc-400 leading-relaxed font-sans font-light">
                "KOLCHAWWE representa la indómita pasión provinciana. Al igual que el imponente caballo de Colchagua, no descansamos hasta verter la perfection en cada copa. Descorchar una Kolchawwe es rendirse ante el sabor genuino, sin atajos, directo desde la joya del valle central".
              </p>
              <div className="flex items-center gap-2 justify-center md:justify-start pt-1">
                <span className="text-[10px] font-semibold font-mono tracking-wider uppercase text-[#C29F5C]">
                  • RECETAS CLÁSICAS BRITISH GOLDEN ALE & OATMEAL STOUT LISTAS PARA DESPACHO
                </span>
              </div>
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
  const [view, setView] = useState<'shop' | 'admin'>(() => {
    return window.location.pathname === '/admin' ? 'admin' : 'shop';
  });
  const [adminTab, setAdminTab] = useState<'inventory' | 'sales' | 'clients'>('inventory');
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const { successfulOrderToShow } = useStore();
  const [adminAuthorized, setAdminAuthorized] = useState<boolean>(() => {
    return sessionStorage.getItem('kolchawwe_admin_auth') === 'true';
  });

  const navigateTo = (newView: 'shop' | 'admin') => {
    setView(newView);
    const newPath = newView === 'admin' ? '/admin' : '/';
    if (window.location.pathname !== newPath) {
      window.history.pushState(null, '', newPath);
    }
  };

  const handleAuthorize = () => {
    setAdminAuthorized(true);
    sessionStorage.setItem('kolchawwe_admin_auth', 'true');
  };

  const handleLogout = () => {
    setAdminAuthorized(false);
    sessionStorage.removeItem('kolchawwe_admin_auth');
    navigateTo('shop');
  };

  React.useEffect(() => {
    const handlePopState = () => {
      setView(window.location.pathname === '/admin' ? 'admin' : 'shop');
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

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
        setView={navigateTo}
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
      <footer className="bg-zinc-950 border-t border-zinc-900 text-zinc-500 py-12 mt-20" id="main-footer">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center space-y-8">
          
          {/* Social Icons row */}
          <div className="flex items-center justify-center gap-6" id="footer-social-links">
            {/* WhatsApp */}
            <a
              href="https://wa.me/56950891729"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-full border border-gold-500/25 hover:border-gold-400 bg-zinc-900/60 text-gold-400 hover:text-gold-300 transition-all duration-300 hover:scale-110 shadow-lg shadow-gold-500/5 hover:shadow-gold-500/10"
              title="WhatsApp: +56 9 5089 1729"
            >
              <MessageSquare className="w-5 h-5 animate-pulse" />
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/kolchawwe"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-full border border-gold-500/25 hover:border-gold-400 bg-zinc-900/60 text-gold-400 hover:text-gold-300 transition-all duration-300 hover:scale-110 shadow-lg shadow-gold-500/5 hover:shadow-gold-500/10"
              title="Instagram: @kolchawwe"
            >
              <Instagram className="w-5 h-5" />
            </a>

            {/* Facebook */}
            <a
              href="https://www.facebook.com/people/Kolchawwe/61584739270268"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-full border border-gold-500/25 hover:border-gold-400 bg-zinc-900/60 text-gold-400 hover:text-gold-300 transition-all duration-300 hover:scale-110 shadow-lg shadow-gold-500/5 hover:shadow-gold-500/10"
              title="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>

            {/* Email */}
            <a
              href="mailto:kolchawwe@gmail.com"
              className="p-3.5 rounded-full border border-gold-500/25 hover:border-gold-400 bg-zinc-900/60 text-gold-400 hover:text-gold-300 transition-all duration-300 hover:scale-110 shadow-lg shadow-gold-500/5 hover:shadow-gold-500/10"
              title="Correo: kolchawwe@gmail.com"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>

          {/* Chilean Alcohol Warnings block - styled perfectly like the image */}
          <div className="w-full p-6 sm:p-8 bg-zinc-950 border border-zinc-800/80 rounded-sm text-center" id="alcohol-warning-box">
            <p className="text-[10px] sm:text-xs font-mono font-medium tracking-widest text-zinc-450 leading-relaxed uppercase">
              BEBER EN EXCESO ES DAÑINO PARA LA SALUD. VENTA PROHIBIDA A MENORES DE 18 AÑOS. DISFRUTA LA NOBLEZA DE KOLCHAWWE CON RESPONSABILIDAD.
            </p>
          </div>

          {/* Subtitle brand footer */}
          <div className="text-center space-y-2 pt-4 border-t border-zinc-900 w-full text-[11px] text-zinc-600">
            <span className="block font-bold text-zinc-400 font-serif">Cervecería Kolchawwe SPA</span>
            <span className="block">San Fernando, Valle de Colchagua, Chile • Despacho Seguro de Selección Limitada</span>
            <div className="flex items-center justify-center gap-4 text-[10px] font-mono mt-1">
              <span className="text-gold-500/60 font-semibold">• Sandbox Webpay</span>
              <span>• Conforme a la Ley N° 19.925 y Ley N° 21.363</span>
            </div>
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
