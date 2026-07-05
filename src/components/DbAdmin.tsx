/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Database, AlertTriangle, CheckCircle, RefreshCw, HelpCircle, Server, ShieldAlert } from 'lucide-react';

interface DbStatus {
  usingPostgres: boolean;
  isConnected: boolean;
  connectionError: string | null;
  host: string;
  database: string;
  maskedConnectionString: string;
}

export const DbAdmin: React.FC = () => {
  const [status, setStatus] = useState<DbStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);

  const fetchStatus = async () => {
    setReloading(true);
    try {
      const res = await fetch('/api/db-status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (err) {
      console.error("Error fetching database status:", err);
    } finally {
      setLoading(false);
      setReloading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-3 bg-zinc-900/40 border border-zinc-850 rounded-2xl">
        <RefreshCw className="w-8 h-8 text-gold-500 animate-spin" />
        <p className="text-sm text-zinc-450">Cargando estado de la Base de Datos...</p>
      </div>
    );
  }

  const isEnotfound = status?.connectionError?.includes('ENOTFOUND');
  const isTimedOut = status?.connectionError?.includes('ETIMEDOUT') || status?.connectionError?.includes('timeout');

  return (
    <div className="space-y-6" id="db-admin-root">
      {/* Overview Status Card */}
      <div className="bg-zinc-950/80 border border-zinc-900 rounded-2xl p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
              <Database className="w-6 h-6 text-gold-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-serif text-zinc-100">Estado de Conexión de Base de Datos</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Diagnóstico del motor relacional en la nube (Aiven/Render)</p>
            </div>
          </div>
          
          <button
            onClick={fetchStatus}
            disabled={reloading}
            className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl text-xs text-zinc-300 font-semibold cursor-pointer transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${reloading ? 'animate-spin' : ''}`} />
            {reloading ? 'Verificando...' : 'Re-intentar Conexión'}
          </button>
        </div>

        {/* Status Indicator Banner */}
        {status?.isConnected ? (
          <div className="flex items-start gap-3 p-4 bg-emerald-950/30 border border-emerald-900/65 rounded-xl text-emerald-400">
            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5 text-emerald-500" />
            <div className="space-y-1">
              <p className="text-sm font-bold">¡Conexión Exitosa con PostgreSQL!</p>
              <p className="text-xs text-emerald-500/85">
                El servidor está conectado a la base de datos de producción. Todos los productos, precios, stock y clientes se guardan y leen de forma persistente.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 p-4 bg-rose-955/20 border border-rose-900/40 rounded-xl text-rose-400">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500 animate-pulse" />
            <div className="space-y-1">
              <p className="text-sm font-bold">Conexión Caída / No Establecida</p>
              <p className="text-xs text-rose-400/85">
                El servidor no se pudo conectar con el motor PostgreSQL. Actualmente la aplicación está operando en <b>Modo de Contingencia Local</b> usando archivos JSON temporales de prueba para evitar caídas de la web.
              </p>
            </div>
          </div>
        )}

        {/* Connection Parameters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-zinc-900/30 p-4 border border-zinc-900 rounded-xl">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-zinc-500">Servidor / Host</span>
            <p className="text-xs font-mono font-medium text-zinc-250 truncate block" title={status?.host}>
              {status?.host || "Ninguno"}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-zinc-500">Nombre Base de Datos</span>
            <p className="text-xs font-mono font-medium text-zinc-250 block">
              {status?.database || "Ninguna"}
            </p>
          </div>
          <div className="space-y-1 md:col-span-2 lg:col-span-1">
            <span className="text-[10px] font-mono uppercase text-zinc-500">URL encriptada / Cadena de Conexión</span>
            <p className="text-xs font-mono font-medium text-zinc-250 truncate block" title={status?.maskedConnectionString}>
              {status?.maskedConnectionString || "Ninguna"}
            </p>
          </div>
        </div>

        {/* Technical Error Stack, only if failed */}
        {!status?.isConnected && status?.connectionError && (
          <div className="space-y-2 bg-rose-955/10 border border-rose-950/50 rounded-xl p-4">
            <span className="flex items-center gap-1.5 text-xs font-bold font-mono text-rose-400">
              <ShieldAlert className="w-4 h-4" />
              DETALLE DEL ERROR RETORNADO POR EL SERVIDOR (LOGS):
            </span>
            <pre className="text-xs font-mono text-rose-300 overflow-x-auto whitespace-pre-wrap bg-zinc-950 p-3 rounded border border-rose-950/20 leading-relaxed">
              {status.connectionError}
            </pre>
          </div>
        )}
      </div>

      {/* Diagnosis & Guide Section */}
      {!status?.isConnected && (
        <div className="bg-zinc-950/80 border border-zinc-900 rounded-2xl p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-gold-500" />
            <h4 className="text-base font-bold font-serif text-zinc-100">¿Por qué ocurre este error y cómo solucionarlo?</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="db-troubleshooting-grid">
            
            {/* Guide 1: Service Paused / Stopped */}
            <div className="bg-zinc-900/40 border border-zinc-850 p-5 rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gold-500/10 text-gold-400 text-xs font-mono font-bold">1</span>
                <h5 className="text-sm font-bold text-zinc-200">Base de Datos Aiven Apagada (Power Off)</h5>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Los servicios gratuitos en la consola de <b>Aiven</b> se apagan automáticamente después de un periodo de inactividad de algunos días para ahorrar recursos.
              </p>
              <div className="space-y-2 pt-1 text-xs">
                <p className="text-gold-400 font-semibold">Instrucciones de reactivación:</p>
                <ol className="list-decimal list-inside space-y-1 text-zinc-400">
                  <li>Inicia sesión en tu consola de <a href="https://console.aiven.io" target="_blank" rel="noopener noreferrer" className="text-gold-500 underline hover:text-gold-400">Aiven Console</a>.</li>
                  <li>Selecciona tu base de datos de PostgreSQL <b>kolchawwe-db</b>.</li>
                  <li>Revisa el estado actual. Si dice <span className="text-rose-400">"Powered off"</span> o <span className="text-rose-400">"Paused"</span>, haz clic en el botón de <b>Power on</b> o <b>Resume</b> en la parte superior derecha.</li>
                  <li>Espera 2-3 minutos hasta que el estado cambie a <span className="text-emerald-400">"RUNNING"</span>.</li>
                </ol>
              </div>
            </div>

            {/* Guide 2: DNS Propagando */}
            <div className="bg-zinc-900/40 border border-zinc-850 p-5 rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gold-500/10 text-gold-400 text-xs font-mono font-bold">2</span>
                <h5 className="text-sm font-bold text-zinc-200">DNS Propagación del host de Aiven</h5>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                El error <code className="bg-zinc-950 px-1 py-0.5 text-gold-500 rounded font-mono">ENOTFOUND</code> indica que el nombre del servidor en internet todavía no se ha registrado o ha sido retirado de los servidores DNS globales.
              </p>
              <div className="space-y-2 pt-1 text-xs">
                <p className="text-gold-400 font-semibold">Qué hacer:</p>
                <ul className="list-disc list-inside space-y-1 text-zinc-400">
                  <li>Si acabas de crear el servicio o de encenderlo, Aiven puede tardar hasta <b>5 o 10 minutos</b> en registrar el subdominio DNS global.</li>
                  <li>Asegúrate de que no estás usando una VPN corporativa que bloquee subdominios desconocidos.</li>
                  <li>Una vez que el servicio de Aiven esté en verde (<span className="text-emerald-400">Running</span>), haz clic en el botón de arriba <b>"Re-intentar Conexión"</b>.</li>
                </ul>
              </div>
            </div>

            {/* Guide 3: SSL Settings */}
            <div className="bg-zinc-900/40 border border-zinc-850 p-5 rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gold-500/10 text-gold-400 text-xs font-mono font-bold">3</span>
                <h5 className="text-sm font-bold text-zinc-200">Permisos de Red / IPs Permitidas</h5>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Aiven requiere autorizar qué IPs se pueden conectar. Confirmaste que tienes ingresado <code className="bg-zinc-950 px-1.5 py-0.5 text-gold-500 rounded font-mono">0.0.0.0/0</code> y <code className="bg-zinc-950 px-1.5 py-0.5 text-gold-500 rounded font-mono">::/0</code>, lo cual es excelente y está correcto para permitir conexiones globales desde la nube.
              </p>
            </div>

            {/* Guide 4: Verificar Variables */}
            <div className="bg-zinc-900/40 border border-zinc-850 p-5 rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gold-500/10 text-gold-400 text-xs font-mono font-bold">4</span>
                <h5 className="text-sm font-bold text-zinc-200">Verificar credenciales</h5>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Revisa los datos configurados en el panel de Variables de Entorno en el menú de Configuración. La URL de la base de datos debe verse similar a la que proporcionaste:
              </p>
              <div className="bg-zinc-950 p-2 rounded border border-zinc-850 font-mono text-[11px] text-zinc-400 whitespace-pre-wrap select-all leading-snug">
                postgres://avnadmin:AVNS__7b3wU9aCacGLklQZvF@kolchawwe-db-kolchawwe-db.l.aivencloud.com:26098/defaultdb?sslmode=require
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
