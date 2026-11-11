import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCloud } from '../../context/CloudContext';
import { api } from '../../services/api';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import {
  Users2,
  Building,
  UserPlus,
  RefreshCw,
  Shield,
  CheckCircle2,
  AlertCircle,
  Mail,
  Lock,
  Globe
} from 'lucide-react';

export const UsersTenants = () => {
  const { user, tenant, loginDemo } = useAuth();
  const { showToast, refreshAllStats } = useCloud();

  const [tenantData, setTenantData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Invite modal
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('engineer');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const fetchTenantInfo = async () => {
    setLoading(true);
    try {
      const res = await api.tenant.getInfo();
      if (res.success) {
        setTenantData(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenantInfo();
  }, [tenant]);

  const handleInvite = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    try {
      const res = await api.tenant.inviteMember({
        name: inviteName,
        email: inviteEmail,
        role: inviteRole,
      });
      showToast(res.message, 'success');
      setInviteModalOpen(false);
      setInviteName('');
      setInviteEmail('');
      await fetchTenantInfo();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const members = tenantData?.members || [];
  const quotaUsage = tenantData?.quotaUsage || {
    cpu: { used: 0, max: 64, percent: 0 },
    ram: { used: 0, max: 256, percent: 0 },
    storage: { used: 0, max: 500, percent: 0 },
    databases: { used: 0, max: 20, percent: 0 },
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-silverGrey p-6 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slateBlue/10 text-slateBlue border border-slateBlue/25">
              Multi-Tenant Architecture
            </span>
            <span className="text-xs text-charcoal/50">•</span>
            <span className="text-xs text-charcoal/60">Logical Isolation & Namespace Security</span>
          </div>
          <h1 className="text-2xl font-semibold text-charcoal tracking-tight">
            Users & Tenant Organization
          </h1>
          <p className="text-sm text-charcoal/70 mt-1">
            Manage organization members, workspace resource quotas, and multi-tenant access boundaries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchTenantInfo}
            disabled={loading}
            className="cloud-button-secondary text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-slateBlue' : ''}`} />
            <span>Sync</span>
          </button>
          <button
            onClick={() => setInviteModalOpen(true)}
            className="cloud-button-primary text-xs flex items-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Invite Team Member</span>
          </button>
        </div>
      </div>

      {/* Multi-Tenancy Demonstration Showcase Banner */}
      <div className="bg-white rounded-xl border border-silverGrey p-5 shadow-subtle bg-gradient-to-r from-white via-white to-warmIvory/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-slateBlue" />
              <h3 className="text-sm font-semibold text-charcoal">
                Multi-Tenant Isolation Verification
              </h3>
            </div>
            <p className="text-xs text-charcoal/70 leading-relaxed max-w-2xl">
              CloudSphere guarantees strict tenant isolation. A user logged into Tenant 1 cannot access, read, or modify the databases, CPU allocations, RAM pools, or storage files of Tenant 2.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs font-semibold text-charcoal/60">Switch Workspace:</span>
            <button
              onClick={async () => {
                await loginDemo('admin');
                showToast('Switched to Tenant 1: CloudSphere Global (Admin)', 'info');
                await refreshAllStats();
              }}
              className="px-3 py-1.5 rounded-lg bg-white border border-silverGrey hover:border-slateBlue hover:text-slateBlue text-xs font-medium transition-colors"
            >
              Tenant 1 (Global)
            </button>
            <button
              onClick={async () => {
                await loginDemo('techcorp');
                showToast('Switched to Tenant 2: TechCorp Labs', 'info');
                await refreshAllStats();
              }}
              className="px-3 py-1.5 rounded-lg bg-white border border-silverGrey hover:border-slateBlue hover:text-slateBlue text-xs font-medium transition-colors"
            >
              Tenant 2 (TechCorp)
            </button>
          </div>
        </div>
      </div>

      {/* Tenant Details & Quota Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tenant Profile Card */}
        <div className="bg-white rounded-xl border border-silverGrey p-5 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-slateBlue/10 border border-slateBlue/25 flex items-center justify-center text-slateBlue">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-charcoal">
                  {tenant?.name || 'Enterprise Tenant'}
                </h3>
                <span className="text-xs text-charcoal/60 font-mono">
                  ID: {tenant?.tenantId}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-silverGrey/50 text-xs">
              <div className="flex justify-between py-1">
                <span className="text-charcoal/60">Subscription Tier:</span>
                <Badge variant="primary" size="sm">{tenant?.plan || 'Enterprise Cloud'}</Badge>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-charcoal/60">Primary Cloud Region:</span>
                <span className="font-semibold text-charcoal">{tenant?.region || 'us-east-1'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-charcoal/60">Tenant Status:</span>
                <span className="text-emerald-700 font-semibold">{tenant?.tierStatus || 'Healthy / Active'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-charcoal/60">Created Date:</span>
                <span className="text-charcoal/80">
                  {new Date(tenant?.createdAt || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-warmIvory/60 rounded-lg border border-silverGrey text-[11px] text-charcoal/80 mt-4">
            Tenant has dedicated virtual namespaces, KMS encryption keys, and isolated database schemas.
          </div>
        </div>

        {/* Quota Limits & Utilization */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-silverGrey p-5 shadow-subtle">
          <h3 className="text-base font-semibold text-charcoal mb-1">
            Workspace Resource Quotas
          </h3>
          <p className="text-xs text-charcoal/60 mb-5">
            Resource boundaries enforced to prevent cross-tenant noisy neighbor impact
          </p>

          <div className="space-y-5">
            {/* CPU Quota */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-charcoal">Compute (CPU Cores)</span>
                <span className="font-mono text-charcoal/80">
                  {quotaUsage.cpu.used} / {quotaUsage.cpu.max} Cores ({quotaUsage.cpu.percent}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-silverGrey/40 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slateBlue rounded-full"
                  style={{ width: `${Math.min(100, quotaUsage.cpu.percent)}%` }}
                />
              </div>
            </div>

            {/* RAM Quota */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-charcoal">Memory Fabric (RAM)</span>
                <span className="font-mono text-charcoal/80">
                  {quotaUsage.ram.used} / {quotaUsage.ram.max} GB ({quotaUsage.ram.percent}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-silverGrey/40 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slateBlue rounded-full"
                  style={{ width: `${Math.min(100, quotaUsage.ram.percent)}%` }}
                />
              </div>
            </div>

            {/* Storage Quota */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-charcoal">Encrypted Object Vault (Storage)</span>
                <span className="font-mono text-charcoal/80">
                  {quotaUsage.storage.used} / {quotaUsage.storage.max} GB ({quotaUsage.storage.percent}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-silverGrey/40 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slateBlue rounded-full"
                  style={{ width: `${Math.min(100, quotaUsage.storage.percent)}%` }}
                />
              </div>
            </div>

            {/* Database Quota */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-charcoal">Managed Database Instances</span>
                <span className="font-mono text-charcoal/80">
                  {quotaUsage.databases.used} / {quotaUsage.databases.max} Databases ({quotaUsage.databases.percent}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-silverGrey/40 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slateBlue rounded-full"
                  style={{ width: `${Math.min(100, quotaUsage.databases.percent)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members Table */}
      <div className="bg-white rounded-xl border border-silverGrey shadow-subtle overflow-hidden">
        <div className="p-4 border-b border-silverGrey/70 bg-warmIvory/30 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-charcoal">Tenant Team Members</h3>
            <p className="text-xs text-charcoal/60 mt-0.5">Users authorized to provision and administer resources in this tenant</p>
          </div>
          <span className="text-xs text-charcoal/60">
            Total Members: <strong className="text-charcoal">{members.length}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-warmIvory/50 text-charcoal border-b border-silverGrey font-semibold">
              <tr>
                <th className="px-4 py-3">User Name</th>
                <th className="px-4 py-3">Email Address</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Tenant Boundary</th>
                <th className="px-4 py-3">Joined Date</th>
                <th className="px-4 py-3 text-right">Access Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-silverGrey/50">
              {members.map((m) => (
                <tr key={m._id} className="hover:bg-warmIvory/20 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-slateBlue text-white text-xs font-semibold flex items-center justify-center">
                        {m.name ? m.name[0].toUpperCase() : 'U'}
                      </div>
                      <span className="font-semibold text-charcoal">{m.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-charcoal/70">
                    {m.email}
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge variant={m.role === 'admin' ? 'primary' : 'slate'} size="sm">
                      {m.role === 'admin' ? 'Organization Admin' : 'Cloud Engineer'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-charcoal/70">
                    {m.tenantId}
                  </td>
                  <td className="px-4 py-3.5 text-charcoal/70">
                    {new Date(m.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Member Modal */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => { setInviteModalOpen(false); setFormError(null); }}
        title="Invite Organization Team Member"
        subtitle="Provision an isolated user login bound to this tenant workspace"
      >
        <form onSubmit={handleInvite} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="font-semibold text-charcoal block mb-1">Full Name:</label>
            <input
              type="text"
              placeholder="e.g. Jordan Lee"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg bg-white border border-silverGrey text-charcoal focus:border-slateBlue focus:outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-charcoal block mb-1">Email Address:</label>
            <input
              type="email"
              placeholder="jordan@company.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg bg-white border border-silverGrey text-charcoal focus:border-slateBlue focus:outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-charcoal block mb-1">Access Role:</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white border border-silverGrey text-charcoal focus:border-slateBlue focus:outline-none"
            >
              <option value="engineer">Cloud Engineer (Manage resources)</option>
              <option value="admin">Administrator (Full control)</option>
              <option value="tenant">Auditor / Viewer (Read-only)</option>
            </select>
          </div>

          <div className="p-3 bg-warmIvory/60 rounded-lg border border-silverGrey text-[11px] text-charcoal/80">
            A temporary password will be initialized (<code>CloudSphere@2026</code>) which the user can change upon login.
          </div>

          <div className="pt-3 border-t border-silverGrey/70 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setInviteModalOpen(false)}
              className="cloud-button-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="cloud-button-primary text-xs"
            >
              {submitting ? 'Inviting...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UsersTenants;
