/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';
import { formatCLP } from './ProductCard';
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Settings,
  Package,
  Layers,
  Sparkles,
  Percent,
  HelpCircle,
  Truck,
  RotateCcw,
  PlusCircle
} from 'lucide-react';

export const ProductAdmin: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    shippingConfig,
    updateShippingConfig,
  } = useStore();

  // Mode controllers
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state for editing/adding
  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '',
    tagline: '',
    description: '',
    category: 'IPA',
    price: 3000,
    stock: 50,
    image: '',
    abv: 5.0,
    ibu: 25,
    volume: '330cc',
  });

  // Shipping config edits
  const [shipCostInput, setShipCostInput] = useState(shippingConfig.basePrice);
  const [shipLimitInput, setShipLimitInput] = useState(shippingConfig.freeShippingThreshold);
  const [isSavingShip, setIsSavingShip] = useState(false);

  // Commune custom shipping states
  const [communesLocal, setCommunesLocal] = useState<{ name: string; price: number }[]>(
    shippingConfig.communes || []
  );
  const [newCommuneName, setNewCommuneName] = useState('');
  const [newCommunePrice, setNewCommunePrice] = useState(3000);

  // Sync commune with loaded shippingConfig from DB
  React.useEffect(() => {
    if (shippingConfig.communes) {
      setCommunesLocal(shippingConfig.communes);
    }
  }, [shippingConfig]);

  // Quick Inline Stock Update state
  const [quickStockEdit, setQuickStockEdit] = useState<{ id: string; stock: number } | null>(null);

  // Local hidden state for checkboxes until saved
  const [localHidden, setLocalHidden] = useState<Record<string, boolean>>({});
  const [isSavingHidden, setIsSavingHidden] = useState(false);

  // Sync with product changes from DB
  React.useEffect(() => {
    const initialHidden: Record<string, boolean> = {};
    products.forEach((p) => {
      initialHidden[p.id] = !!p.hidden;
    });
    setLocalHidden(initialHidden);
  }, [products]);

  const saveHiddenChanges = async () => {
    setIsSavingHidden(true);
    let anyError = false;
    for (const p of products) {
      const isCurrentlyHidden = localHidden[p.id] !== undefined ? localHidden[p.id] : !!p.hidden;
      if (isCurrentlyHidden !== !!p.hidden) {
        const success = await updateProduct(p.id, {
          ...p,
          hidden: isCurrentlyHidden,
        });
        if (!success) anyError = true;
      }
    }
    setIsSavingHidden(false);
    if (!anyError) {
      // Show success feedback
    }
  };

  // Check if there are any pending hidden changes
  const hasHiddenChanges = products.some((p) => {
    const currentLocal = localHidden[p.id] !== undefined ? localHidden[p.id] : !!p.hidden;
    return currentLocal !== !!p.hidden;
  });

  const resetForm = () => {
    setFormData({
      name: '',
      tagline: '',
      description: '',
      category: 'IPA',
      price: 3000,
      stock: 50,
      image: 'https://images.unsplash.com/photo-1532634922-8fe0b757fb13?auto=format&fit=crop&q=80&w=600',
      abv: 5.0,
      ibu: 25,
      volume: '330cc',
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    // Parse values to appropriate types
    const isNumberField = ['price', 'stock', 'abv', 'ibu'].includes(name);
    setFormData((prev) => ({
      ...prev,
      [name]: isNumberField ? parseFloat(value) || 0 : value,
    }));
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.description) return;
    
    // Set fallback high-quality stock photo if empty images
    let verifiedImg = formData.image;
    if (!verifiedImg) {
      if (formData.category === 'IPA') verifiedImg = 'https://images.unsplash.com/photo-1532634922-8fe0b757fb13?auto=format&fit=crop&q=80&w=600';
      else if (formData.category === 'Stout') verifiedImg = 'https://images.unsplash.com/photo-1584225065152-4a1454aa3d4e?auto=format&fit=crop&q=80&w=600';
      else if (formData.category === 'Lager') verifiedImg = 'https://images.unsplash.com/photo-1566633806327-68e152aaf26d?auto=format&fit=crop&q=80&w=600';
      else verifiedImg = 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=600';
    }

    addProduct({
      ...formData,
      image: verifiedImg
    });
    setIsAddingNew(false);
    resetForm();
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      tagline: product.tagline,
      description: product.description,
      category: product.category,
      price: product.price,
      stock: product.stock,
      image: product.image,
      abv: product.abv,
      ibu: product.ibu,
      volume: product.volume,
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    updateProduct(editingId, {
      ...formData,
      id: editingId,
    });
    setEditingId(null);
    resetForm();
  };

  const saveQuickStock = (product: Product) => {
    if (!quickStockEdit || quickStockEdit.id !== product.id) return;
    updateProduct(product.id, {
      ...product,
      stock: quickStockEdit.stock,
    });
    setQuickStockEdit(null);
  };

  const updateShippingDetails = () => {
    updateShippingConfig({
      basePrice: shipCostInput ?? 3500,
      freeShippingThreshold: shipLimitInput ?? 25000,
      communes: communesLocal,
    });
    setIsSavingShip(true);
    setTimeout(() => setIsSavingShip(false), 1200);
  };

  return (
    <div className="space-y-8" id="product-admin-panel">
      {/* Dynamic Actions & Shipping settings row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="admin-top-controls">
        {/* New Item Launcher */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <span className="p-2 bg-amber-500/10 text-amber-400 rounded-lg inline-block mb-3">
              <Package className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold text-zinc-100">Catálogo de Cervezas</h3>
            <p className="text-sm text-zinc-400 mt-1">
              Agrega nuevas recetas exclusivas, regula graduación alcohólica (ABV), amargor (IBU) y unidades en bodega.
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setIsAddingNew(true);
              setEditingId(null);
            }}
            id="launch-add-beer"
            className="mt-6 w-full cursor-pointer py-3 px-4 bg-amber-500 hover:bg-amber-400 font-bold rounded-xl text-xs text-zinc-950 flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-amber-500/10"
          >
            <PlusCircle className="w-4 h-4" />
            Agregar Nueva Cerveza
          </button>
        </div>

        {/* Global Despacho / Shipping configurations */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl col-span-2">
          <div className="flex items-center gap-2.5 mb-2">
            <Truck className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-bold text-zinc-100">Configuración de Despacho</h3>
          </div>
          <p className="text-xs text-zinc-400">
            Establece los costos de logística y el umbral de facturación que califica para el envío gratuito automático de tus pedidos.
          </p>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Costo Base Despacho (CLP)</label>
              <input
                type="number"
                value={shipCostInput}
                onChange={(e) => setShipCostInput(parseInt(e.target.value) || 0)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-300 focus:outline-none focus:border-amber-500 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Mínimo para Envío Gratis (CLP)</label>
              <input
                type="number"
                value={shipLimitInput}
                onChange={(e) => setShipLimitInput(parseInt(e.target.value) || 0)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-300 focus:outline-none focus:border-amber-500 text-sm font-mono"
              />
            </div>
          </div>

          {/* List and add communes */}
          <div className="mt-6 border-t border-zinc-800/80 pt-5 space-y-4">
            <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-amber-500" /> Gestión por Comunas y Tarifas
            </h4>
            
            {/* Form to add a new commune */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Nombre Comuna</label>
                <input
                  type="text"
                  placeholder="Ej: Curicó"
                  value={newCommuneName}
                  onChange={(e) => setNewCommuneName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-300 focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Costo Despacho (CLP)</label>
                <input
                  type="number"
                  placeholder="Ej: 3000"
                  value={newCommunePrice}
                  onChange={(e) => setNewCommunePrice(parseInt(e.target.value) || 0)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-300 focus:outline-none focus:border-amber-500 text-xs font-mono"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!newCommuneName.trim()) return;
                  // Check duplicate
                  if (communesLocal.some(c => c.name.toLowerCase() === newCommuneName.trim().toLowerCase())) {
                    alert('Esta comuna ya está agregada');
                    return;
                  }
                  setCommunesLocal([...communesLocal, { name: newCommuneName.trim(), price: newCommunePrice }]);
                  setNewCommuneName('');
                }}
                className="w-full py-2 bg-amber-500/10 hover:bg-amber-500 hover:text-zinc-950 text-amber-400 font-bold rounded-xl text-xs transition border border-amber-500/10 cursor-pointer"
              >
                + Añadir Comuna
              </button>
            </div>

            {/* List of current communes */}
            {communesLocal.length === 0 ? (
              <p className="text-xs text-zinc-500 italic">No hay comunas específicas configuradas. Se aplicará costo base.</p>
            ) : (
              <div className="max-h-48 overflow-y-auto border border-zinc-850 bg-zinc-950/40 rounded-xl p-3 divide-y divide-zinc-800/50 space-y-2.5">
                {communesLocal.map((c, idx) => (
                  <div key={idx} className="flex items-center justify-between pt-2.5 first:pt-0">
                    <span className="text-xs font-medium text-zinc-350">{c.name}</span>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={c.price}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          const updated = [...communesLocal];
                          updated[idx].price = val;
                          setCommunesLocal(updated);
                        }}
                        className="w-24 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-zinc-300 text-xs text-right font-mono focus:border-amber-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setCommunesLocal(communesLocal.filter((_, i) => i !== idx));
                        }}
                        className="p-1 hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400 rounded transition cursor-pointer"
                        title="Eliminar Comuna"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={updateShippingDetails}
              id="save-shipping-fees"
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 hover:text-white border border-zinc-700 text-zinc-300 font-bold rounded-lg text-xs transition flex items-center gap-1 cursor-pointer"
            >
              {isSavingShip ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Guardado
                </>
              ) : (
                'Aplicar Tarifas'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* FORM: ADD OR EDIT PRODUCT MODAL OVERLAY */}
      {(isAddingNew || editingId) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 overflow-y-auto">
          <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/60">
              <h3 className="text-lg font-bold text-zinc-100">
                {isAddingNew ? 'Establecer Receta de Nueva Cerveza' : `Editar Cerveza: ${formData.name}`}
              </h3>
              <button
                onClick={() => {
                  setIsAddingNew(false);
                  setEditingId(null);
                }}
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={isAddingNew ? handleAddSubmit : handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Product Name */}
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Nombre de la Cerveza *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ej. Austral Calafate, Foggy IPA"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-300 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Tagline */}
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Frase Descriptiva Corta *</label>
                  <input
                    type="text"
                    name="tagline"
                    required
                    value={formData.tagline}
                    onChange={handleInputChange}
                    placeholder="Ej. Sutil amargor herbal con regusto cítrico"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-300 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Estilo de Cerveza *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-300 text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="IPA">IPA</option>
                    <option value="Stout">Stout</option>
                    <option value="Lager">Lager</option>
                    <option value="Amber">Amber Ale</option>
                    <option value="Belgian">Belgian Strong</option>
                  </select>
                </div>

                {/* Volume */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Formato / Volumen *</label>
                  <input
                    type="text"
                    name="volume"
                    required
                    value={formData.volume}
                    onChange={handleInputChange}
                    placeholder="Ej. 330cc, 470cc, Botella 500ml"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-300 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Precio Unitario ($ CLP) *</label>
                  <input
                    type="number"
                    name="price"
                    required
                    min={0}
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-300 text-sm font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Stock limit */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Stock de Bodega Inicial *</label>
                  <input
                    type="number"
                    name="stock"
                    required
                    min={0}
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-300 text-sm font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* ABV */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Grados de Alcohol (% ABV)</label>
                  <input
                    type="number"
                    name="abv"
                    step="0.1"
                    min={0}
                    value={formData.abv}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-300 text-sm font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* IBU */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Amargor (IBU)</label>
                  <input
                    type="number"
                    name="ibu"
                    min={0}
                    value={formData.ibu}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-300 text-sm font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Image URL */}
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Enlace de Imagen (URL de foto u optimizada)</label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="https://ejemplo.com/beers/premium.jpg"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-300 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Detailed Description */}
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Descripción de Catálogo *</label>
                  <textarea
                    name="description"
                    required
                    rows={3}
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Escribe todas las notas organolépticas, maltas utilizadas, lúpulos aromáticos y maridaje sugerido..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-300 text-sm resize-none focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Action buttons footer inside form modal */}
              <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3 font-semibold text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingId(null);
                  }}
                  className="px-4 py-2.5 border border-zinc-800 hover:bg-zinc-800 rounded-lg text-zinc-400 text-center transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-lg text-center font-bold shadow-lg shadow-amber-500/10 cursor-pointer"
                >
                  {isAddingNew ? 'Crear Producto' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CORE INVENTORY TABLE */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden" id="inventory-table-container">
        <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/20">
          <div>
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <Layers className="w-4.5 h-4.5 text-amber-500" />
              Inventario de Barriles & Botellas
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">Maneja directamente los precios, stock en bodega y ediciones rápidas.</p>
          </div>
          <span className="text-[11px] font-mono font-bold bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full border border-zinc-700">
            Total recetas: {products.length}
          </span>
        </div>

        {hasHiddenChanges && (
          <div className="bg-amber-500/10 border-b border-zinc-800 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0"></span>
              <p className="text-xs text-amber-350 font-medium">
                Tienes cambios de visibilidad pendientes. Haz clic en "Guardar Ocultamientos" para aplicarlos en la tienda.
              </p>
            </div>
            <button
              onClick={saveHiddenChanges}
              disabled={isSavingHidden}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-bold text-[11px] uppercase tracking-wider rounded-lg transition-all shadow-md shadow-amber-500/10 shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              {isSavingHidden ? (
                <>
                  <Check className="w-3.5 h-3.5 animate-spin" /> Guardando...
                </>
              ) : (
                'Guardar Ocultamientos'
              )}
            </button>
          </div>
        )}

        {/* Listing block */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm text-zinc-400">
            <thead>
              <tr className="border-b border-zinc-800 text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 bg-zinc-950/40">
                <th className="py-4 px-6">Cerveza / Formato</th>
                <th className="py-4 px-6">Estilo</th>
                <th className="py-4 px-6 text-right">Precio unitario</th>
                <th className="py-4 px-6 text-center">Grados & IBU</th>
                <th className="py-4 px-6 text-center">Stock Bodega</th>
                <th className="py-4 px-6 text-center">Ocultar variedad</th>
                <th className="py-4 px-6 text-right">Controles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-medium">
              {products.map((prod) => {
                const isQuickEditing = quickStockEdit && quickStockEdit.id === prod.id;
                
                return (
                  <tr key={prod.id} id={`admin-row-${prod.id}`} className="hover:bg-zinc-950/20 transition-all">
                    {/* Visual details */}
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-12 h-10 object-cover rounded bg-zinc-950 border border-zinc-800"
                        />
                        <div>
                          <span className="block font-bold text-zinc-100">{prod.name}</span>
                          <span className="block text-[11px] text-zinc-500 font-mono italic">
                            Vol: {prod.volume}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-6">
                      <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {prod.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-6 text-right font-mono text-zinc-200">
                      {formatCLP(prod.price)}
                    </td>

                    {/* Specifications */}
                    <td className="py-3 px-6 text-center font-mono text-xs text-zinc-500">
                      {prod.abv}% ABV / {prod.ibu} IBU
                    </td>

                    {/* Editable stock */}
                    <td className="py-3 px-6 text-center">
                      {isQuickEditing ? (
                        <div className="flex items-center justify-center gap-1.5 mx-auto">
                          <input
                            type="number"
                            min={0}
                            value={quickStockEdit.stock}
                            onChange={(e) =>
                              setQuickStockEdit({ id: prod.id, stock: parseInt(e.target.value) || 0 })
                            }
                            className="w-16 bg-zinc-950 border border-amber-500 rounded px-2 py-1 text-center font-mono text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                          <button
                            onClick={() => saveQuickStock(prod)}
                            className="p-1 cursor-pointer bg-emerald-500/10 text-emerald-400 rounded hover:bg-emerald-500 hover:text-zinc-950 transition"
                            title="Confirmar"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setQuickStockEdit(null)}
                            className="p-1 cursor-pointer bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 rounded transition"
                            title="Descartar"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <span
                            className={`font-mono text-sm font-bold ${
                              prod.stock === 0
                                ? 'text-rose-500'
                                : prod.stock < 15
                                ? 'text-amber-500'
                                : 'text-zinc-300'
                            }`}
                          >
                            {prod.stock}
                          </span>
                          <button
                            onClick={() => setQuickStockEdit({ id: prod.id, stock: prod.stock })}
                            className="text-[10px] uppercase font-mono font-bold tracking-wider text-zinc-500 hover:text-amber-500 transition cursor-pointer"
                          >
                            [Edit]
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Hide variety checkbox toggle */}
                    <td className="py-3 px-6 text-center">
                      <div className="flex items-center justify-center">
                        <label className="relative flex items-center justify-center cursor-pointer group" htmlFor={`hide-chk-${prod.id}`}>
                          <input
                            type="checkbox"
                            id={`hide-chk-${prod.id}`}
                            checked={localHidden[prod.id] !== undefined ? localHidden[prod.id] : !!prod.hidden}
                            onChange={() => {
                              setLocalHidden((prev) => ({
                                ...prev,
                                [prod.id]: !(localHidden[prod.id] !== undefined ? localHidden[prod.id] : !!prod.hidden),
                              }));
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-5 h-5 bg-zinc-950 border border-zinc-700 hover:border-amber-500 rounded flex items-center justify-center transition-all peer-checked:bg-amber-500 peer-checked:border-amber-500 text-zinc-950">
                            <Check className="w-3.5 h-3.5 opacity-0 peer-checked:opacity-100 transition-opacity stroke-[3px]" />
                          </div>
                        </label>
                      </div>
                    </td>

                    {/* Operational controls */}
                    <td className="py-3 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => startEdit(prod)}
                          className="p-1.5 cursor-pointer bg-zinc-800 hover:bg-zinc-700 hover:text-white rounded text-zinc-400 transition"
                          title="Editar Ficha"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`¿Estás seguro de eliminar "${prod.name}" de la tienda?`)) {
                              deleteProduct(prod.id);
                            }
                          }}
                          className="p-1.5 cursor-pointer bg-zinc-800/50 hover:bg-rose-500/15 hover:text-rose-400 rounded text-zinc-500 transition"
                          title="Eliminar cerveza"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
