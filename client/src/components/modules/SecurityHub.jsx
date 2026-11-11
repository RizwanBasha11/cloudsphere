import React, { useState, useEffect } from 'react';
import { useCloud } from '../../context/CloudContext';
import { api } from '../../services/api';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import {
  ShieldCheck,
  Key,
  Lock,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Copy,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

export const SecurityHub = () => {
  const { showToast } = useCloud();
  const [overview, setOverview] = useState(null);
  const [keys, setKeys] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logCategory, setLogCategory] = useState('all');

  // Key Generation Modal
  const [createKeyModalOpen, setCreateKeyModalOpen] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [keyRole, setKeyRole] = useState('Read & Write');
  const [submitting, setSubmitting] = useState(false);
  const [newlyGeneratedKey, setNewlyGeneratedKey] = useState(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const fetchSecurityData = async () => {
    setLoading(true);
    try {
      const [overviewRes, keysRes, logsRes] = await Promise.all([
        api.security.getOverview(),
        api.security.getKeys(),
        api.security.getAuditLogs(logCategory),
      ]);

      if (overviewRes.success) setOverview(overviewRes.securityStats);
      if (keysRes.success) setKeys(keysRes.keys || []);
      if (logsRes.success) setLogs(logsRes.logs || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
  }, [logCategory]);

  const handleGenerateKey = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await api.security.createKey({ name: keyName, role: keyRole });
      showToast('API Key generated successfully!', 'success');
      setNewlyGeneratedKey(res.plainTextKey);
      setKeyName('');
      await fetchSecurityData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevokeKey = async (id, name) => {
    if (!window.confirm(`Revoke API key "${name}"? Applications using this key will immediately lose access.`)) return;

    try {
      const res = await api.security.revokeKey(id);
      showToast(res.message, 'success');
      await fetchSecurityData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
    showToast('API Key copied to clipboard!', 'info');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-silverGrey p-6 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slateBlue/10 text-slateBlue border border-slateBlue/25">
              Zero-Trust Security
            </span>
            <span className="text-xs text-charcoal/50">•</span>
            <span className="text-xs text-charcoal/60">Compliance, Keys & Immutable Audit Trail</span>
          </div>
          <h1 className="text-2xl font-semibold text-charcoal tracking-tight">
            Security & Access Control
          </h1>
          <p className="text-sm text-charcoal/70 mt-1">
            Manage programmatic API credentials, monitor security posture compliance, and inspect tenant activity logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchSecurityData}
            disabled={loading}
            className="cloud-button-secondary text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-slateBlue' : ''}`} />
            <span>Sync</span>
          </button>
          <button
            onClick={() => {
              setNewlyGeneratedKey(null);
              setCreateKeyModalOpen(true);
            }}
            className="cloud-button-primary text-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Generate API Key</span>
          </button>
        </div>
      </div>

      {/* Security Posture Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-silverGrey p-4 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs text-charcoal/60 font-medium">Security Health Score</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-semibold text-emerald-700 mt-1">
            {overview?.healthScore || 98}%
          </div>
          <span className="text-[11px] text-charcoal/70 mt-1 block">
            {overview?.status || 'Enterprise Guard Active'}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-silverGrey p-4 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs text-charcoal/60 font-medium">Session & Token Protocol</span>
            <Lock className="w-4 h-4 text-slateBlue" />
          </div>
          <div className="text-lg font-semibold text-charcoal mt-1">
            JWT (HMAC-256)
          </div>
          <span className="text-[11px] text-charcoal/70 mt-1 block">
            30-day encrypted rolling tokens
          </span>
        </div>

        <div className="bg-white rounded-xl border border-silverGrey p-4 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs text-charcoal/60 font-medium">Transport Layer Encryption</span>
            <Key className="w-4 h-4 text-slateBlue" />
          </div>
          <div className="text-lg font-semibold text-charcoal mt-1">
            {overview?.tlsVersion || 'TLS 1.3 Strict'}
          </div>
          <span className="text-[11px] text-charcoal/70 mt-1 block">
            ECDSA P-384 / AES-256-GCM
          </span>
        </div>

        <div className="bg-white rounded-xl border border-silverGrey p-4 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs text-charcoal/60 font-medium">Active API Credentials</span>
            <Key className="w-4 h-4 text-slateBlue" />
          </div>
          <div className="text-2xl font-semibold text-charcoal mt-1">
            {keys.filter(k => k.status === 'active').length} <span className="text-xs font-normal text-charcoal/60">Keys</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-medium mt-1 block">
            Automated rotation enabled
          </span>
        </div>
      </div>

      {/* API Keys Table */}
      <div className="bg-white rounded-xl border border-silverGrey shadow-subtle overflow-hidden">
        <div className="p-4 border-b border-silverGrey/70 bg-warmIvory/30 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-charcoal">Programmatic API Keys</h3>
            <p className="text-xs text-charcoal/60 mt-0.5">Use API keys for Terraform, CLI, and automated CI/CD deployments</p>
          </div>
          <button
            onClick={() => {
              setNewlyGeneratedKey(null);
              setCreateKeyModalOpen(true);
            }}
            className="cloud-button-primary text-xs flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            <span>New API Key</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-warmIvory/50 text-charcoal border-b border-silverGrey font-semibold">
              <tr>
                <th className="px-4 py-3">Key Label / Name</th>
                <th className="px-4 py-3">Key ID</th>
                <th className="px-4 py-3">Masked Secret</th>
                <th className="px-4 py-3">Permissions</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-silverGrey/50">
              {keys.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-charcoal/60">
                    No API keys created yet. Generate one to authenticate automated scripts.
                  </td>
                </tr>
              ) : (
                keys.map((k) => (
                  <tr key={k._id} className="hover:bg-warmIvory/20 transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-charcoal">
                      {k.name}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-charcoal/70">
                      {k.keyId}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[11px] text-charcoal">
                      {k.maskedKey}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant="slate" size="sm">{k.role}</Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={k.status === 'active' ? 'active' : 'danger'} size="sm">
                        {k.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-charcoal/70">
                      {new Date(k.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {k.status === 'active' && (
                        <button
                          onClick={() => handleRevokeKey(k._id, k.name)}
                          className="px-2 py-1 rounded bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 text-xs font-medium transition-colors"
                        >
                          Revoke Key
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Immutable Audit Log Table */}
      <div className="bg-white rounded-xl border border-silverGrey shadow-subtle overflow-hidden">
        <div className="p-4 border-b border-silverGrey/70 bg-warmIvory/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-charcoal">Security & Audit Event Trail</h3>
            <p className="text-xs text-charcoal/60 mt-0.5">Immutable record of resource modifications and authentication attempts</p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={logCategory}
              onChange={(e) => setLogCategory(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-white border border-silverGrey text-xs text-charcoal focus:border-slateBlue focus:outline-none"
            >
              <option value="all">All Event Categories</option>
              <option value="Compute">Compute</option>
              <option value="Memory">Memory</option>
              <option value="Database">Database</option>
              <option value="Storage">Storage</option>
              <option value="Security">Security</option>
              <option value="Auth">Auth</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-warmIvory/50 text-charcoal border-b border-silverGrey font-semibold">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Event Details</th>
                <th className="px-4 py-3">User / Actor</th>
                <th className="px-4 py-3">IP Address</th>
                <th className="px-4 py-3 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-silverGrey/50">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-warmIvory/20 transition-colors">
                  <td className="px-4 py-3 font-mono text-charcoal/70 whitespace-nowrap">
                    {new Date(log.createdAt || log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="px-4 py-3 font-semibold text-charcoal whitespace-nowrap">
                    {log.action}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="slate" size="sm">{log.category}</Badge>
                  </td>
                  <td className="px-4 py-3 text-charcoal/80 max-w-sm truncate">
                    {log.details}
                  </td>
                  <td className="px-4 py-3 text-charcoal font-medium">
                    {log.userName || log.userEmail || 'System'}
                  </td>
                  <td className="px-4 py-3 font-mono text-charcoal/60">
                    {log.ipAddress || '127.0.0.1'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Badge variant={log.status === 'Success' ? 'active' : log.status === 'Warning' ? 'warning' : 'danger'} size="sm">
                      {log.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate API Key Modal */}
      <Modal
        isOpen={createKeyModalOpen}
        onClose={() => setCreateKeyModalOpen(false)}
        title="Generate Programmatic API Key"
        subtitle="Create an encrypted secret key for external cloud API orchestration"
      >
        {!newlyGeneratedKey ? (
          <form onSubmit={handleGenerateKey} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-charcoal block mb-1">Key Description / Name:</label>
              <input
                type="text"
                placeholder="e.g. Terraform-Production-Deployer"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg bg-white border border-silverGrey text-charcoal focus:border-slateBlue focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-charcoal block mb-1">Permission Scope:</label>
              <select
                value={keyRole}
                onChange={(e) => setKeyRole(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-silverGrey text-charcoal focus:border-slateBlue focus:outline-none"
              >
                <option value="Read & Write">Read & Write (Full Resource Management)</option>
                <option value="Read-Only">Read-Only (Telemetry & Inspection)</option>
                <option value="Full Infrastructure Admin">Full Infrastructure Admin</option>
              </select>
            </div>

            <div className="pt-3 border-t border-silverGrey/70 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCreateKeyModalOpen(false)}
                className="cloud-button-secondary text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="cloud-button-primary text-xs"
              >
                {submitting ? 'Generating...' : 'Generate Key'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Copy this API key now!</span>
                For security reasons, CloudSphere never stores the plain text key. You won't be able to see it again.
              </div>
            </div>

            <div>
              <label className="font-semibold text-charcoal block mb-1">Generated Secret Key:</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={newlyGeneratedKey}
                  className="w-full px-3 py-2 rounded-lg bg-gray-900 text-gray-100 font-mono text-xs border border-gray-700"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(newlyGeneratedKey)}
                  className="px-3 py-2 rounded-lg bg-slateBlue text-white hover:bg-slateBlue-dark flex items-center gap-1 font-medium transition-colors"
                >
                  {copiedKey ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedKey ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-silverGrey/70 flex justify-end">
              <button
                type="button"
                onClick={() => setCreateKeyModalOpen(false)}
                className="cloud-button-primary text-xs"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SecurityHub;
