/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Download,
  Trash2,
  Edit,
  UserPlus,
  X,
  Check,
  ChevronDown,
  ShoppingBag,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { formatCLP } from './ProductCard';

interface ClientExtended {
  email: string;
  fullName: string;
  phone: string;
  address: string;
  rawAddress?: string;
  rawCommune?: string;
  totalOrdersCount: number;
  spentAmount: number;
}

export const ClientsAdmin: React.FC = () => {
  const [clients, setClients] = useState<ClientExtended[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal / Form state
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [activeClient, setActiveClient] = useState<Partial<ClientExtended> | null>(null);
  
  // Form fields
  const [formEmail, setFormEmail] = useState('');
  const [formFullName, setFormFullName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formCommune, setFormCommune] = useState('');

  // Fetch clients from our persistent server-side DB
  const fetchClients = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/clients');
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      } else {
        setError('Error al obtener el listado persistente de clientes.');
      }
    } catch (err) {
      setError('Error de conexión con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Save changes (Edit or New Client)
  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail.trim() || !formFullName.trim()) {
      alert('El correo y nombre completo son campos obligatorios.');
      return;
    }

    setIsSaving(true);
    try {
      // Build updated list
      let updatedList = [...clients];
      
      const newClientObj = {
        email: formEmail.toLowerCase().trim(),
        fullName: formFullName.trim(),
        phone: formPhone.trim(),
        address: formAddress.trim(),
        commune: formCommune.trim()
      };

      if (isAdding) {
        // Prevent duplicate emails
        const exists = clients.some(c => c.email.toLowerCase().trim() === newClientObj.email);
        if (exists) {
          alert('Ya existe un cliente registrado con este correo electrónico.');
          setIsSaving(false);
          return;
        }
        
        // Add to our frontend list temporarily before server save
        updatedList.push({
          ...newClientObj,
          totalOrdersCount: 0,
          spentAmount: 0
        });
      } else if (isEditing && activeClient) {
        // Replace matching email client (we align on the key)
        updatedList = updatedList.map(c => 
          c.email.toLowerCase().trim() === activeClient.email?.toLowerCase().trim()
            ? { ...c, ...newClientObj }
            : c
        );
      }

      // Convert backend structure (rawAddress, rawCommune fields are handled dynamically)
      const payload = updatedList.map((c) => ({
        email: c.email.toLowerCase().trim(),
        fullName: c.fullName,
        phone: c.phone,
        address: c.rawAddress || c.address.replace(`, ${c.rawCommune || ''}`, '').split(',')[0].trim(),
        commune: c.rawCommune || c.address.split(',').pop()?.trim() || ''
      }));

      // Flush to server database
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        // Reload fresh from server database to resolve correct metrics on-the-fly
        await fetchClients();
        setIsAdding(false);
        setIsEditing(false);
        setActiveClient(null);
      } else {
        alert('Ocurrió un error al guardar los cambios del cliente en la base de datos.');
      }
    } catch (err) {
      alert('Error de red al guardar datos de clientes.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete matching client
  const handleDeleteClient = async (email: string) => {
    if (!confirm(`¿Está seguro que desea eliminar permanentemente al cliente con correo ${email}?`)) {
      return;
    }

    setIsSaving(true);
    try {
      const updatedList = clients.filter(c => c.email.toLowerCase().trim() !== email.toLowerCase().trim());
      
      const payload = updatedList.map((c) => ({
        email: c.email.toLowerCase().trim(),
        fullName: c.fullName,
        phone: c.phone,
        address: c.rawAddress || c.address.replace(`, ${c.rawCommune || ''}`, '').split(',')[0].trim(),
        commune: c.rawCommune || c.address.split(',').pop()?.trim() || ''
      }));

      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        await fetchClients();
      } else {
        alert('Error al intentar eliminar el cliente del listado de base de datos.');
      }
    } catch (err) {
      alert('Fallo de conexión al eliminar cliente.');
    } finally {
      setIsSaving(false);
    }
  };

  // Trigger Adding Modal Setup
  const triggerAddModal = () => {
    setFormEmail('');
    setFormFullName('');
    setFormPhone('');
    setFormAddress('');
    setFormCommune('');
    setIsAdding(true);
    setIsEditing(false);
  };

  // Trigger Editing Modal Setup
  const triggerEditModal = (client: ClientExtended) => {
    setActiveClient(client);
    setFormEmail(client.email);
    setFormFullName(client.fullName);
    setFormPhone(client.phone);
    
    // Autofill address and commune raw components correctly
    setFormAddress(client.rawAddress || client.address.split(',')[0].trim());
    setFormCommune(client.rawCommune || client.address.split(',').pop()?.trim() || '');

    setIsEditing(true);
    setIsAdding(false);
  };

  // Filter clients based on search state
  const filteredClients = clients.filter((c) => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return true;
    return (
      c.fullName.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      c.phone.toLowerCase().includes(term) ||
      c.address.toLowerCase().includes(term)
    );
  });

  // Export visible list to beautifully escaped standard CSV with BOM
  const handleExportCSV = () => {
    const csvHeaders = ["Email", "Nombre Completo", "Celular", "Direccion completa", "Cantidad de Compras", "Inversion Total en Kolchawwe"];
    const csvRows = filteredClients.map((c) => [
      c.email,
      c.fullName,
      c.phone,
      c.address,
      c.totalOrdersCount,
      c.spentAmount
    ]);

    const csvContent = [csvHeaders.join(","), ...csvRows.map((e) => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Clientes_Kolchawwe_Export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalClientsCount = filteredClients.length;
  const totalCombinedSpend = filteredClients.reduce((sum, c) => sum + c.spentAmount, 0);

  return (
    <div className="space-y-6" id="clients-management-module">
      
      {/* 1. Header Metrics Card layout */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="clients-stats-row">
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="block text-[10px] uppercase font-mono tracking-widest text-zinc-500">
              Clientes Totales
            </span>
            <span className="block text-2xl font-extrabold text-zinc-100 font-mono">
              {clients.length} <span className="text-xs font-normal text-zinc-500">personas</span>
            </span>
          </div>
          <div className="p-3 bg-zinc-950 text-amber-500 rounded-xl border border-zinc-800">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="block text-[10px] uppercase font-mono tracking-widest text-zinc-500">
              Coincidencias de Búsqueda
            </span>
            <span className="block text-2xl font-extrabold text-amber-400 font-mono">
              {totalClientsCount}
            </span>
          </div>
          <div className="p-3 bg-zinc-950 text-amber-400 rounded-xl border border-zinc-800">
            <Search className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="block text-[10px] uppercase font-mono tracking-widest text-zinc-500">
              Consumo Total Coincidencias
            </span>
            <span className="block text-2xl font-extrabold text-emerald-400 font-mono">
              {formatCLP(totalCombinedSpend)}
            </span>
          </div>
          <div className="p-3 bg-zinc-950 text-emerald-400 rounded-xl border border-zinc-800">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. Top Controls & Actions bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search bar input constraint */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por nombre, correo, teléfono..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 text-zinc-100 placeholder-zinc-500 pl-10 pr-4 py-2 text-xs border border-zinc-800 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-zinc-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Buttons trigger */}
        <div className="flex gap-2 w-full md:w-auto shrink-0 justify-end">
          <button
            onClick={handleExportCSV}
            disabled={totalClientsCount === 0}
            className="cursor-pointer flex items-center gap-1.5 py-2 px-4 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-100 font-bold text-xs rounded-xl transition border border-zinc-800"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar CSV
          </button>
          <button
            onClick={triggerAddModal}
            className="cursor-pointer flex items-center gap-1.5 py-2 px-4 bg-gradient-to-r from-gold-400 to-gold-600 text-zinc-950 font-bold text-xs rounded-xl hover:scale-105 active:scale-95 transition"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Agregar Cliente
          </button>
        </div>
      </div>

      {/* 3. Main Data Presentation Table or Empty prompt */}
      {isLoading ? (
        <div className="py-20 text-center text-zinc-400 text-xs flex flex-col items-center justify-center gap-3">
          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          Obteniendo el listado de compradores de la base de datos...
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-zinc-900 border border-zinc-800 rounded-2xl text-red-400 text-xs flex items-center justify-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          {error}
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="p-12 text-center bg-zinc-900 border border-zinc-800 rounded-2xl space-y-3">
          <Users className="w-8 h-8 mx-auto text-zinc-500" />
          <h4 className="text-zinc-200 font-bold">No se encontraron clientes</h4>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Intente cambiar la palabra de búsqueda o realice una compra de prueba en la tienda para sincronizar un cliente nuevo.
          </p>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          {/* Desktop Table View */}
          <div className="overflow-x-auto min-w-full hidden md:block">
            <table className="min-w-full divide-y divide-zinc-850 text-left text-xs">
              <thead className="bg-zinc-950/40 text-zinc-400 uppercase font-mono tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-4">Cliente / Nombre</th>
                  <th className="px-6 py-4">Contacto (Email / Tel)</th>
                  <th className="px-6 py-4">Dirección o Despacho</th>
                  <th className="px-6 py-4 text-center">Compras</th>
                  <th className="px-6 py-4 text-right">Inversión</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850 text-zinc-300">
                {filteredClients.map((client) => (
                  <tr key={client.email} className="hover:bg-zinc-950/20 transition-colors">
                    {/* Customer Identity */}
                    <td className="px-6 py-4 font-bold text-zinc-100">
                      {client.fullName}
                    </td>
                    
                    {/* Customer communication coordinates */}
                    <td className="px-6 py-4 font-mono space-y-0.5">
                      <span className="block text-zinc-300 text-xs">{client.email}</span>
                      <span className="block text-zinc-500 text-[11px] font-sans">
                        {client.phone ? `+56 ${client.phone}` : 'No registrado'}
                      </span>
                    </td>

                    {/* Customer active destination */}
                    <td className="px-6 py-4 max-w-xs truncate text-zinc-400">
                      {client.address || 'Sin dirección registrada'}
                    </td>

                    {/* Store Orders Stats badge */}
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px] font-bold">
                        {client.totalOrdersCount} ped.
                      </span>
                    </td>

                    {/* Monetary total aggregated */}
                    <td className="px-6 py-4 text-right font-mono font-bold text-emerald-400 text-xs">
                      {formatCLP(client.spentAmount)}
                    </td>

                    {/* Actions drivers */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => triggerEditModal(client)}
                          className="p-1.5 hover:text-white bg-zinc-950/45 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-zinc-400 transition cursor-pointer"
                          title="Editar Datos"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClient(client.email)}
                          className="p-1.5 hover:text-white bg-rose-950/20 hover:bg-rose-900/30 border border-rose-900/30 rounded-lg text-rose-400 transition cursor-pointer"
                          title="Eliminar de la lista"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile responsive Cards Grid layout */}
          <div className="block md:hidden divide-y divide-zinc-800 bg-zinc-900">
            {filteredClients.map((client) => (
              <div key={client.email} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h5 className="text-zinc-100 font-extrabold text-sm">{client.fullName}</h5>
                    <p className="text-zinc-400 text-xs font-mono">{client.email}</p>
                    <p className="text-zinc-500 text-xs mt-0.5">{client.phone ? `+56 ${client.phone}` : ''}</p>
                  </div>
                  <div className="text-right">
                    <span className="block text-emerald-400 font-mono font-bold text-sm">{formatCLP(client.spentAmount)}</span>
                    <span className="inline-block px-2 py-0.5 rounded bg-zinc-850 text-zinc-400 text-[9px] font-mono font-bold mt-1">
                      {client.totalOrdersCount} ped.
                    </span>
                  </div>
                </div>

                <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/60 text-xs text-zinc-400">
                  <span className="block text-[8px] uppercase tracking-wider text-zinc-500 mb-0.5 font-mono">Dirección</span>
                  {client.address || 'Sin dirección registrada'}
                </div>

                <div className="flex justify-end gap-1.5 pt-1">
                  <button
                    onClick={() => triggerEditModal(client)}
                    className="flex-1 py-2 bg-zinc-950/60 hover:bg-zinc-800 hover:text-white border border-zinc-800 rounded-lg text-zinc-400 transition cursor-pointer text-xs font-bold"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteClient(client.email)}
                    className="flex-1 py-2 bg-rose-950/20 hover:bg-rose-900/20 text-rose-400 hover:text-rose-300 border border-rose-900/40 rounded-lg transition cursor-pointer text-xs font-bold"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. MODAL DIALOGS - ADD / EDIT CLIENT */}
      {(isEditing || isAdding) && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-up" id="client-dialog-overlay">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/20">
              <h3 className="text-zinc-100 font-bold text-sm">
                {isAdding ? 'Agregar Nuevo Cliente' : 'Editar Datos de Cliente'}
              </h3>
              <button
                onClick={() => { setIsAdding(false); setIsEditing(false); setActiveClient(null); }}
                className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body form */}
            <form onSubmit={handleSaveClient} className="p-6 space-y-4">
              
              {/* Form errors */}
              {isAdding && (
                <div className="bg-zinc-950 text-[11px] text-zinc-500 p-2.5 rounded-lg border border-zinc-800">
                  ⚠️ El correo electrónico ingresado actuará como el identificador único del cliente compras.
                </div>
              )}

              {/* Email */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block">Correo Electrónico *</label>
                <input
                  type="email"
                  disabled={isEditing}
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full bg-zinc-950 text-zinc-100 placeholder-zinc-600 p-3 text-xs border border-zinc-800 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="ejemplo@correo.com"
                  required
                />
              </div>

              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block">Nombre Completo *</label>
                <input
                  type="text"
                  value={formFullName}
                  onChange={(e) => setFormFullName(e.target.value)}
                  className="w-full bg-zinc-950 text-zinc-100 placeholder-zinc-600 p-3 text-xs border border-zinc-800 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition"
                  placeholder="Juan Carlos Valenzuela"
                  required
                />
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block">Número de Celular</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-zinc-500 text-xs font-mono">+56</span>
                  <input
                    type="tel"
                    maxLength={9}
                    value={formPhone.replace('+56', '').trim()}
                    onChange={(e) => setFormPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-zinc-950 text-zinc-100 placeholder-zinc-600 p-3 pl-12 text-xs border border-zinc-800 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition"
                    placeholder="9 1234 5678"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block">Dirección de Despacho</label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full bg-zinc-950 text-zinc-100 placeholder-zinc-600 p-3 text-xs border border-zinc-800 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition"
                  placeholder="Avenida Alameda #5100"
                />
              </div>

              {/* Commune */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block">Comuna</label>
                <input
                  type="text"
                  value={formCommune}
                  onChange={(e) => setFormCommune(e.target.value)}
                  className="w-full bg-zinc-950 text-zinc-100 placeholder-zinc-600 p-3 text-xs border border-zinc-800 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition"
                  placeholder="San Fernando"
                />
              </div>

              {/* Modal buttons */}
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => { setIsAdding(false); setIsEditing(false); setActiveClient(null); }}
                  className="flex-1 py-3 text-zinc-300 bg-zinc-950 hover:bg-zinc-800 hover:text-white rounded-xl text-xs font-bold transition border border-zinc-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3 bg-gradient-to-r from-gold-400 to-gold-600 disabled:opacity-50 text-zinc-950 font-extrabold text-xs rounded-xl hover:scale-105 active:scale-95 transition cursor-pointer"
                >
                  {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
