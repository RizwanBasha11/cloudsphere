import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCloud } from '../../context/CloudContext';
import { Cloud, Lock, Mail, User, Building, ArrowRight, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';

export const AuthView = () => {
  const { login, register, loginDemo } = useAuth();
  const { showToast } = useCloud();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [tenantName, setTenantName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (!res.success) throw new Error(res.message || 'Login failed');
        showToast('Welcome back to CloudSphere!', 'success');
      } else {
        if (!name.trim()) throw new Error('Please enter your full name');
        const res = await register({ name, email, password, tenantName });
        if (!res.success) throw new Error(res.message || 'Registration failed');
        showToast('CloudSphere organization workspace provisioned!', 'success');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (type) => {
    setLoading(true);
    setError(null);
    try {
      await loginDemo(type);
      showToast(type === 'admin' ? 'Authenticated as Enterprise Admin' : 'Authenticated as Tenant 2 (TechCorp)', 'success');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warmIvory flex flex-col justify-center items-center p-4 selection:bg-slateBlue selection:text-white">
      {/* Brand Header */}
      <div className="mb-6 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slateBlue text-white shadow-md mb-3">
          <Cloud className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold text-charcoal tracking-tight">CloudSphere</h1>
        <p className="text-xs text-charcoal/70 mt-1 font-medium">
          Enterprise Cloud Resource Management Platform
        </p>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-white rounded-2xl border border-silverGrey shadow-card p-8">
        {/* Tab Toggle */}
        <div className="grid grid-cols-2 p-1 bg-warmIvory/60 rounded-xl border border-silverGrey mb-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`py-2 rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-white text-slateBlue shadow-xs border border-silverGrey'
                : 'text-charcoal/60 hover:text-charcoal'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            className={`py-2 rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-white text-slateBlue shadow-xs border border-silverGrey'
                : 'text-charcoal/60 hover:text-charcoal'
            }`}
          >
            Create Organization
          </button>
        </div>

        {/* 1-Click Quick Demo Login for instant evaluation */}
        <div className="mb-6 p-3.5 rounded-xl bg-slateBlue/10 border border-slateBlue/25 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-charcoal flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-slateBlue" />
              1-Click Demo Evaluation:
            </span>
            <span className="text-[10px] text-slateBlue font-medium">Quick Access</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoLogin('admin')}
              className="py-2 px-2.5 rounded-lg bg-white border border-silverGrey hover:border-slateBlue hover:text-slateBlue text-[11px] font-semibold text-charcoal shadow-2xs transition-all text-left"
            >
              <div className="font-medium text-slateBlue truncate">Meesala Dileep Kumar</div>
              <div className="text-[10px] text-charcoal/60 truncate">dileep65 (Click to enter)</div>
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoLogin('techcorp')}
              className="py-2 px-2.5 rounded-lg bg-white border border-silverGrey hover:border-slateBlue hover:text-slateBlue text-[11px] font-semibold text-charcoal shadow-2xs transition-all text-left"
            >
              <div className="font-medium text-slateBlue">Tenant 2: TechCorp</div>
              <div className="text-[10px] text-charcoal/60 truncate">alex@techcorp.com</div>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {mode === 'register' && (
            <>
              <div>
                <label className="font-semibold text-charcoal block mb-1">Your Full Name:</label>
                <div className="relative">
                  <User className="w-4 h-4 text-charcoal/40 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Meesala Dileep Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-silverGrey text-charcoal focus:border-slateBlue focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-charcoal block mb-1">Organization / Company Name:</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-charcoal/40 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="e.g. CloudSphere Global Infrastructure"
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-silverGrey text-charcoal focus:border-slateBlue focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="font-semibold text-charcoal block mb-1">
              {mode === 'login' ? 'Login Name or Email Address:' : 'Email Address:'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-charcoal/40 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                placeholder={mode === 'login' ? 'meesala dileep kumar or email' : 'dileep@cloudsphere.io'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-silverGrey text-charcoal focus:border-slateBlue focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-charcoal block mb-1">Password:</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-charcoal/40 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-silverGrey text-charcoal focus:border-slateBlue focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-slateBlue hover:bg-slateBlue-dark text-white font-medium text-xs shadow-subtle flex items-center justify-center gap-1.5 transition-all mt-2"
          >
            <span>{loading ? 'Authenticating...' : mode === 'login' ? 'Sign In to Workspace' : 'Initialize Enterprise Tenant'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-silverGrey/60 text-center text-[11px] text-charcoal/60 flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Strict Multi-Tenant Isolation & 256-bit JWT Encryption</span>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
