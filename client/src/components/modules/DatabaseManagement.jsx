import React, { useState, useEffect } from 'react';
import { useCloud } from '../../context/CloudContext';
import { api } from '../../services/api';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import {
  Database,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  AlertCircle,
  Eye,
  Copy,
  CheckCircle2,
  Server,
  HardDrive,
  Cpu,
  Layers,
  Key
} from 'lucide-react';

export const DatabaseManagement = () => {
  const { stats, refreshAllStats, showToast } = useCloud();
  const [databases, setDatabases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [engineFilter, setEngineFilter] = useState('all');

  // Create Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [dbName, setDbName] = useState('');
  const [dbEngine, setDbEngine] = useState('PostgreSQL');
  const [dbVersion, setDbVersion] = useState('16.2 LTS');
  const [dbStorage, setDbStorage] = useState(2048);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Details Modal
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedDb, setSelectedDb] = useState(null);
  const [copied, setCopied] = useState(false);

  // Delete Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [dbToDelete, setDbToDelete] = useState(null);

  const fetchDatabases = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (engineFilter !== 'all') params.append('engine', engineFilter);

      const res = await api.databases.getAll(params.toString());
      if (res.success) {
        setDatabases(res.data.databases || []);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabases();
  }, [engineFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    try {
      const res = await api.databases.create({
        name: dbName,
        engine: dbEngine,
        version: dbVersion,
        storageMb: dbStorage,
      });
      showToast(res.message, 'success');
      setCreateModalOpen(false);
      setDbName('');
      await fetchDatabases();
      await refreshAllStats();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDetails = async (db) => {
    try {
      const res = await api.databases.getDetails(db._id);
      if (res.success) {
        setSelectedDb(res.database);
        setDetailsModalOpen(true);
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async () => {
    if (!dbToDelete) return;
    setSubmitting(true);

    try {
      const res = await api.databases.delete(dbToDelete._id);
      showToast(res.message, 'success');
      setDeleteModalOpen(false);
      setDbToDelete(null);
      await fetchDatabases();
      await refreshAllStats();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Connection string copied to clipboard!', 'info');
  };

  const filteredDatabases = databases.filter(db =>
    db.name.toLowerCase().includes(search.toLowerCase()) ||
    db.databaseId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-silverGrey p-6 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slateBlue/10 text-slateBlue border border-slateBlue/25">
              Managed Database Clusters
            </span>
            <span className="text-xs text-charcoal/50">•</span>
            <span className="text-xs text-charcoal/60">Persistent Multi-Tenant Storage Engines</span>
          </div>
          <h1 className="text-2xl font-semibold text-charcoal tracking-tight">
            Database Management
          </h1>
          <p className="text-sm text-charcoal/70 mt-1">
            Provision, monitor, and decommission isolated PostgreSQL, MongoDB, Redis, and MySQL database instances.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDatabases}
            disabled={loading}
            className="cloud-button-secondary text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-slateBlue' : ''}`} />
            <span>Sync</span>
          </button>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="cloud-button-primary text-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Database</span>
          </button>
        </div>
      </div>

      {/* Database Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-silverGrey p-5 shadow-subtle">
          <span className="text-xs text-charcoal/60 font-medium">Total Databases</span>
          <div className="text-2xl font-semibold text-charcoal mt-1">
            {databases.length} <span className="text-xs text-charcoal/60 font-normal">Instances</span>
          </div>
          <div className="mt-3 text-[11px] text-charcoal/70 flex items-center justify-between">
            <span>Tenant Max Limit:</span>
            <span className="font-semibold text-charcoal">20 DBs</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-silverGrey p-5 shadow-subtle">
          <span className="text-xs text-charcoal/60 font-medium">Active Status</span>
          <div className="text-2xl font-semibold text-emerald-700 mt-1">
            {databases.filter(d => d.status === 'Active').length} <span className="text-xs text-charcoal/60 font-normal">Online</span>
          </div>
          <div className="mt-3 text-[11px] text-charcoal/70 flex items-center justify-between">
            <span>Availability SLA:</span>
            <span className="font-semibold text-emerald-700">99.99%</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-silverGrey p-5 shadow-subtle">
          <span className="text-xs text-charcoal/60 font-medium">Total Database Storage</span>
          <div className="text-2xl font-semibold text-slateBlue mt-1">
            {(databases.reduce((acc, curr) => acc + (curr.storageMb || 0), 0) / 1024).toFixed(2)}{' '}
            <span className="text-xs text-charcoal/60 font-normal">GB</span>
          </div>
          <div className="mt-3 text-[11px] text-charcoal/70 flex items-center justify-between">
            <span>Storage Type:</span>
            <span className="font-semibold text-charcoal">NVMe gp3 SSD</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-silverGrey p-5 shadow-subtle">
          <span className="text-xs text-charcoal/60 font-medium">Storage Engine Mix</span>
          <div className="text-2xl font-semibold text-charcoal mt-1">
            {new Set(databases.map(d => d.engine)).size} <span className="text-xs text-charcoal/60 font-normal">Engines</span>
          </div>
          <div className="mt-3 text-[11px] text-charcoal/70 flex items-center justify-between">
            <span>Active Protocols:</span>
            <span className="font-semibold text-charcoal">PG / Mongo / Redis</span>
          </div>
        </div>
      </div>

      {/* Database Table Section */}
      <div className="bg-white rounded-xl border border-silverGrey shadow-subtle overflow-hidden">
        {/* Table Filters */}
        <div className="p-4 border-b border-silverGrey/70 bg-warmIvory/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-charcoal/40 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by database name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white border border-silverGrey text-xs text-charcoal focus:border-slateBlue focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={engineFilter}
              onChange={(e) => setEngineFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-white border border-silverGrey text-xs text-charcoal focus:border-slateBlue focus:outline-none"
            >
              <option value="all">All Engines</option>
              <option value="PostgreSQL">PostgreSQL</option>
              <option value="MongoDB">MongoDB</option>
              <option value="MySQL">MySQL</option>
              <option value="Redis">Redis</option>
              <option value="Cassandra">Cassandra</option>
            </select>
          </div>
        </div>

        {/* Database Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-warmIvory/50 text-charcoal border-b border-silverGrey font-semibold">
              <tr>
                <th className="px-4 py-3">Database Name</th>
                <th className="px-4 py-3">Engine & Version</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Storage Consumption</th>
                <th className="px-4 py-3">Port & Host</th>
                <th className="px-4 py-3">Created Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-silverGrey/50">
              {filteredDatabases.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-charcoal/60">
                    No databases found. Click "Create Database" to provision an instance.
                  </td>
                </tr>
              ) : (
                filteredDatabases.map((db) => (
                  <tr key={db._id} className="hover:bg-warmIvory/20 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-slateBlue/10 text-slateBlue">
                          <Database className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-semibold text-charcoal block">{db.name}</span>
                          <span className="text-[10px] text-charcoal/50 font-mono">{db.databaseId}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="engine" size="sm">{db.engine}</Badge>
                        <span className="text-[11px] text-charcoal/60 font-mono">{db.version}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant="active" size="sm">{db.status}</Badge>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-charcoal">
                      {(db.storageMb / 1024).toFixed(2)} GB SSD
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[11px] text-charcoal/70">
                      port: {db.port}
                    </td>
                    <td className="px-4 py-3.5 text-charcoal/70">
                      {new Date(db.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenDetails(db)}
                          title="View Connection Details"
                          className="px-2.5 py-1 rounded-md bg-white border border-silverGrey hover:border-slateBlue hover:text-slateBlue text-charcoal font-medium text-xs flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3 h-3 text-slateBlue" />
                          <span>Details</span>
                        </button>
                        <button
                          onClick={() => {
                            setDbToDelete(db);
                            setDeleteModalOpen(true);
                          }}
                          title="Delete Database"
                          className="p-1 rounded-md text-charcoal/50 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Database */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => { setCreateModalOpen(false); setFormError(null); }}
        title="Provision Managed Cloud Database"
        subtitle="Deploys an isolated, high-availability database cluster backed by MongoDB persistence"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="font-semibold text-charcoal block mb-1">Database Identifier / Name:</label>
            <input
              type="text"
              placeholder="e.g. analytics-lake-01, auth-sessions-redis"
              value={dbName}
              onChange={(e) => setDbName(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg bg-white border border-silverGrey text-charcoal focus:border-slateBlue focus:outline-none"
            />
            <span className="text-[10px] text-charcoal/50 mt-1 block">
              Alphanumeric characters, underscores, and hyphens only.
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-charcoal block mb-1">Database Engine:</label>
              <select
                value={dbEngine}
                onChange={(e) => {
                  setDbEngine(e.target.value);
                  const verMap = {
                    'PostgreSQL': '16.2 LTS',
                    'MongoDB': '7.0 Enterprise',
                    'MySQL': '8.2 Enterprise',
                    'Redis': '7.2 Cluster',
                    'Cassandra': '4.1 Distributed',
                  };
                  setDbVersion(verMap[e.target.value] || 'Latest');
                }}
                className="w-full px-3 py-2 rounded-lg bg-white border border-silverGrey text-charcoal focus:border-slateBlue focus:outline-none"
              >
                <option value="PostgreSQL">PostgreSQL</option>
                <option value="MongoDB">MongoDB</option>
                <option value="MySQL">MySQL</option>
                <option value="Redis">Redis</option>
                <option value="Cassandra">Cassandra</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-charcoal block mb-1">Engine Version:</label>
              <input
                type="text"
                value={dbVersion}
                onChange={(e) => setDbVersion(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-silverGrey text-charcoal focus:border-slateBlue focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-charcoal block mb-1">Initial Storage Tier:</label>
            <select
              value={dbStorage}
              onChange={(e) => setDbStorage(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 rounded-lg bg-white border border-silverGrey text-charcoal focus:border-slateBlue focus:outline-none"
            >
              <option value="1024">1,024 MB (1 GB SSD) — Development</option>
              <option value="2048">2,048 MB (2 GB SSD) — Staging</option>
              <option value="5120">5,120 MB (5 GB NVMe) — Production Standard</option>
              <option value="10240">10,240 MB (10 GB NVMe) — High Throughput</option>
            </select>
          </div>

          <div className="p-3 bg-warmIvory/60 rounded-lg border border-silverGrey text-[11px] text-charcoal/80">
            Database instance credentials and TLS encryption certificates are automatically generated upon provisioning.
          </div>

          <div className="pt-3 border-t border-silverGrey/70 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="cloud-button-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="cloud-button-primary text-xs"
            >
              {submitting ? 'Provisioning...' : 'Provision Database'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: View Database Details & Connection String */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title={`Database: ${selectedDb?.name}`}
        subtitle={`Engine: ${selectedDb?.engine} ${selectedDb?.version} | Status: ${selectedDb?.status}`}
        maxWidth="max-w-xl"
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3 p-3 bg-warmIvory/50 rounded-xl border border-silverGrey">
            <div>
              <span className="text-[10px] text-charcoal/60 uppercase font-semibold">Instance ID:</span>
              <p className="font-mono font-medium text-charcoal mt-0.5">{selectedDb?.databaseId}</p>
            </div>
            <div>
              <span className="text-[10px] text-charcoal/60 uppercase font-semibold">SLA Health:</span>
              <p className="font-semibold text-emerald-700 mt-0.5">{selectedDb?.healthStatus || '99.99% Operational'}</p>
            </div>
            <div>
              <span className="text-[10px] text-charcoal/60 uppercase font-semibold">Replication Latency:</span>
              <p className="font-mono text-charcoal mt-0.5">{selectedDb?.replicationLagMs || '1.1ms'}</p>
            </div>
            <div>
              <span className="text-[10px] text-charcoal/60 uppercase font-semibold">Storage Allocated:</span>
              <p className="font-mono text-charcoal mt-0.5">{selectedDb?.storageMb} MB SSD</p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-charcoal">Connection String (Encrypted Preview):</label>
              <button
                onClick={() => copyToClipboard(selectedDb?.connectionStringPreview || '')}
                className="text-[11px] text-slateBlue hover:underline flex items-center gap-1 font-medium"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy String'}</span>
              </button>
            </div>
            <div className="p-3 bg-gray-900 text-gray-100 rounded-lg font-mono text-[11px] break-all border border-gray-700">
              {selectedDb?.connectionStringPreview}
            </div>
          </div>

          <div className="pt-2 border-t border-silverGrey/70 flex justify-end">
            <button
              onClick={() => setDetailsModalOpen(false)}
              className="cloud-button-primary text-xs"
            >
              Done
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Delete Database Confirmation */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Database Instance"
        subtitle="Confirm decommissioning of database"
      >
        <div className="space-y-4 text-xs">
          <p className="text-charcoal leading-relaxed">
            Are you sure you want to permanently delete database <strong className="text-charcoal">{dbToDelete?.name}</strong> ({dbToDelete?.engine})? 
            All stored tables, collections, and automated backups will be permanently terminated.
          </p>

          <div className="pt-3 border-t border-silverGrey/70 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setDeleteModalOpen(false)}
              className="cloud-button-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={submitting}
              className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-medium hover:bg-rose-700 transition-colors"
            >
              {submitting ? 'Terminating...' : 'Confirm & Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DatabaseManagement;
