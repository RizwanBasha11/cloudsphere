import React, { useState, useEffect } from 'react';
import { useCloud } from '../../context/CloudContext';
import {
  Search,
  LayoutDashboard,
  Cpu,
  Layers,
  Database,
  HardDrive,
  BarChart3,
  Users2,
  ShieldCheck,
  Settings,
  Plus,
  ArrowRight,
  X
} from 'lucide-react';

export const CommandPalette = () => {
  const { commandPaletteOpen, setCommandPaletteOpen, setActiveTab, setQuickActionModal } = useCloud();
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!commandPaletteOpen) {
      setSearch('');
    }
  }, [commandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  const actions = [
    { id: 'nav-overview', label: 'Go to Overview Dashboard', category: 'Navigation', icon: LayoutDashboard, action: () => setActiveTab('overview') },
    { id: 'nav-compute', label: 'Manage Compute (CPU Cores & Scaling)', category: 'Navigation', icon: Cpu, action: () => setActiveTab('compute') },
    { id: 'nav-memory', label: 'Manage Memory (RAM Pools & Allocation)', category: 'Navigation', icon: Layers, action: () => setActiveTab('memory') },
    { id: 'nav-database', label: 'Manage Cloud Databases', category: 'Navigation', icon: Database, action: () => setActiveTab('database') },
    { id: 'nav-storage', label: 'Manage Storage & File Vault', category: 'Navigation', icon: HardDrive, action: () => setActiveTab('storage') },
    { id: 'nav-analytics', label: 'View Real-time Observability & Analytics', category: 'Navigation', icon: BarChart3, action: () => setActiveTab('analytics') },
    { id: 'nav-tenants', label: 'Manage Multi-Tenant Quotas & Users', category: 'Navigation', icon: Users2, action: () => setActiveTab('tenants') },
    { id: 'nav-security', label: 'Security Posture & API Keys', category: 'Navigation', icon: ShieldCheck, action: () => setActiveTab('security') },
    { id: 'nav-settings', label: 'Platform & Profile Settings', category: 'Navigation', icon: Settings, action: () => setActiveTab('settings') },
    { id: 'act-cpu', label: 'Quick Action: Allocate CPU Cores', category: 'Provisioning', icon: Plus, action: () => setQuickActionModal({ open: true, type: 'cpu' }) },
    { id: 'act-ram', label: 'Quick Action: Allocate RAM Memory Block', category: 'Provisioning', icon: Plus, action: () => setQuickActionModal({ open: true, type: 'ram' }) },
    { id: 'act-db', label: 'Quick Action: Provision New Cloud Database', category: 'Provisioning', icon: Plus, action: () => setQuickActionModal({ open: true, type: 'db' }) },
    { id: 'act-file', label: 'Quick Action: Upload File to Vault', category: 'Storage', icon: Plus, action: () => setQuickActionModal({ open: true, type: 'file' }) },
  ];

  const filtered = actions.filter(a =>
    a.label.toLowerCase().includes(search.toLowerCase()) ||
    a.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4">
      <div
        className="fixed inset-0 bg-charcoal/40 backdrop-blur-xs transition-opacity"
        onClick={() => setCommandPaletteOpen(false)}
      />

      <div className="relative w-full max-w-xl bg-white rounded-2xl border border-silverGrey shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-100">
        {/* Search Input */}
        <div className="p-4 border-b border-silverGrey/70 flex items-center gap-3 bg-warmIvory/30">
          <Search className="w-5 h-5 text-slateBlue" />
          <input
            type="text"
            placeholder="Type a command, page name, or action..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-sm font-medium text-charcoal placeholder-charcoal/40 focus:outline-none"
          />
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="p-1 rounded-md text-charcoal/40 hover:text-charcoal transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-charcoal/50">
              No matching commands or pages found.
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    item.action();
                    setCommandPaletteOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slateBlue/10 text-left transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-white border border-silverGrey/80 group-hover:border-slateBlue group-hover:text-slateBlue text-charcoal/70 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-charcoal block group-hover:text-slateBlue-dark">
                        {item.label}
                      </span>
                      <span className="text-[10px] text-charcoal/50 block">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-charcoal/30 group-hover:text-slateBlue group-hover:translate-x-0.5 transition-all" />
                </button>
              );
            })
          )}
        </div>

        <div className="px-4 py-2 border-t border-silverGrey/60 bg-gray-50 flex items-center justify-between text-[11px] text-charcoal/60">
          <span>Navigate using search</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
