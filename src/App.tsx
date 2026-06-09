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

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10" id="hero-grid-container">
          <div className="md:col-span-8 space-y-5 text-left" id="hero-text-col">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gold-500/10 text-gold-400 border border-gold-500/20">
              <SparkleIcon className="w-3.5 h-3.5" /> Orgullo de San Fernando • Valle de Colchagua
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif text-zinc-100 leading-tight">
              Fuerza y Tradición en <span className="text-gold-400 italic">Cerveza Artesanal</span>
            </h1>
            <div className="space-y-4 text-sm md:text-base text-zinc-400 leading-relaxed max-w-2xl font-sans font-light" id="hero-storytelling">
              <p className="font-medium text-gold-400 text-[15px] md:text-[17px]">
                Todo tiene un origen. El nuestro, está escrito en la tierra.
              </p>
              <p>
                En el corazón del valle de Colchagua, donde el viento baja de la cordillera y acaricia los campos de San Fernando, nace algo más que granos y agua. Nace una conexión con nuestras raíces.
              </p>
              <p className="text-zinc-300">
                Cuando nombramos nuestra cerveza <span className="font-semibold text-zinc-100">Kolchawwe</span>, no solo estamos rindiendo honor a la voz mapudungun que bautizó nuestra provincia. Estamos rescatando la esencia del <span className="italic text-gold-400">"lugar donde hay renacuajos"</span> o <span className="italic text-gold-400">"lugar de las pequeñas lagunas"</span>: un territorio fértil, bendecido por el sol y trabajado por manos que respetan la tradición.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 pt-2 justify-start text-xs font-semibold">
              <div className="flex items-center gap-1.5 text-zinc-400">
                <ShieldCheck className="w-4 h-4 text-gold-400" /> Webpay Pro Sándbox
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-800 my-auto" />
              <div className="flex items-center gap-1.5 text-zinc-400">
                <Compass className="w-4 h-4 text-gold-500" /> Selección de Selección
              </div>
            </div>
          </div>

          {/* Logo brand illustration badge */}
          <div className="md:col-span-4 flex justify-center w-full" id="hero-logo-col">
            <div className="relative group">
              {/* Outer Golden Glow and frame */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-gold-500 to-amber-600 opacity-20 blur-lg group-hover:opacity-35 transition duration-1000 group-hover:duration-200" />
              <div className="relative bg-zinc-950 border border-gold-500/20 p-2.5 rounded-2xl shadow-2xl w-[260px] md:w-[240px] max-w-full">
                <img
                  src="/src/assets/images/kolchawwe_logo_1781035658215.png"
                  alt="Sello Kolchawwe"
                  referrerPolicy="no-referrer"
                  className="rounded-xl w-full h-auto object-cover object-center shadow-inner filter brightness-110 contrast-105"
                />
                <div className="mt-2 text-center">
                  <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-gold-400/80 font-bold block">
                    Sello de Origen Certificado
                  </span>
                </div>
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

      {/* Storytelling & Visual Gallery Section */}
      <section className="bg-gradient-to-b from-zinc-900/30 to-zinc-950 border border-zinc-900 rounded-3xl p-6 md:p-10 space-y-8 mt-12" id="storytelling-section">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold tracking-[0.3em] uppercase text-gold-400 block">Galería Kolchawwe</span>
          <h2 className="text-2xl md:text-3xl font-bold font-serif text-zinc-100">La Esencia de Nuestra Tradición</h2>
          <p className="text-zinc-400 text-sm font-sans font-light leading-relaxed">
            Nacidos y criados en la noble tierra de San Fernando, Chile, elaboramos cervezas con el alma, rindiendo tributo a la fuerza, elegancia y pureza de nuestro emblema familiar.
          </p>
        </div>

        {/* Bento Grid Gallery of the 4 Real Brand Images */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="brand-visual-gallery">
          
          {/* Item 1: Logo */}
          <div className="group relative overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-950/80 hover:border-gold-500/25 transition-all duration-300 flex flex-col" id="gallery-item-logo">
            <div className="aspect-square w-full overflow-hidden">
              <img
                src="/src/assets/images/kolchawwe_logo_1781035658215.png"
                alt="Emblema Oficial Kolchawwe"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 filter brightness-105"
              />
            </div>
            <div className="p-4 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent flex-1 flex flex-col justify-end">
              <span className="text-[10px] font-mono tracking-widest text-gold-400 uppercase font-semibold block">Identidad</span>
              <h4 className="text-xs font-bold text-zinc-250 font-serif mt-0.5">Sello de Kolchawwe</h4>
              <p className="text-[11px] text-zinc-500 font-sans mt-1 leading-relaxed">Inspirado por el caballo rampante de Colchagua, símbolo de libertad y nobleza.</p>
            </div>
          </div>

          {/* Item 2: Mug */}
          <div className="group relative overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-950/80 hover:border-gold-500/25 transition-all duration-300 flex flex-col" id="gallery-item-mug">
            <div className="aspect-square w-full overflow-hidden">
              <img
                src="/src/assets/images/kolchawwe_mug_1781035668859.png"
                alt="Copa Servida Kolchawwe"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-4 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent flex-1 flex flex-col justify-end">
              <span className="text-[10px] font-mono tracking-widest text-gold-400 uppercase font-semibold block">Frescura</span>
              <h4 className="text-xs font-bold text-zinc-250 font-serif mt-0.5">Copa de Selección</h4>
              <p className="text-[11px] text-zinc-500 font-sans mt-1 leading-relaxed">Cremosa corona de espuma en una jarra helada rebosante de carácter artesanal.</p>
            </div>
          </div>

          {/* Item 3: Bottle British */}
          <div className="group relative overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-950/80 hover:border-gold-500/25 transition-all duration-300 flex flex-col" id="gallery-item-golden-ale">
            <div className="aspect-square w-full overflow-hidden">
              <img
                src="/src/assets/images/kolchawwe_golden_ale_1781035680844.png"
                alt="Botella British Golden Ale"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 filter brightness-105"
              />
            </div>
            <div className="p-4 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent flex-1 flex flex-col justify-end">
              <span className="text-[10px] font-mono tracking-widest text-gold-400 uppercase font-semibold block">Envasado</span>
              <h4 className="text-xs font-bold text-zinc-250 font-serif mt-0.5">British Golden Ale</h4>
              <p className="text-[11px] text-zinc-500 font-sans mt-1 leading-relaxed">Nuestra joya dorada premium con finos lúpulos cosechados con rigor.</p>
            </div>
          </div>

          {/* Item 4: Bottle Stout River */}
          <div className="group relative overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-950/80 hover:border-gold-500/25 transition-all duration-300 flex flex-col" id="gallery-item-stout-river">
            <div className="aspect-square w-full overflow-hidden">
              <img
                src="/src/assets/images/kolchawwe_stout_1781035692102.png"
                alt="Oatmeal Stout en Río de la Cordillera"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-4 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent flex-1 flex flex-col justify-end">
              <span className="text-[10px] font-mono tracking-widest text-gold-400 uppercase font-semibold block">Origen</span>
              <h4 className="text-xs font-bold text-zinc-250 font-serif mt-0.5">Oatmeal Stout de los Andes</h4>
              <p className="text-[11px] text-zinc-500 font-sans mt-1 leading-relaxed">Cerveza robusta negra refrescada junto a las aguas cordilleranas del San Fernando.</p>
            </div>
          </div>

        </div>

        {/* Embotellando text summary panel */}
        <div className="relative overflow-hidden rounded-2xl bg-zinc-900/25 p-6 md:p-8 border border-zinc-90 w-full" id="brand-manifest-container">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
            <div className="shrink-0 flex justify-center">
              <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full border border-gold-500/35 bg-zinc-950 flex items-center justify-center p-2 shadow-xl shadow-gold-500/5">
                <div className="absolute inset-0.5 rounded-full border border-dashed border-gold-500/10" />
                <img
                  src="/src/assets/images/kolchawwe_logo_1781035658215.png"
                  alt="Avatar Sello"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-full"
                />
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
