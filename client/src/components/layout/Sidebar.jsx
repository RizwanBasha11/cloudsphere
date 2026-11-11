import React, { useState } from 'react';
import { useCloud } from '../../context/CloudContext';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Cpu,
  Layers,
  Database,
  HardDrive,
  BarChart3,
  Users2,
  ShieldCheck,
  Settings,
  HelpCircle,
  LogOut,
  Sparkles,
  Cloud,
  ChevronRight,
  Server
} from 'lucide-react';
import Modal from '../common/Modal';

export const Sidebar = () => {
  const { activeTab, setActiveTab } = useCloud();
  const { user, tenant, logout } = useAuth();
  const [helpOpen, setHelpOpen] = useState(false);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'compute', label: 'Compute Resources', icon: Cpu },
    { id: 'memory', label: 'Memory Management', icon: Layers },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'storage', label: 'Storage', icon: HardDrive },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'tenants', label: 'Users & Tenants', icon: Users2 },
    { id: 'security', label: 'Security', icon: ShieldCheck },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      <aside className="w-64 bg-white border-r border-silverGrey flex flex-col justify-between h-screen sticky top-0 select-none z-30 flex-shrink-0">
        {/* Brand Header */}
        <div>
          <div className="h-16 px-5 flex items-center justify-between border-b border-silverGrey/70 bg-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slateBlue flex items-center justify-center text-white shadow-sm">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <span className="font-semibold text-charcoal tracking-tight text-base block leading-none">
                  CloudSphere
                </span>
                <span className="text-[10px] text-charcoal/60 tracking-wider font-mono uppercase block mt-1">
                  v2.4 Enterprise
                </span>
              </div>
            </div>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slateBlue/10 text-slateBlue border border-slateBlue/30">
              Cloud CC
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <div className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-charcoal/50">
              Infrastructure Platform
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-slateBlue/15 text-charcoal font-semibold border-l-4 border-slateBlue pl-2.5'
                      : 'text-charcoal/80 hover:text-charcoal hover:bg-warmIvory/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-slateBlue' : 'text-charcoal/60'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-slateBlue" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar: Help, Profile & Logout */}
        <div className="p-3 border-t border-silverGrey/70 bg-warmIvory/20 space-y-1.5">
          {/* Help & Support Button */}
          <button
            onClick={() => setHelpOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-charcoal/80 hover:text-charcoal hover:bg-white border border-transparent hover:border-silverGrey transition-all"
          >
            <HelpCircle className="w-4 h-4 text-slateBlue" />
            <span className="flex-1 text-left">Help & Documentation</span>
          </button>

          {/* Tenant & User Profile Box */}
          <div className="p-2.5 rounded-xl bg-white border border-silverGrey shadow-subtle flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slateBlue/20 border border-slateBlue/40 flex items-center justify-center text-xs font-semibold text-charcoal flex-shrink-0">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'CS'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-charcoal truncate leading-tight">
                  {user?.name || 'Administrator'}
                </p>
                <p className="text-[11px] text-charcoal/60 truncate leading-tight mt-0.5">
                  {tenant?.name || user?.tenantName || 'Enterprise'}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-charcoal/50 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Help & Support Modal */}
      <Modal
        isOpen={helpOpen}
        onClose={() => setHelpOpen(false)}
        title="CloudSphere — Architecture & Project Guide"
        subtitle="Cloud Resource Management Platform Technical Documentation"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4 text-sm text-charcoal leading-relaxed">
          <div className="p-3.5 rounded-xl bg-slateBlue/10 border border-slateBlue/30 text-xs">
            <span className="font-semibold text-slateBlue-dark block mb-1">
              Project Presentation Information:
            </span>
            CloudSphere is an enterprise-grade Multi-Tenant Cloud Resource Management Platform built for cloud virtualization, elasticity demonstration, and infrastructure monitoring.
          </div>

          <div>
            <h4 className="font-semibold text-charcoal mb-1">Key Architectural Features:</h4>
            <ul className="list-disc pl-5 space-y-1 text-xs text-charcoal/80">
              <li><strong>Elastic Compute (CPU):</strong> Scale cores up or down dynamically with strict quota checking.</li>
              <li><strong>Memory Elasticity (RAM):</strong> Dynamically adjust memory footprint and rebalance instances.</li>
              <li><strong>Database Lifecycle:</strong> Multi-engine cloud database provisioning (PostgreSQL, MongoDB, Redis, MySQL).</li>
              <li><strong>Object Storage:</strong> Multi-tenant file upload with byte-level quotas and extension isolation.</li>
              <li><strong>Multi-Tenancy & Isolation:</strong> Strict tenant namespace isolation via JWT headers. User A never sees User B's resources.</li>
              <li><strong>Security:</strong> SHA-256 API keys, TLS 1.3 posture compliance, and immutable audit logs.</li>
            </ul>
          </div>

          <div className="pt-2 border-t border-silverGrey flex justify-end">
            <button
              onClick={() => setHelpOpen(false)}
              className="cloud-button-primary text-xs"
            >
              Close Documentation
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Sidebar;
