import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCloud } from '../../context/CloudContext';
import {
  Settings,
  User,
  Sliders,
  Bell,
  Globe,
  Shield,
  Save,
  CheckCircle2,
  AlertCircle,
  Server,
  Layers,
  BookOpen
} from 'lucide-react';

export const SettingsView = () => {
  const { user, tenant, updateProfile } = useAuth();
  const { showToast } = useCloud();

  // Profile form state
  const [name, setName] = useState(user?.name || '');
  const [orgName, setOrgName] = useState(tenant?.name || user?.tenantName || '');
  const [submittingProfile, setSubmittingProfile] = useState(false);

  // Cloud Config state
  const [region, setRegion] = useState(tenant?.region || 'us-east-1 (N. Virginia)');
  const [cpuThreshold, setCpuThreshold] = useState(80);
  const [ramThreshold, setRamThreshold] = useState(85);
  const [autoScaleEnabled, setAutoScaleEnabled] = useState(true);
  const [notificationEmail, setNotificationEmail] = useState(user?.email || '');

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSubmittingProfile(true);

    try {
      const res = await updateProfile({ name, tenantName: orgName });
      if (res.success) {
        showToast('Profile and organization details saved!', 'success');
      } else {
        showToast(res.message || 'Failed to update profile', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmittingProfile(false);
    }
  };

  const handleSaveCloudSettings = (e) => {
    e.preventDefault();
    showToast('Cloud infrastructure preferences updated successfully!', 'success');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-silverGrey p-6 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slateBlue/10 text-slateBlue border border-slateBlue/25">
              Configuration & Policy
            </span>
            <span className="text-xs text-charcoal/50">•</span>
            <span className="text-xs text-charcoal/60">CloudSphere Tenant Environment</span>
          </div>
          <h1 className="text-2xl font-semibold text-charcoal tracking-tight">
            Platform Settings
          </h1>
          <p className="text-sm text-charcoal/70 mt-1">
            Configure tenant defaults, auto-scaling thresholds, security policies, and team preferences.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account & Profile Form */}
        <div className="bg-white rounded-xl border border-silverGrey p-6 shadow-subtle">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-slateBlue" />
            <h3 className="text-base font-semibold text-charcoal">Account & Organization</h3>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-charcoal block mb-1">Administrator Name:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg bg-white border border-silverGrey text-charcoal focus:border-slateBlue focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-charcoal block mb-1">Organization / Tenant Title:</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg bg-white border border-silverGrey text-charcoal focus:border-slateBlue focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-charcoal block mb-1">Registered Account Email:</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-silverGrey text-charcoal/60 font-mono"
              />
              <span className="text-[10px] text-charcoal/50 mt-1 block">
                Primary auth credential cannot be modified directly.
              </span>
            </div>

            <div>
              <label className="font-semibold text-charcoal block mb-1">Tenant Unique UUID:</label>
              <input
                type="text"
                value={tenant?.tenantId || ''}
                disabled
                className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-silverGrey text-charcoal/60 font-mono text-[11px]"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={submittingProfile}
                className="cloud-button-primary text-xs flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{submittingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Cloud Auto-Scaling & Quota Policy Form */}
        <div className="bg-white rounded-xl border border-silverGrey p-6 shadow-subtle">
          <div className="flex items-center gap-2 mb-4">
            <Sliders className="w-5 h-5 text-slateBlue" />
            <h3 className="text-base font-semibold text-charcoal">Elasticity & Alert Thresholds</h3>
          </div>

          <form onSubmit={handleSaveCloudSettings} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-charcoal block mb-1">Primary Deployment Region:</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-silverGrey text-charcoal focus:border-slateBlue focus:outline-none"
              >
                <option value="us-east-1 (N. Virginia)">us-east-1 (N. Virginia) — Primary AWS / CloudSphere Core</option>
                <option value="us-west-2 (Oregon)">us-west-2 (Oregon) — Secondary Low-Latency Zone</option>
                <option value="eu-west-1 (Frankfurt)">eu-west-1 (Frankfurt) — GDPR European Hub</option>
                <option value="ap-southeast-1 (Singapore)">ap-southeast-1 (Singapore) — Asia Pacific Edge</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-charcoal">CPU Core Saturation Alert Trigger:</label>
                <span className="font-mono font-semibold text-slateBlue">{cpuThreshold}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                value={cpuThreshold}
                onChange={(e) => setCpuThreshold(parseInt(e.target.value, 10))}
                className="w-full accent-slateBlue cursor-pointer"
              />
              <span className="text-[10px] text-charcoal/50">Triggers auto-scale warning email when core load crosses threshold.</span>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-charcoal">RAM Memory Buffer Alert Trigger:</label>
                <span className="font-mono font-semibold text-slateBlue">{ramThreshold}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                value={ramThreshold}
                onChange={(e) => setRamThreshold(parseInt(e.target.value, 10))}
                className="w-full accent-slateBlue cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-warmIvory/60 border border-silverGrey">
              <input
                type="checkbox"
                id="autoScale"
                checked={autoScaleEnabled}
                onChange={(e) => setAutoScaleEnabled(e.target.checked)}
                className="w-4 h-4 accent-slateBlue rounded cursor-pointer"
              />
              <label htmlFor="autoScale" className="text-xs text-charcoal cursor-pointer">
                <strong>Enable Dynamic Resource Rebalancing</strong>
                <span className="block text-[11px] text-charcoal/70">Automatically notify administrator when worker nodes reach capacity limits.</span>
              </label>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="cloud-button-primary text-xs flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Preferences</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* College Project Architecture Reference Card */}
      <div className="bg-white rounded-xl border border-silverGrey p-6 shadow-subtle">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-5 h-5 text-slateBlue" />
          <h3 className="text-base font-semibold text-charcoal">
            Cloud Computing Project Presentation Architecture Guide
          </h3>
        </div>
        <p className="text-xs text-charcoal/70 leading-relaxed max-w-4xl mb-4">
          This system demonstrates key Cloud Computing principles as required for modern enterprise infrastructure:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-warmIvory/40 border border-silverGrey">
            <h4 className="font-semibold text-charcoal mb-1">1. Cloud Elasticity</h4>
            <p className="text-charcoal/70 leading-relaxed text-[11px]">
              Users can scale virtual CPU cores and RAM up or down in real-time, simulating dynamic workload spikes without downtime.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-warmIvory/40 border border-silverGrey">
            <h4 className="font-semibold text-charcoal mb-1">2. Multi-Tenancy & Isolation</h4>
            <p className="text-charcoal/70 leading-relaxed text-[11px]">
              Logical and cryptographic tenant partitioning ensures Tenant A's databases, memory buffers, and files are completely invisible to Tenant B.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-warmIvory/40 border border-silverGrey">
            <h4 className="font-semibold text-charcoal mb-1">3. Resource Metering</h4>
            <p className="text-charcoal/70 leading-relaxed text-[11px]">
              Strict tier quotas (64 CPU cores, 256 GB RAM, 500 GB Storage) prevent noisy neighbors and demonstrate IaaS resource allocation governance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
