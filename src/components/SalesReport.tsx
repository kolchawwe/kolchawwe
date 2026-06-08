/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Order, Product } from '../types';
import { formatCLP } from './ProductCard';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  ArrowRight,
  Filter,
  Calendar,
  Layers,
  Users,
  Copy,
  Check,
  CheckCircle2,
  PackageCheck,
  Zap,
  BarChart3
} from 'lucide-react';

export const SalesReport: React.FC = () => {
  const { orders, updateOrderStatus, products } = useStore();
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pendiente' | 'Despachado' | 'Entregado'>('All');
  const [copiedPayloadId, setCopiedPayloadId] = useState<string | null>(null);

  // 1. Core Analytics Metrics
  const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);
  const totalSubtotal = orders.reduce((acc, order) => acc + order.subtotal, 0);
  const totalShipping = orders.reduce((acc, order) => acc + order.shippingCost, 0);
  
  const totalBeersSold = orders.reduce((acc, order) => {
    const orderItemsQty = order.items.reduce((sum, item) => sum + item.quantity, 0);
    return acc + orderItemsQty;
  }, 0);

  const pendingDeliveries = orders.filter((o) => o.status === 'Pendiente').length;
  const dispatchSuccessRate = orders.length > 0 ? Math.round(((orders.length - pendingDeliveries) / orders.length) * 100) : 100;

  // 2. Aggregate Sales per Beer (for horizontal bar charts)
  const productSalesMap: Record<string, { qty: number; revenue: number; prod: Product | null }> = {};
  
  // Seed with active products just in case to show 0s too
  products.forEach(p => {
    productSalesMap[p.id] = { qty: 0, revenue: 0, prod: p };
  });

  orders.forEach((order) => {
    order.items.forEach((item) => {
      const pId = item.product.id;
      if (productSalesMap[pId]) {
        productSalesMap[pId].qty += item.quantity;
        productSalesMap[pId].revenue += item.product.price * item.quantity;
      } else {
        productSalesMap[pId] = {
          qty: item.quantity,
          revenue: item.product.price * item.quantity,
          prod: item.product
        };
      }
    });
  });

  const beerSalesData = Object.entries(productSalesMap)
    .map(([id, stats]) => ({
      name: stats.prod ? stats.prod.name : 'Cerveza Eliminada',
      qty: stats.qty,
      revenue: stats.revenue,
      category: stats.prod ? stats.prod.category : 'Otros',
    }))
    .sort((a, b) => b.qty - a.qty);

  const maxQtySold = Math.max(...beerSalesData.map(d => d.qty), 1);

  // 3. Generate seed data helper for simulations
  const handleGenerateSeedOrders = () => {
    if (products.length === 0) return;
    
    const mockAddresses = [
      'Av. Libertad 1240, Concepción',
      'Avenida Bernardo O\'Higgins 450, San Fernando',
      'El Inca 5120, Las Condes, Santiago',
      'San Martín 87, Viña del Mar',
      'Aníbal Pinto 44, Temuco'
    ];

    const mockNames = [
      'Fernanda Alarcón',
      'Andrés Valenzuela',
      'Ignacio Montes',
      'Catalina Guerrero',
      'Carlos Schuler'
    ];

    const mockCommunes = ['Concepción', 'San Fernando', 'Las Condes', 'Viña del Mar', 'Temuco'];

    const mockOrdersSeed: Order[] = Array.from({ length: 4 }).map((_, i) => {
      // Pick random beer
      const randomBeers = [...products].sort(() => 0.5 - Math.random());
      const selectedProduct1 = randomBeers[0];
      const selectedProduct2 = randomBeers.length > 1 ? randomBeers[1] : randomBeers[0];

      const item1 = { product: selectedProduct1, quantity: Math.floor(Math.random() * 4) + 1 };
      const item2 = { product: selectedProduct2, quantity: Math.floor(Math.random() * 2) + 1 };

      const items = i % 2 === 0 ? [item1] : [item1, item2];

      const subtotal = items.reduce((acc, it) => acc + it.product.price * it.quantity, 0);
      const isFree = subtotal >= 25000;
      const shCost = isFree ? 0 : 3500;
      
      const pastDays = (i + 1) * 2;
      const date = new Date(Date.now() - pastDays * 24 * 60 * 60 * 1000).toISOString();

      return {
        id: `CL-ORD-SM0${i+1}-${new Date().getFullYear()}`,
        date,
        items,
        shippingDetails: {
          fullName: mockNames[i],
          email: `${mockNames[i].toLowerCase().replace(' ', '.')}@gmail.com`,
          address: mockAddresses[i],
          commune: mockCommunes[i],
          phone: `9 ${Math.floor(10000000 + Math.random() * 90000000)}`,
          notes: i % 2 === 0 ? 'Por favor golpear fuerte el timbre.' : ''
        },
        subtotal,
        shippingCost: shCost,
        total: subtotal + shCost,
        status: i === 0 ? 'Pendiente' : i === 1 ? 'Despachado' : 'Entregado',
        paymentId: `WP-MOCK00${i+1}`,
      };
    });

    const blended = [...orders, ...mockOrdersSeed];
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(blended)
    })
    .then(res => {
      if (res.ok) {
        window.location.reload();
      }
    })
    .catch(err => console.error("Error seeding backend orders:", err));
  };

  const copyDispatchLogistics = (order: Order) => {
    const payload = JSON.stringify({
      orderId: order.id,
      meta: {
        vendor: "Cervecería Kolchawwe SPA",
        date_issued: order.date,
        sync_code: order.paymentId
      },
      shipping: {
        recipient: order.shippingDetails.fullName,
        phone: "+56" + order.shippingDetails.phone,
        email: order.shippingDetails.email,
        address: order.shippingDetails.address,
        commune: order.shippingDetails.commune,
        courier_service: "Chilexpress Home"
      },
      packages: order.items.map(item => ({
        beer: item.product.name,
        bottle_volume: item.product.volume,
        quantity: item.quantity,
        sku: item.product.id
      }))
    }, null, 2);

    navigator.clipboard.writeText(payload);
    setCopiedPayloadId(order.id);
    setTimeout(() => setCopiedPayloadId(null), 2000);
  };

  // Filter orders according to selected tab status
  const filteredOrders = statusFilter === 'All' 
    ? orders 
    : orders.filter((o) => o.status === statusFilter);

  return (
    <div className="space-y-8" id="sales-reports-module">
      
      {/* 1. KEY KPI DASHBOARD CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" id="sales-metrics-grid">
        {/* Total revenue */}
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="block text-[10px] uppercase font-mono tracking-widest text-zinc-500">
              Ventas Totales (Bruto)
            </span>
            <span className="block text-2xl font-extrabold text-zinc-100 font-mono">
              {formatCLP(totalRevenue)}
            </span>
            <span className="block text-[10px] text-zinc-400">
              Neto: {formatCLP(totalSubtotal)} • Logística: {formatCLP(totalShipping)}
            </span>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/10">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Total quantity solid */}
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="block text-[10px] uppercase font-mono tracking-widest text-zinc-500">
              Cervezas Despachadas
            </span>
            <span className="block text-2xl font-extrabold text-zinc-100 font-mono">
              {totalBeersSold} un.
            </span>
            <span className="block text-[10px] text-zinc-500">
              Botellas vendidas en total
            </span>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/10">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Active pending deliveries */}
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="block text-[10px] uppercase font-mono tracking-widest text-zinc-500">
              Por Despachar
            </span>
            <span className="block text-2xl font-extrabold text-zinc-100 font-mono">
              {pendingDeliveries} <span className="text-sm font-normal text-zinc-500">pedidos</span>
            </span>
            <span className="block text-[10px] text-zinc-400">
              Esperando recolección de Courier
            </span>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/10">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Fulfillment rate */}
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="block text-[10px] uppercase font-mono tracking-widest text-zinc-500">
              Tasa de Envío
            </span>
            <span className="block text-2xl font-extrabold text-zinc-100 font-mono">
              {dispatchSuccessRate}%
            </span>
            <span className="block text-[10px] text-emerald-400">
              Pedidos procesados sin demoras
            </span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/10">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. CORE VISUAL GRAPH: SALES REPORT CHART */}
      {orders.length > 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6" id="bestseller-beers-charts-panel">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="text-base font-bold text-zinc-100">Bestsellers: Cervezas Más Vendidas</h3>
              <p className="text-xs text-zinc-500">Visualiza la demanda de botellas según su comportamiento histórico.</p>
            </div>
          </div>

          {/* Sizable Horizontal bars using React pure styled div blocks */}
          <div className="space-y-4">
            {beerSalesData.map((data, index) => {
              const widthPct = (data.qty / maxQtySold) * 100;
              
              // Styles category tags
              const categoryBarType: Record<string, string> = {
                IPA: 'bg-emerald-500 shadow-emerald-500/10',
                Stout: 'bg-stone-500 shadow-stone-500/10',
                Lager: 'bg-amber-500 shadow-amber-500/10',
                Amber: 'bg-red-500 shadow-red-500/10',
                Belgian: 'bg-purple-500 shadow-purple-500/10',
              };

              return (
                <div key={data.name} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs font-medium">
                  {/* Label */}
                  <div className="sm:w-48 truncate text-zinc-300 flex items-center gap-2">
                    <span className="text-[10px] text-zinc-500 font-mono w-4 shrink-0">#{index+1}</span>
                    <span className="font-bold truncate">{data.name}</span>
                  </div>

                  {/* Progressive Bar */}
                  <div className="flex-1 bg-zinc-950 h-5 rounded overflow-hidden flex items-center relative border border-zinc-800">
                    <div
                      className={`h-full ${categoryBarType[data.category] || 'bg-amber-500'} rounded-r transition-all duration-700`}
                      style={{ width: `${widthPct}%` }}
                    />
                    <span className="absolute left-3 text-[10px] font-mono text-zinc-100 font-bold drop-shadow-md">
                      {data.qty} Botellas ({formatCLP(data.revenue)})
                    </span>
                  </div>

                  {/* Style Badge */}
                  <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] rounded bg-zinc-800 text-zinc-400 font-mono h-fit">
                    {data.category}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl text-center space-y-4" id="empty-orders-seed-prompt">
          <div className="inline-flex p-3 bg-zinc-950 text-zinc-500 rounded-full border border-zinc-800">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-zinc-200 font-bold">No se registran datos de ventas</h4>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              Simula compras como cliente o pulsa el botón inferior para poblar la base de datos local con transacciones aleatorias e históricas de prueba.
            </p>
          </div>
          <button
            onClick={handleGenerateSeedOrders}
            className="cursor-pointer py-2.5 px-5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-sm rounded-xl transition shadow-lg shadow-amber-500/10"
          >
            Generar Ventas Históricas de Simulación
          </button>
        </div>
      )}

      {/* 3. DETAILED ORDER ARCHIVE LIST */}
      {orders.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden" id="orders-report-history">
          {/* Header row with filters */}
          <div className="px-6 py-5 border-b border-zinc-800 bg-zinc-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-zinc-100">Bitácora de Pedidos & Despachos</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Control de SLAs logísticos de entrega, notas del cliente y despacho.</p>
            </div>

            {/* Filter buttons */}
            <div className="flex gap-1 bg-zinc-950 border border-zinc-800 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setStatusFilter('All')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  statusFilter === 'All' ? 'bg-amber-500 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Todos ({orders.length})
              </button>
              <button
                onClick={() => setStatusFilter('Pendiente')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  statusFilter === 'Pendiente' ? 'bg-rose-500 text-white font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Pendiente ({orders.filter(o => o.status === 'Pendiente').length})
              </button>
              <button
                onClick={() => setStatusFilter('Despachado')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  statusFilter === 'Despachado' ? 'bg-blue-500 text-white font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Despachados
              </button>
              <button
                onClick={() => setStatusFilter('Entregado')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  statusFilter === 'Entregado' ? 'bg-emerald-500 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Entregados
              </button>
            </div>
          </div>

          {/* Orders timeline */}
          <div className="divide-y divide-zinc-800">
            {filteredOrders.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-xs">
                No hay pedidos en esta categoría en este momento.
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div key={order.id} id={`admin-order-box-${order.id}`} className="p-6 hover:bg-zinc-950/10 transition flex flex-col lg:flex-row gap-6 justify-between">
                  {/* Left column: order meta & products */}
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 text-xs font-mono font-bold bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300">
                        {order.id}
                      </span>
                      <span className="text-xs text-zinc-500 font-mono">
                        {new Date(order.date).toLocaleString('es-CL')}
                      </span>
                    </div>

                    {/* Products details */}
                    <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800/80 w-fit max-w-full">
                      <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 block mb-1">
                        Cajas / Botellas
                      </span>
                      <ul className="text-xs space-y-1 divide-y divide-zinc-900">
                        {order.items.map((item) => (
                          <li key={item.product.id} className="text-zinc-300 py-1 flex items-center justify-between gap-12">
                            <span>
                              {item.product.name} ({item.product.volume})
                            </span>
                            <span className="font-mono text-zinc-100 font-bold">
                              x{item.quantity}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Customer specs details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-zinc-400">
                      <div>
                        <span className="text-zinc-500 font-bold uppercase tracking-wide text-[10px] block">Cliente</span>
                        <p className="text-zinc-200 font-bold">{order.shippingDetails.fullName}</p>
                        <p>{order.shippingDetails.email} • +56 {order.shippingDetails.phone}</p>
                      </div>
                      <div>
                        <span className="text-zinc-500 font-bold uppercase tracking-wide text-[10px] block">Destino</span>
                        <p className="text-zinc-200 font-bold">{order.shippingDetails.address}</p>
                        <p className="capitalize">Comuna: {order.shippingDetails.commune}</p>
                      </div>
                    </div>

                    {order.shippingDetails.notes && (
                      <div className="text-xs border-l-2 border-amber-500/40 pl-3 py-0.5 text-zinc-400 italic">
                        "{order.shippingDetails.notes}"
                      </div>
                    )}
                  </div>

                  {/* Right column: finances & status drivers */}
                  <div className="lg:text-right flex flex-row lg:flex-col justify-between items-start lg:items-end gap-4 border-t border-zinc-800 lg:border-t-0 pt-4 lg:pt-0 shrink-0 select-none">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 block">
                        Total Factura
                      </span>
                      <span className="text-xl font-black text-zinc-100 font-mono">
                        {formatCLP(order.total)}
                      </span>
                      <span className="block text-[10px] text-zinc-500 font-mono">
                        Prod: {formatCLP(order.subtotal)} | Ftl: {order.shippingCost === 0 ? 'Gratis' : formatCLP(order.shippingCost)}
                      </span>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-wrap lg:justify-end gap-2 items-center">
                      {/* JSON export logs */}
                      <button
                        onClick={() => copyDispatchLogistics(order)}
                        className="p-2 bg-zinc-805 hover:bg-zinc-800 hover:text-white border border-zinc-800 rounded-lg text-[11px] font-mono text-zinc-400 flex items-center gap-1 transition cursor-pointer"
                        title="Copiar JSON Logística para Despacho"
                      >
                        {copiedPayloadId === order.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            Copiado
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Despacho JSON
                          </>
                        )}
                      </button>

                      {/* Current Status pill & Toggles */}
                      {order.status === 'Pendiente' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'Despachado')}
                          className="px-3 py-1.5 cursor-pointer bg-rose-500 hover:bg-rose-400 text-white hover:scale-105 active:scale-95 transition text-[11px] font-bold rounded-lg flex items-center gap-1"
                        >
                          <Truck className="w-3.5 h-3.5 animate-bounce" />
                          Despachar Ahora
                        </button>
                      )}

                      {order.status === 'Despachado' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'Entregado')}
                          className="px-3 py-1.5 cursor-pointer bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[11px] font-bold transition flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Marcar Recibido
                        </button>
                      )}

                      {order.status === 'Entregado' && (
                        <span className="px-3 py-1.5 bg-emerald-505/10 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-[11px] font-bold flex items-center gap-1">
                          <PackageCheck className="w-3.5 h-3.5" />
                          Entregado Con Éxito
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
