import React, { useState, useRef, useEffect } from 'react';
import { useCloud } from '../../context/CloudContext';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  Bell,
  ChevronDown,
  Globe2,
  CheckCircle2,
  Plus,
  User,
  Shield,
  LogOut,
  ExternalLink,
  Layers,
  Cpu,
  Database,
  HardDrive,
  RefreshCw,
  Clock
} from 'lucide-react';

export const Topbar = () => {
  const {
    activeTab,
    setActiveTab,
    setCommandPaletteOpen,
    notifications,
    unreadNotifications,
    markNotificationsAsRead,
    setQuickActionModal,
    refreshAllStats,
    loadingStats,
  } = useCloud();

  const { user, tenant, logout, loginDemo } = useAuth();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tabLabels = {
    overview: 'Overview & Telemetry',
    compute: 'Compute Resources (CPU)',
    memory: 'Memory Management (RAM)',
    database: 'Managed Databases',
    storage: 'Object Storage Vault',
    analytics: 'Analytics & Observability',
    tenants: 'Users & Tenants',
    security: 'Security & Access Control',
    settings: 'Platform Settings',
  };

  return (
    <header className="h-16 bg-white border-b border-silverGrey px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm">
        <span className="font-semibold text-charcoal tracking-tight">CloudSphere</span>
        <span className="text-silverGrey font-normal">/</span>
        <span className="font-medium text-slateBlue">{tabLabels[activeTab] || 'Dashboard'}</span>
        
        {/* Live sync indicator */}
        <button
          onClick={refreshAllStats}
          disabled={loadingStats}
          title="Refresh live cloud telemetry"
          className="ml-3 p-1 rounded-md text-charcoal/50 hover:text-slateBlue hover:bg-slateBlue/10 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingStats ? 'animate-spin text-slateBlue' : ''}`} />
        </button>
      </div>

      {/* Center: Search Bar (Global Command trigger) */}
      <div className="flex-1 max-w-md mx-6">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-lg bg-warmIvory/50 border border-silverGrey hover:border-slateBlue hover:bg-white text-xs text-charcoal/70 transition-all duration-150 shadow-subtle group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-charcoal/50 group-hover:text-slateBlue" />
            <span>Search resources, databases, nodes, or commands...</span>
          </div>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-white border border-silverGrey text-[10px] font-mono text-charcoal/60">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right Navigation & Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Resource Allocation Action */}
        <button
          onClick={() => setQuickActionModal({ open: true, type: 'cpu' })}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slateBlue text-white text-xs font-medium hover:bg-slateBlue-dark shadow-subtle transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Provision Resource</span>
        </button>

        {/* Cloud Region Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-warmIvory/60 border border-silverGrey text-xs font-medium text-charcoal/80">
          <Globe2 className="w-3.5 h-3.5 text-slateBlue" />
          <span>{tenant?.region || 'us-east-1'}</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
        </div>

        {/* Notifications Icon & Drawer */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              if (!notificationsOpen) markNotificationsAsRead();
            }}
            className="p-2 rounded-lg text-charcoal/70 hover:text-charcoal hover:bg-warmIvory/60 relative transition-colors border border-transparent hover:border-silverGrey"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-slateBlue" />
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl border border-silverGrey shadow-dropdown overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-silverGrey/70 bg-warmIvory/40 flex items-center justify-between">
                <span className="text-xs font-semibold text-charcoal">Recent Activity & Audit Trail</span>
                <span className="text-[11px] text-slateBlue font-medium">Tenant Isolated</span>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-silverGrey/40 text-xs">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-charcoal/50 text-xs">
                    No recent activity records found.
                  </div>
                ) : (
                  notifications.map((n, idx) => (
                    <div key={idx} className="p-3 hover:bg-warmIvory/30 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-charcoal">{n.action}</span>
                        <span className="text-[10px] text-charcoal/50 whitespace-nowrap">
                          {new Date(n.createdAt || n.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-charcoal/70 text-[11px] mt-1 leading-relaxed">{n.details}</p>
                      <div className="mt-1.5 flex items-center gap-2 text-[10px] text-charcoal/50">
                        <span className="px-1.5 py-0.2 rounded bg-silverGrey/30 text-charcoal font-medium">
                          {n.category}
                        </span>
                        <span>IP: {n.ipAddress || '127.0.0.1'}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-silverGrey/70 bg-gray-50 text-center">
                <button
                  onClick={() => {
                    setActiveTab('security');
                    setNotificationsOpen(false);
                  }}
                  className="text-[11px] font-medium text-slateBlue hover:underline"
                >
                  View full security audit log &rarr;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-warmIvory/60 border border-transparent hover:border-silverGrey transition-all"
          >
            <div className="w-7 h-7 rounded-full bg-slateBlue text-white text-xs font-semibold flex items-center justify-center shadow-xs">
              {user?.name ? user.name[0].toUpperCase() : 'A'}
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-xs font-semibold text-charcoal block leading-none">
                {user?.name || 'Administrator'}
              </span>
              <span className="text-[10px] text-charcoal/60 leading-none mt-0.5 block">
                {user?.role === 'admin' ? 'Cloud Admin' : 'Tenant User'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-charcoal/50" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl border border-silverGrey shadow-dropdown overflow-hidden z-50 text-xs">
              <div className="p-3 border-b border-silverGrey/60 bg-warmIvory/30">
                <p className="font-semibold text-charcoal">{user?.name}</p>
                <p className="text-charcoal/60 text-[11px] truncate">{user?.email}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slateBlue/10 text-slateBlue text-[11px] font-medium">
                  <Shield className="w-3 h-3" />
                  <span>{tenant?.name || 'CloudSphere Org'}</span>
                </div>
              </div>

              {/* Demo Account Quick Switch (for presentation demonstration) */}
              <div className="p-2 border-b border-silverGrey/60 bg-gray-50/50">
                <span className="px-2 text-[10px] font-semibold text-charcoal/50 uppercase tracking-wider block mb-1">
                  Multi-Tenant Demo Switcher:
                </span>
                <div className="grid grid-cols-2 gap-1.5 px-1">
                  <button
                    onClick={async () => {
                      await loginDemo('admin');
                      setProfileDropdownOpen(false);
                      refreshAllStats();
                    }}
                    className="px-2 py-1.5 text-left rounded-md bg-white border border-silverGrey hover:border-slateBlue hover:text-slateBlue text-[11px] font-medium transition-colors"
                  >
                    Tenant 1 (Dileep)
                  </button>
                  <button
                    onClick={async () => {
                      await loginDemo('techcorp');
                      setProfileDropdownOpen(false);
                      refreshAllStats();
                    }}
                    className="px-2 py-1.5 text-left rounded-md bg-white border border-silverGrey hover:border-slateBlue hover:text-slateBlue text-[11px] font-medium transition-colors"
                  >
                    Tenant 2 (TechCorp)
                  </button>
                </div>
              </div>

              <div className="p-1 space-y-0.5">
                <button
                  onClick={() => {
                    setActiveTab('settings');
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-warmIvory/50 text-charcoal text-left"
                >
                  <User className="w-3.5 h-3.5 text-slateBlue" />
                  <span>Account & Quota Settings</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('security');
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-warmIvory/50 text-charcoal text-left"
                >
                  <Shield className="w-3.5 h-3.5 text-slateBlue" />
                  <span>API Keys & Security</span>
                </button>
              </div>

              <div className="p-1 border-t border-silverGrey/60">
                <button
                  onClick={() => {
                    logout();
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-rose-50 text-rose-600 text-left font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
