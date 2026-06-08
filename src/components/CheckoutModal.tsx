/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ShippingDetails, Order } from '../types';
import { formatCLP } from './ProductCard';
import {
  X,
  Truck,
  CreditCard,
  CheckCircle2,
  Mail,
  User,
  MapPin,
  Phone,
  FileText,
  Lock,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Bell,
  HardDriveUpload,
  Copy,
  Check
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { cart, processCheckout, shippingConfig } = useStore();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form states - Step 1: Shipping Details
  const [shippingDetails, setShippingDetails] = useState<ShippingDetails>({
    fullName: '',
    email: '',
    address: '',
    commune: 'Valdivia',
    phone: '',
    notes: '',
  });

  // Credit Card states - Step 2: Payment
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
  });

  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [jsonCopied, setJsonCopied] = useState(false);

  if (!isOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const shippingCost = subtotal >= shippingConfig.freeShippingThreshold ? 0 : shippingConfig.basePrice;
  const total = subtotal + shippingCost;

  // Form changes
  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setShippingDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Add simple masks
    if (name === 'number') {
      const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
      const matches = v.match(/\d{4,16}/g);
      const match = (matches && matches[0]) || '';
      const parts = [];

      for (let i = 0, len = match.length; i < len; i += 4) {
        parts.push(match.substring(i, i + 4));
      }

      if (parts.length > 0) {
        setCardDetails(prev => ({ ...prev, number: parts.join(' ') }));
      } else {
        setCardDetails(prev => ({ ...prev, number: v }));
      }
    } else if (name === 'expiry') {
      const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
      if (v.length >= 2) {
        setCardDetails(prev => ({ ...prev, expiry: v.substring(0, 2) + '/' + v.substring(2, 4) }));
      } else {
        setCardDetails(prev => ({ ...prev, expiry: v }));
      }
    } else if (name === 'cvv') {
      const v = value.replace(/[^0-9]/gi, '');
      setCardDetails(prev => ({ ...prev, cvv: v.substring(0, 4) }));
    } else {
      setCardDetails(prev => ({ ...prev, [name]: value }));
    }
  };

  // Validators
  const validateShipping = (): boolean => {
    if (!shippingDetails.fullName.trim()) return false;
    if (!shippingDetails.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return false;
    if (!shippingDetails.address.trim()) return false;
    if (!shippingDetails.phone.trim()) return false;
    return true;
  };

  const validateCard = (): boolean => {
    const rawNum = cardDetails.number.replace(/\s/g, '');
    if (rawNum.length < 15) return false;
    if (!cardDetails.name.trim()) return false;
    if (!cardDetails.expiry.includes('/')) return false;
    if (cardDetails.cvv.length < 3) return false;
    return true;
  };

  // Submit flow
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateShipping()) {
      setErrorMessage('Por favor, completa correctamente todos los campos de despacho.');
      return;
    }
    setErrorMessage('');
    setStep(2);
  };

  const handleSimulatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCard()) {
      setErrorMessage('Por favor, ingresa los datos de tu tarjeta de crédito válidos.');
      return;
    }

    setErrorMessage('');
    setPaymentProcessing(true);

    // Simulate Webpay request lag
    setTimeout(() => {
      // Determine card brand
      const firstDigit = cardDetails.number.charAt(0);
      const brand = firstDigit === '4' ? 'Visa' : firstDigit === '5' ? 'Mastercard' : 'Webpay';

      const result = processCheckout(shippingDetails, brand);

      setPaymentProcessing(false);
      
      if (result.success && result.order) {
        setCreatedOrder(result.order);
        setStep(3);
      } else {
        setErrorMessage(result.error || 'Ocurrió un error procesando el pago. Intenta nuevamente.');
        setStep(1); // Go back to check stock or resolve
      }
    }, 2000);
  };

  const copyPayload = () => {
    if (!createdOrder) return;
    const jsonStr = JSON.stringify({
      version: "1.0",
      channel: "Ecommerce_API",
      event: "ORDER_CREATED_DISPATCH_REQ",
      timestamp: createdOrder.date,
      order: {
        id: createdOrder.id,
        subtotal: createdOrder.subtotal,
        shipping_cost: createdOrder.shippingCost,
        total_amount: createdOrder.total,
        payment: {
          gateway: "Webpay_Plus",
          token: createdOrder.paymentId,
          status: "AUTHORIZED_AND_CAPTURED"
        },
        courier: {
          assigned: "Chilexpress Express Delivery",
          tracking_id: `CX-${Math.floor(100000 + Math.random() * 900000)}CL`
        },
        customer: {
          name: createdOrder.shippingDetails.fullName,
          email: createdOrder.shippingDetails.email,
          phone: createdOrder.shippingDetails.phone,
          address: createdOrder.shippingDetails.address,
          commune: createdOrder.shippingDetails.commune
        },
        products: createdOrder.items.map(item => ({
          sku: item.product.id,
          name: item.product.name,
          qty: item.quantity,
          unit_price: item.product.price,
          total: item.product.price * item.quantity
        })),
        internal_notes: createdOrder.shippingDetails.notes || 'N/A'
      }
    }, null, 2);

    navigator.clipboard.writeText(jsonStr);
    setJsonCopied(true);
    setTimeout(() => setJsonCopied(false), 2000);
  };

  const communeOptions = [
    'Valdivia',
    'Santiago',
    'Las Condes',
    'Concepción',
    'Temuco',
    'Viña del Mar',
    'Antofagasta',
    'Puerto Montt',
    'La Serena',
    'Rancagua'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 overflow-y-auto" id="checkout-modal-root">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col my-8 overflow-hidden" id="checkout-modal-card">
        
        {/* Header (except success stage) */}
        {step !== 3 && (
          <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/60">
            <div>
              <h2 className="text-xl font-bold font-serif text-zinc-100 flex items-center gap-2">
                {step === 1 ? <Truck className="w-5 h-5 text-gold-400" /> : <CreditCard className="w-5 h-5 text-gold-400" />}
                {step === 1 ? 'Detalles de Despacho' : 'Pasarela de Pago Segura'}
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                {step === 1 ? 'Ingresa tus datos de envío para la entrega' : 'Transacción simulada vía Webpay API'}
              </p>
            </div>
            
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-805 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Dynamic content */}
        <div className="p-6 flex-1 overflow-y-auto">
          
          {/* Order Summary Widget on steps 1 and 2 */}
          {step !== 3 && (
            <div className="mb-6 p-4 rounded-xl bg-zinc-950 border border-gold-500/15">
              <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 block mb-2">
                Resumen de tu compra ({cart.length} productos)
              </span>
              <div className="max-h-24 overflow-y-auto divide-y divide-zinc-900 pr-1 text-sm space-y-1 font-sans">
                {cart.map(item => (
                  <div key={item.product.id} className="flex justify-between py-1 text-zinc-350">
                    <span>
                      <span className="font-serif">{item.product.name}</span> <span className="text-gold-450 font-mono font-bold">x{item.quantity}</span>
                    </span>
                    <span className="font-mono text-zinc-150">{formatCLP(item.product.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 mt-2 border-t border-zinc-800 flex justify-between text-base font-bold">
                <span className="text-zinc-400 font-serif">Total Cifrado:</span>
                <span className="text-gold-400 font-serif text-lg">{formatCLP(total)}</span>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-xl">
              {errorMessage}
            </div>
          )}
                {/* STEP 1: SHIPPING INFORMATION */}
          {step === 1 && (
            <form onSubmit={handleProceedToPayment} className="space-y-4" id="shipping-form">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full name */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-gold-450" /> Nombre Completo *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={shippingDetails.fullName}
                    onChange={handleShippingChange}
                    placeholder="Ej: Juan Pérez"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-200 placeholder-zinc-650 focus:outline-none focus:border-gold-500 transition-colors text-sm"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-gold-450" /> Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={shippingDetails.email}
                    onChange={handleShippingChange}
                    placeholder="juan@ejemplo.com"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-200 placeholder-zinc-650 focus:outline-none focus:border-gold-500 transition-colors text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Address */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gold-450" /> Dirección Calle e Intersección *
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={shippingDetails.address}
                    onChange={handleShippingChange}
                    placeholder="Ej: Av. Alemania 450, Depto 22B"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-200 placeholder-zinc-655 focus:outline-none focus:border-gold-500 transition-colors text-sm"
                  />
                </div>

                {/* Commune */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gold-450" /> Comuna de Despacho *
                  </label>
                  <select
                    name="commune"
                    value={shippingDetails.commune}
                    onChange={handleShippingChange}
                    className="w-full bg-zinc-955 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-200 focus:outline-none focus:border-gold-500 transition-colors text-sm"
                  >
                    {communeOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt} {opt === 'Valdivia' ? '(Envío Local de Selección)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-gold-450" /> Teléfono Celular de Contacto *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-550 text-sm font-mono">+56</span>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={shippingDetails.phone}
                    onChange={handleShippingChange}
                    placeholder="9 8765 4321"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-13 pr-4 py-2.5 text-zinc-200 placeholder-zinc-660 focus:outline-none focus:border-gold-500 transition-colors text-sm"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-gold-450" /> Instrucciones especiales de despacho (Opcional)
                </label>
                <textarea
                  name="notes"
                  value={shippingDetails.notes}
                  onChange={handleShippingChange}
                  placeholder="Ej: Dejar en conserjería si no respondo, portón negro..."
                  rows={2}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-200 placeholder-zinc-660 focus:outline-none focus:border-gold-500 transition-colors text-sm resize-none"
                />
              </div>

              <div className="pt-4 border-t border-zinc-800 flex justify-end">
                <button
                  type="submit"
                  disabled={!validateShipping()}
                  className="px-6 py-3 cursor-pointer rounded-xl bg-gradient-to-r from-gold-400 to-gold-600 hover:from-gold-300 hover:to-gold-500 text-zinc-950 disabled:bg-zinc-900 disabled:text-zinc-500 disabled:cursor-not-allowed font-bold text-sm flex items-center gap-1.5 shadow-lg shadow-gold-500/10 transition"
                >
                  Continuar al Pago
                  <ArrowRight className="w-4 h-4 text-zinc-950" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: WEBPAY SIMULATOR */}
          {step === 2 && (
            <div className="space-y-6" id="payment-sandbox">
              {/* Webpay Portal Banner */}
              <div className="p-4 rounded-xl bg-zinc-950 border border-gold-500/15 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-zinc-900 border border-gold-500/20 rounded-lg text-gold-400 font-bold tracking-tighter text-sm uppercase">
                    Webpay<span className="text-zinc-400 text-[10px] uppercase align-super ml-0.5 font-sans font-light">plus</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold font-serif text-zinc-100">Portal de Pago Seguro Transbank</h4>
                    <p className="text-xs text-zinc-500">Comercio: Cervecería Valdiviana SPA</p>
                  </div>
                </div>
                <div className="font-serif text-gold-400 text-right">
                  <span className="text-[10px] text-zinc-500 block uppercase font-mono">Monto Cifrado</span>
                  <span className="text-lg font-bold">{formatCLP(total)}</span>
                </div>
              </div>

              {/* Form card details */}
              <form onSubmit={handleSimulatePayment} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-350 mb-1.5">
                    Número de Tarjeta de Crédito/Débito
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                      <CreditCard className="w-4.5 h-4.5" />
                    </span>
                    <input
                      type="text"
                      name="number"
                      required
                      value={cardDetails.number}
                      onChange={handleCardChange}
                      placeholder="4000 1234 5678 9010"
                      maxLength={19}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-zinc-200 placeholder-zinc-700 font-mono tracking-widest focus:outline-none focus:border-gold-500 transition text-sm"
                    />
                  </div>
                  <span className="text-[10px] text-zinc-550 mt-1 block">
                    * Ingresa un número de tarjeta ficticio para simular (Ej. empieza con 4 p/Visa, 5 p/Mastercard).
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-350 mb-1.5">
                    Nombre del Titular
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={cardDetails.name}
                    onChange={handleCardChange}
                    placeholder="JUAN PEREZ S"
                    className="w-full uppercase bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-200 placeholder-zinc-700 font-mono tracking-wide focus:outline-none focus:border-gold-500 transition text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Expiration date */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-350 mb-1.5">
                      Vencimiento (MM/AA)
                    </label>
                    <input
                      type="text"
                      name="expiry"
                      required
                      value={cardDetails.expiry}
                      onChange={handleCardChange}
                      placeholder="12/28"
                      maxLength={5}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-200 placeholder-zinc-700 font-mono tracking-widest focus:outline-none focus:border-gold-500 transition text-sm text-center"
                    />
                  </div>

                  {/* CVV */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1">
                      CVV / CVN <Lock className="w-3 h-3 text-zinc-550" />
                    </label>
                    <input
                      type="password"
                      name="cvv"
                      required
                      value={cardDetails.cvv}
                      onChange={handleCardChange}
                      placeholder="***"
                      maxLength={4}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-200 placeholder-zinc-700 font-mono tracking-widest focus:outline-none focus:border-gold-500 transition text-sm text-center"
                    />
                  </div>
                </div>

                {/* Secure certificate logs */}
                <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-zinc-500">
                  <Lock className="w-3 h-3 text-emerald-500" />
                  <span>Conexión cifrada SSL de 256 bits. Ambiente Sandbox Seguro.</span>
                </div>

                {/* Actions bottom */}
                <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    disabled={paymentProcessing}
                    className="px-4 py-2 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition"
                  >
                    <ArrowLeft className="w-4 h-4" /> Despacho
                  </button>

                  <button
                    type="submit"
                    disabled={paymentProcessing || !validateCard()}
                    className="px-6 py-3 cursor-pointer rounded-xl bg-gradient-to-r from-gold-400 to-gold-600 hover:from-gold-300 hover:to-gold-500 text-zinc-950 disabled:bg-zinc-900 disabled:text-zinc-500 disabled:cursor-not-allowed font-bold text-sm flex items-center gap-2 shadow-lg shadow-gold-500/15 transition-all duration-300"
                  >
                    {paymentProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Autorizando Pago Transbank...
                      </>
                    ) : (
                      <>
                        Pagar {formatCLP(total)}
                        <Check className="w-3.5 h-3.5 text-zinc-950" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3: TRANSACTION SUCCESS & LOGISTICS PAYLOAD */}
          {step === 3 && createdOrder && (
            <div className="space-y-6" id="success-sandbox-receipt">
              {/* Green Success Splash */}
              <div className="text-center py-6">
                <div className="inline-flex p-3 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/30 mb-4 animate-bounce">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-black text-white font-serif">¡Pago Autorizado Exitosamente!</h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                  Hemos confirmado el débito y se ha registrado tu venta en el panel de administración. ¡El stock fue rebajado!
                </p>
              </div>

              {/* Receipt grid details */}
              <div className="p-5 bg-zinc-950 rounded-xl border border-zinc-800/80 space-y-4">
                <div className="flex justify-between items-center text-xs font-mono text-zinc-500 border-b border-zinc-900 pb-3">
                  <span>TRANSACCIÓN: {createdOrder.paymentId}</span>
                  <span>FECHA: {new Date(createdOrder.date).toLocaleString('es-CL')}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-zinc-300">
                  <div>
                    <h5 className="font-bold text-gold-400 mb-2 uppercase tracking-wide font-serif">Cliente & Entrega</h5>
                    <p className="font-semibold text-white font-serif">{createdOrder.shippingDetails.fullName}</p>
                    <p>{createdOrder.shippingDetails.address}, {createdOrder.shippingDetails.commune}</p>
                    <p className="mt-1 flex items-center gap-1 text-zinc-400">
                      <Mail className="w-3.5 h-3.5 text-zinc-500" /> {createdOrder.shippingDetails.email}
                    </p>
                    <p className="flex items-center gap-1 text-zinc-400">
                      <Phone className="w-3.5 h-3.5 text-zinc-500" /> +56 {createdOrder.shippingDetails.phone}
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-gold-400 mb-2 uppercase tracking-wide font-serif">Desglose de Pago</h5>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Productos:</span>
                        <span className="font-mono text-zinc-300">{formatCLP(createdOrder.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Despacho:</span>
                        <span className="font-mono text-zinc-300">
                          {createdOrder.shippingCost === 0 ? 'Gratis' : formatCLP(createdOrder.shippingCost)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-zinc-900 pt-1.5 font-bold text-white text-sm">
                        <span className="font-serif">Total Cifrado:</span>
                        <span className="font-mono text-gold-400">{formatCLP(createdOrder.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {createdOrder.shippingDetails.notes && (
                  <div className="text-xs bg-zinc-900 p-2.5 rounded border border-zinc-850 text-zinc-450 mt-2">
                    <span className="font-bold text-zinc-300 display-block mb-1">Notas del despacho:</span>
                    <p>"{createdOrder.shippingDetails.notes}"</p>
                  </div>
                )}
              </div>

              {/* INTEGRATION REPORT & PAYLOAD API MOCK (for dispatch generation) */}
              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gold-500/10 text-gold-400 rounded border border-gold-500/20">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-200">Notificación Instantánea del Despacho</h4>
                      <p className="text-[10px] text-zinc-500 font-mono">Payload JSON enviándose a Cervecería Sorter API...</p>
                    </div>
                  </div>
                  <button
                    onClick={copyPayload}
                    className="py-1.5 px-3 bg-zinc-900 hover:bg-zinc-805 hover:text-white border border-zinc-800 rounded-lg text-xs font-mono text-zinc-400 flex items-center gap-1 transition cursor-pointer"
                  >
                    {jsonCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {jsonCopied ? 'Copiado' : 'Copiar JSON'}
                  </button>
                </div>

                {/* Preformatted Payload box */}
                <div className="relative">
                  <pre className="text-[10px] text-zinc-400 bg-zinc-900/80 p-3 rounded-lg border border-zinc-800/80 max-h-36 overflow-y-auto font-mono scrollbar-thin">
                    {`{
  "event": "ORDER_CREATED_DISPATCH_REQ",
  "orderId": "${createdOrder.id}",
  "timestamp": "${createdOrder.date}",
  "destination": {
    "recipient": "${createdOrder.shippingDetails.fullName}",
    "address": "${createdOrder.shippingDetails.address}",
    "commune": "${createdOrder.shippingDetails.commune}",
    "phone": "+56${createdOrder.shippingDetails.phone}"
  },
  "package": {
    "total_items": ${createdOrder.items.reduce((acc, it) => acc + it.quantity, 0)},
    "items_breakdown": [
      ${createdOrder.items.map(it => `{"sku": "${it.product.id}", "name": "${it.product.name}", "qty": ${it.quantity}}`).join(',\n      ')}
    ]
  },
  "logistics": {
    "partner_assigned": "Chilexpress",
    "delivery_sla": "24-48 horas hábiles"
  }
}`}
                  </pre>
                </div>
              </div>

              {/* Close Button or Back To Shop */}
              <div className="pt-4 border-t border-zinc-800 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-gradient-to-r from-gold-400 to-gold-600 hover:from-gold-300 hover:to-gold-500 text-zinc-950 font-bold rounded-xl text-xs transition shadow-lg shadow-gold-500/10 cursor-pointer"
                >
                  Volver a la Tienda
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
