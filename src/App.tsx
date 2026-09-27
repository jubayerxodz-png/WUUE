/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Server, 
  Activity, 
  Terminal, 
  Settings, 
  Play, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Cpu, 
  Globe, 
  Lock, 
  Key, 
  Sliders, 
  Database,
  Wifi,
  WifiOff,
  Repeat,
  Plus,
  Trash2,
  AlertTriangle,
  Phone,
  Mail,
  Eye,
  EyeOff
} from 'lucide-react';

interface ProxyItem {
  id: string;
  host: string;
  port: string;
  username: string;
  status: 'active' | 'standby' | 'failed';
  latency: number;
}

export default function App() {
  // Proxy Pool State
  const [proxyPool, setProxyPool] = useState<ProxyItem[]>([
    { id: '1', host: 'change1.owlproxy.com', port: '7778', username: 'zone_us_01', status: 'active', latency: 24 },
    { id: '2', host: 'change2.owlproxy.com', port: '7778', username: 'zone_us_02', status: 'standby', latency: 38 },
    { id: '3', host: 'change3.owlproxy.com', port: '7778', username: 'zone_eu_01', status: 'standby', latency: 65 },
  ]);

  const [currentProxyIndex, setCurrentProxyIndex] = useState(0);
  const [isAutoRotationEnabled, setIsAutoRotationEnabled] = useState(true);
  const [isProxyActive, setIsProxyActive] = useState(true);
  const [rotationCount, setRotationCount] = useState(0);

  // New proxy input form state
  const [newHost, setNewHost] = useState('');
  const [newPort, setNewPort] = useState('7778');
  const [newUser, setNewUser] = useState('');

  // Account Mode: 'phone' (Facebook) vs 'email' (Meta / Temp Mail)
  const [accountMode, setAccountMode] = useState<'phone' | 'email'>('phone');

  // Form test input state
  const [identifier, setIdentifier] = useState('+1 (555) 019-2834');
  const [password, setPassword] = useState('SecretPass123!');
  const [showPassword, setShowPassword] = useState(false);
  const [proxyZone, setProxyZone] = useState('US Residential (US-VA)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logs, setLogs] = useState<Array<{ id: string; time: string; type: 'success' | 'error' | 'info' | 'warn'; message: string }>>([
    { id: '1', time: new Date().toLocaleTimeString(), type: 'info', message: 'Proxy rotation manager initialized. Mode: Phone (Facebook).' }
  ]);

  // Handle mode change to update placeholder and default values
  const handleModeChange = (mode: 'phone' | 'email') => {
    setAccountMode(mode);
    if (mode === 'phone') {
      setIdentifier('+1 (555) 019-2834');
      addLog('info', 'Switched mode to Phone (Facebook Registration Flow)');
    } else {
      setIdentifier('tempmail_user_' + Math.floor(Math.random() * 10000) + '@tempmail.com');
      addLog('info', 'Switched mode to Email (Meta / Temp Mail Registration Flow)');
    }
  };

  const addLog = (type: 'success' | 'error' | 'info' | 'warn', message: string) => {
    setLogs(prev => [
      { id: Math.random().toString(36).substring(2, 9), time: new Date().toLocaleTimeString(), type, message },
      ...prev.slice(0, 49)
    ]);
  };

  // Rotate to next proxy in the pool
  const rotateProxy = (reason: string) => {
    if (proxyPool.length === 0) return;
    
    const nextIndex = (currentProxyIndex + 1) % proxyPool.length;
    const oldProxy = proxyPool[currentProxyIndex];
    const newProxy = proxyPool[nextIndex];

    setCurrentProxyIndex(nextIndex);
    setRotationCount(prev => prev + 1);

    setProxyPool(prev => prev.map((p, idx) => ({
      ...p,
      status: idx === nextIndex ? 'active' : 'standby'
    })));

    addLog('warn', `🔄 Proxy Rotated (${reason})! Switched from ${oldProxy.host} -> ${newProxy.host}:${newProxy.port} (${newProxy.username})`);
  };

  const handleAddProxy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHost || !newPort) {
      addLog('error', 'Please provide valid host and port for the new proxy.');
      return;
    }

    const newItem: ProxyItem = {
      id: Math.random().toString(36).substring(2, 9),
      host: newHost,
      port: newPort,
      username: newUser || `zone_custom_${Math.floor(Math.random() * 100)}`,
      status: proxyPool.length === 0 ? 'active' : 'standby',
      latency: Math.floor(Math.random() * 50) + 15
    };

    setProxyPool([...proxyPool, newItem]);
    setNewHost('');
    setNewUser('');
    addLog('success', `Added proxy ${newItem.host}:${newItem.port} to rotation pool.`);
  };

  const handleRemoveProxy = (id: string) => {
    const filtered = proxyPool.filter(p => p.id !== id);
    setProxyPool(filtered);
    if (currentProxyIndex >= filtered.length && filtered.length > 0) {
      setCurrentProxyIndex(0);
    }
    addLog('info', 'Proxy removed from rotation pool.');
  };

  const handleTestRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      addLog('error', 'Validation error: Identifier and password are required.');
      return;
    }

    const activeProxy = proxyPool[currentProxyIndex];
    setIsSubmitting(true);
    addLog('info', `Testing [${accountMode.toUpperCase()}] request via active proxy [${activeProxy?.host || 'Direct'}] for identifier: ${identifier}`);

    setTimeout(() => {
      setIsSubmitting(false);
      // 35% chance to simulate rate limit or failure to demonstrate auto-rotation
      const simulateFailure = Math.random() < 0.35;

      if (simulateFailure) {
        addLog('error', `Rate limit / verification challenge detected on ${activeProxy?.host || 'endpoint'}.`);
        if (isAutoRotationEnabled && proxyPool.length > 1) {
          rotateProxy('Rate Limit / Challenge Detected');
        } else {
          addLog('error', 'Request failed and auto-rotation is disabled or pool is empty.');
        }
      } else {
        addLog('success', `[${accountMode.toUpperCase()}] Request completed successfully (HTTP 200 OK) using proxy ${activeProxy?.host}. Latency: ${activeProxy?.latency}ms`);
      }
    }, 1400);
  };

  const activeProxy = proxyPool[currentProxyIndex] || { host: 'Direct Connection', port: '-', username: '-' };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Repeat className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Proxy Pool & Auto-Rotation Engine
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-medium">Enterprise v2.5</span>
            </h1>
            <p className="text-xs text-slate-400">Automatic proxy rotation on failure, rate limit detection, and health monitoring</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Rotation Status Badge */}
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium">
            <Repeat className="h-3.5 w-3.5 animate-spin" />
            <span>Rotations: {rotationCount}</span>
          </div>

          <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
            isProxyActive 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
          }`}>
            <span className={`h-2 w-2 rounded-full animate-pulse ${isProxyActive ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span>Active: {activeProxy.host}</span>
          </div>

          <button 
            onClick={() => setLogs([])}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Clear Logs
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Proxy Pool & Test Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Proxy Pool Management Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2.5">
                <Server className="h-5 w-5 text-indigo-400" />
                <h2 className="text-base font-semibold text-white">Proxy Pool & Auto-Rotation Settings</h2>
              </div>

              <div className="flex items-center space-x-3">
                <label className="text-xs text-slate-300 flex items-center gap-2 cursor-pointer bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                  <input
                    type="checkbox"
                    checked={isAutoRotationEnabled}
                    onChange={(e) => setIsAutoRotationEnabled(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <span>Auto-Rotate on Failure / Rate Limit</span>
                </label>
              </div>
            </div>

            {/* Add Proxy Form */}
            <form onSubmit={handleAddProxy} className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-5 bg-slate-950 p-4 rounded-xl border border-slate-800/80">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Host</label>
                <input
                  type="text"
                  value={newHost}
                  onChange={(e) => setNewHost(e.target.value)}
                  placeholder="proxy.owlproxy.com"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Port</label>
                <input
                  type="text"
                  value={newPort}
                  onChange={(e) => setNewPort(e.target.value)}
                  placeholder="7778"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Username / Zone</label>
                <input
                  type="text"
                  value={newUser}
                  onChange={(e) => setNewUser(e.target.value)}
                  placeholder="zone_us_custom"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-lg text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Proxy
                </button>
              </div>
            </form>

            {/* Proxy List Table */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {proxyPool.map((proxy, idx) => (
                <div 
                  key={proxy.id} 
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    idx === currentProxyIndex 
                      ? 'bg-indigo-950/30 border-indigo-500/40 text-white shadow-md' 
                      : 'bg-slate-950/60 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={`h-2.5 w-2.5 rounded-full ${idx === currentProxyIndex ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                    <div>
                      <div className="font-mono text-xs font-semibold flex items-center gap-2">
                        {proxy.host}:{proxy.port}
                        {idx === currentProxyIndex && (
                          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">Active</span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">User: {proxy.username} • Latency: {proxy.latency}ms</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setCurrentProxyIndex(idx);
                        setProxyPool(prev => prev.map((p, i) => ({ ...p, status: i === idx ? 'active' : 'standby' })));
                        addLog('info', `Manually switched active proxy to ${proxy.host}`);
                      }}
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                    >
                      Use
                    </button>
                    {proxyPool.length > 1 && (
                      <button
                        onClick={() => handleRemoveProxy(proxy.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Test Request Form Card with Mode Toggle & Password Show/Hide */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center space-x-2.5">
                <Sliders className="h-5 w-5 text-indigo-400" />
                <h2 className="text-base font-semibold text-white">Endpoint Connectivity & Account Mode</h2>
              </div>

              {/* Mode Toggle Switch */}
              <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => handleModeChange('phone')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                    accountMode === 'phone'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>Phone (Facebook)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange('email')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                    accountMode === 'email'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span>Email (Meta / Temp Mail)</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleTestRequest} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center justify-between">
                    <span>{accountMode === 'phone' ? 'Phone Number (SMS OTP)' : 'Email Address (Temp Mail / Inbox)'}</span>
                    <span className="text-[10px] text-indigo-400 uppercase font-mono">{accountMode} mode</span>
                  </label>
                  <input
                    type={accountMode === 'phone' ? 'tel' : 'email'}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={accountMode === 'phone' ? '+1 (555) 000-0000' : 'user@tempmail.com'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center justify-between">
                    <span>Password / Secret Key</span>
                    <span className="text-[10px] text-slate-500 font-mono">Secure input</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                      title={showPassword ? "Hide Password" : "Show Password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Proxy Geo Zone (ISP / Residential)</label>
                <select
                  value={proxyZone}
                  onChange={(e) => setProxyZone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option>US Residential (US-VA) - Rotating IP</option>
                  <option>EU Residential (DE-FR) - Static IP</option>
                  <option>AP Residential (SG-SIN) - Fast Routing</option>
                  <option>FR Residential (FR-PAR) - French ISP</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">This defines which proxy geo-location zone routes the registration requests.</p>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Auto-Rotation Engine Active (Pool Size: {proxyPool.length})</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition flex items-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Testing {accountMode.toUpperCase()} Flow...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 fill-current" />
                      Test {accountMode === 'phone' ? 'Phone' : 'Email'} Flow (Auto-Rotate)
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Right Column: Real-time Telemetry & Logs */}
        <div className="space-y-6 flex flex-col">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Terminal className="h-4 w-4 text-indigo-400" />
                <h2 className="text-sm font-semibold text-white">Live Activity & Telemetry Logs</h2>
              </div>
              <span className="text-xs text-slate-400 font-mono">{logs.length} events</span>
            </div>

            <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 flex-1 min-h-[380px] max-h-[500px] overflow-y-auto font-mono text-xs space-y-2.5">
              {logs.length === 0 ? (
                <div className="text-slate-500 text-center py-12">No recent activity logs.</div>
              ) : (
                logs.map(log => (
                  <div key={log.id} className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/50 flex items-start gap-2.5">
                    {log.type === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />}
                    {log.type === 'error' && <XCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />}
                    {log.type === 'warn' && <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />}
                    {log.type === 'info' && <Activity className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
                        <span className="uppercase tracking-wider font-semibold text-slate-400">{log.type}</span>
                        <span>{log.time}</span>
                      </div>
                      <p className="text-slate-300 break-words">{log.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-4 text-center">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/60">
                <div className="text-xs text-slate-400 mb-1">Active Pool Node</div>
                <div className="text-sm font-semibold text-emerald-400 truncate px-1">
                  {activeProxy.host}
                </div>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/60">
                <div className="text-xs text-slate-400 mb-1">Total Rotations</div>
                <div className="text-sm font-semibold text-indigo-400">{rotationCount}</div>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
