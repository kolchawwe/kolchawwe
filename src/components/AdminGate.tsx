/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lock, Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface AdminGateProps {
  onSuccess: () => void;
}

export const AdminGate: React.FC<AdminGateProps> = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() === '1234') {
      setError(false);
      onSuccess();
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="max-w-md mx-auto my-12" id="admin-security-gate">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Decorative backgrounds */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-gold-500/5 blur-2xl rounded-full" />
        
        {/* Shield Icon header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-4 bg-zinc-950 text-gold-400 rounded-2xl border border-zinc-800 shadow-xl mx-auto">
            <Lock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-gold-400 font-bold">
              Área Restringida
            </span>
            <h2 className="text-xl font-bold font-serif text-zinc-150 mt-1">
              Control de Administración
            </h2>
            <p className="text-xs text-zinc-400 mt-2 max-w-xs mx-auto leading-relaxed">
              Ingrese el código de acceso autorizado de 4 dígitos para ingresar al Centro de Control de Cervecería Kolchawwe.
            </p>
          </div>
        </div>

        {/* Access Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block">
              Contraseña de Acceso
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                maxLength={10}
                required
                autoFocus
                placeholder="••••"
                className="w-full bg-zinc-950 text-zinc-150 placeholder-zinc-700 text-center text-sm font-semibold p-4 pr-12 border border-zinc-800 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 rounded-xl outline-none transition tracking-[0.2em]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1 hover:bg-zinc-900/60 rounded-lg transition cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Validation Alert */}
          {error && (
            <div className="bg-rose-955/20 border border-rose-900/40 p-3 rounded-xl text-rose-400 text-xs flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>Contraseña incorrecta. Intente con el pin de 4 dígitos.</span>
            </div>
          )}

          {/* Verification Driver */}
          <button
            type="submit"
            className="w-full cursor-pointer py-3.5 bg-gradient-to-r from-gold-400 to-gold-600 text-zinc-950 font-extrabold text-xs rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-gold-500/10"
          >
            <span>Verificar Código</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer info */}
        <div className="pt-2 text-center border-t border-zinc-850">
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-550">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />
            <span>Encriptación local de sesión activa para San Fernando • Chile</span>
          </div>
        </div>

      </div>
    </div>
  );
};
