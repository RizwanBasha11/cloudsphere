import React, { useState, useEffect } from 'react';
import { useCloud } from '../../context/CloudContext';
import { api } from '../../services/api';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import {
  Cpu,
  Plus,
  RefreshCw,
  Search,
  Sliders,
  Trash2,
  AlertCircle,
  Activity,
  CheckCircle2,
  TrendingUp,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const ComputeManagement = () => {
  const { stats, refreshAllStats, showToast } = useCloud();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Allocation Modal
  const [allocateModalOpen, setAllocateModalOpen] = useState(false);
  const [coresToAllocate, setCoresToAllocate] = useState(4);
  const [workloadType, setWorkloadType] = useState('Microservices Node');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Edit / Scale Modal
  const [scaleModalOpen, setScaleModalOpen] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState(null);
  const [newCores, setNewCores] = useState(4);

  // Delete Confirm Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [allocationToDelete, setAllocationToDelete] = useState(null);

  const fetchCpuData = async () => {
    setLoading(true);
    try {
      const res = await api.compute.getSummary();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCpuData();
  }, []);

  const handleAllocate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    try {
      const res = await api.compute.allocate({
        cores: coresToAllocate,
        workloadType,
        notes,
      });
      showToast(res.message, 'success');
      setAllocateModalOpen(false);
      setNotes('');
      await fetchCpuData();
      await refreshAllStats();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleScale = async (e) => {
    e.preventDefault();
    if (!selectedAllocation) return;
    setSubmitting(true);
    setFormError(null);

    try {
      const res = await api.compute.update(selectedAllocation._id, {
        cores: newCores,
      });
      showToast(res.message, 'success');
      setScaleModalOpen(false);
      setSelectedAllocation(null);
      await fetchCpuData();
      await refreshAllStats();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRelease = async () => {
    if (!allocationToDelete) return;
    setSubmitting(true);

    try {
      const res = await api.compute.release(allocationToDelete._id);
      showToast(res.message, 'success');
      setDeleteModalOpen(false);
      setAllocationToDelete(null);
      await fetchCpuData();
      await refreshAllStats();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const allocationsList = data?.allocations || [];
  const filteredAllocations = allocationsList.filter(item => {
    const matchesSearch = item.resourceId.toLowerCase().includes(search.toLowerCase()) ||
      item.workloadType.toLowerCase().includes(search.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || item.status.toLowerCase().includes(statusFilter.toLowerCase());
    return matchesSearch && matchesStatus;
  });

  const cpuGraphData = [
    { time: '10:00', load: 38 },
    { time: '11:00', load: 45 },
    { time: '12:00', load: 68 },
    { time: '13:00', load: 72 },
    { time: '14:00', load: 54 },
    { time: '15:00', load: data?.utilizationPercentage || 45 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Primary Action */}
      <div className="bg-white rounded-2xl border border-silverGrey p-6 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slateBlue/10 text-slateBlue border border-slateBlue/25">
              Elastic Virtualization
            </span>
            <span className="text-xs text-charcoal/50">•</span>
            <span className="text-xs text-charcoal/60">Dynamic Core Provisioning & Orchestration</span>
          </div>
          <h1 className="text-2xl font-semibold text-charcoal tracking-tight">
            Compute Resource Management
          </h1>
          <p className="text-sm text-charcoal/70 mt-1">
            Scale dedicated virtual CPU cores, balance worker nodes, and release elastic compute instances.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCpuData}
            disabled={loading}
            className="cloud-button-secondary text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-slateBlue' : ''}`} />
            <span>Sync</span>
          </button>
          <button
            onClick={() => setAllocateModalOpen(true)}
            className="cloud-button-primary text-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Allocate CPU Cores</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-silverGrey p-5 shadow-subtle">
          <span className="text-xs text-charcoal/60 font-medium">Total CPU Quota</span>
          <div className="text-2xl font-semibold text-charcoal mt-1">
            {data?.totalCores || 64} <span className="text-xs text-charcoal/60 font-normal">Cores</span>
          </div>
          <div className="mt-3 text-[11px] text-charcoal/70 flex items-center justify-between">
            <span>Hardware Model:</span>
            <span className="font-semibold text-charcoal">AMD EPYC™ 9654</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-silverGrey p-5 shadow-subtle">
          <span className="text-xs text-charcoal/60 font-medium">Allocated Cores</span>
          <div className="text-2xl font-semibold text-slateBlue mt-1">
            {data?.allocatedCores || 0} <span className="text-xs text-charcoal/60 font-normal">Cores</span>
          </div>
          <div className="mt-3 text-[11px] text-charcoal/70 flex items-center justify-between">
            <span>Quota Used:</span>
            <span className="font-semibold text-charcoal">
              {data ? Math.round((data.allocatedCores / data.totalCores) * 100) : 0}%
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-silverGrey p-5 shadow-subtle">
          <span className="text-xs text-charcoal/60 font-medium">Available Free Cores</span>
          <div className="text-2xl font-semibold text-emerald-700 mt-1">
            {data?.availableCores || 64} <span className="text-xs text-charcoal/60 font-normal">Cores</span>
          </div>
          <div className="mt-3 text-[11px] text-charcoal/70 flex items-center justify-between">
            <span>Capacity Status:</span>
            <span className="font-semibold text-emerald-700">Healthy Headroom</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-silverGrey p-5 shadow-subtle">
          <span className="text-xs text-charcoal/60 font-medium">Current Utilization</span>
          <div className="text-2xl font-semibold text-charcoal mt-1">
            {data?.utilizationPercentage || 0}%
          </div>
          <div className="w-full h-1.5 bg-silverGrey/40 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-slateBlue rounded-full"
              style={{ width: `${Math.min(100, data?.utilizationPercentage || 0)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Allocation History & Real-time Chart */}
      <div className="bg-white rounded-xl border border-silverGrey p-5 shadow-subtle">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-charcoal">CPU Load & Allocation History</h3>
            <p className="text-xs text-charcoal/60 mt-0.5">Continuous telemetry sampling across provisioned cores</p>
          </div>
          <Badge variant="primary" size="sm">Real-time Telemetry</Badge>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cpuGraphData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="cpuLoadGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6D8196" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#6D8196" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#CBCBCB" opacity={0.4} />
              <XAxis dataKey="time" stroke="#4A4A4A" fontSize={11} tickLine={false} />
              <YAxis stroke="#4A4A4A" fontSize={11} tickLine={false} domain={[0, 100]} unit="%" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#CBCBCB',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Area type="monotone" dataKey="load" name="CPU Core Load %" stroke="#6D8196" strokeWidth={2} fill="url(#cpuLoadGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Allocation Management Table */}
      <div className="bg-white rounded-xl border border-silverGrey shadow-subtle overflow-hidden">
        {/* Table Filters */}
        <div className="p-4 border-b border-silverGrey/70 bg-warmIvory/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-charcoal/40 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter by Resource ID, workload, or note..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white border border-silverGrey text-xs text-charcoal focus:border-slateBlue focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-white border border-silverGrey text-xs text-charcoal focus:border-slateBlue focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="scaled">Scaled</option>
              <option value="optimizing">Optimizing</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-warmIvory/50 text-charcoal border-b border-silverGrey font-semibold">
              <tr>
                <th className="px-4 py-3">Resource ID</th>
                <th className="px-4 py-3">Workload Profile</th>
                <th className="px-4 py-3">Allocated Cores</th>
                <th className="px-4 py-3">Load %</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-silverGrey/50">
              {filteredAllocations.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-charcoal/60">
                    No compute allocations found. Click "Allocate CPU Cores" to provision one.
                  </td>
                </tr>
              ) : (
                filteredAllocations.map((item) => (
                  <tr key={item._id} className="hover:bg-warmIvory/20 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-semibold text-charcoal">
                      {item.resourceId}
                    </td>
                    <td className="px-4 py-3.5">
                      <div>
                        <span className="font-semibold text-charcoal block">{item.workloadType}</span>
                        <span className="text-[11px] text-charcoal/60 block truncate max-w-xs">{item.notes}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded bg-slateBlue/15 font-semibold text-charcoal font-mono">
                        {item.cores} Cores
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-charcoal">
                      {item.utilization || 45}%
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={item.status.includes('Scaled') ? 'primary' : 'active'} size="sm">
                        {item.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-charcoal/70">
                      {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedAllocation(item);
                            setNewCores(item.cores);
                            setScaleModalOpen(true);
                          }}
                          title="Modify / Scale Cores"
                          className="px-2.5 py-1 rounded-md bg-white border border-silverGrey hover:border-slateBlue hover:text-slateBlue text-charcoal font-medium text-xs flex items-center gap-1 transition-colors"
                        >
                          <Sliders className="w-3 h-3 text-slateBlue" />
                          <span>Scale</span>
                        </button>
                        <button
                          onClick={() => {
                            setAllocationToDelete(item);
                            setDeleteModalOpen(true);
                          }}
                          title="Release Cores"
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

      {/* Modal: Allocate CPU */}
      <Modal
        isOpen={allocateModalOpen}
        onClose={() => { setAllocateModalOpen(false); setFormError(null); }}
        title="Allocate Elastic Compute (CPU)"
        subtitle="Provision dedicated processor cores with real-time elasticity enforcement"
      >
        <form onSubmit={handleAllocate} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-charcoal">Select Number of CPU Cores:</label>
              <span className="font-mono font-semibold px-2 py-0.5 rounded bg-slateBlue/15 text-charcoal">
                {coresToAllocate} Cores
              </span>
            </div>
            <input
              type="range"
              min="1"
              max={Math.min(32, data?.availableCores || 32)}
              value={coresToAllocate}
              onChange={(e) => setCoresToAllocate(parseInt(e.target.value, 10))}
              className="w-full accent-slateBlue cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-charcoal/50 mt-1">
              <span>1 Core</span>
              <span>Available Limit: {data?.availableCores || 0} Cores</span>
            </div>
          </div>

          <div>
            <label className="font-semibold text-charcoal block mb-1">Workload Profile:</label>
            <select
              value={workloadType}
              onChange={(e) => setWorkloadType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white border border-silverGrey text-charcoal focus:border-slateBlue focus:outline-none"
            >
              <option value="API Gateway Cluster">API Gateway Cluster</option>
              <option value="Microservices Node">Microservices Node</option>
              <option value="AI / ML Inference">AI / ML Inference</option>
              <option value="Background Workers">Background Workers</option>
              <option value="Real-time WebSocket">Real-time WebSocket</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-charcoal block mb-1">Description / Cluster Notes:</label>
            <input
              type="text"
              placeholder="e.g. Primary Kubernetes ingress controller node"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white border border-silverGrey text-charcoal focus:border-slateBlue focus:outline-none"
            />
          </div>

          <div className="p-3 bg-warmIvory/60 rounded-lg border border-silverGrey text-[11px] text-charcoal/80">
            Current Tenant Limit: {data?.totalCores} max cores. Available headroom: {data?.availableCores} cores.
          </div>

          <div className="pt-3 border-t border-silverGrey/70 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAllocateModalOpen(false)}
              className="cloud-button-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="cloud-button-primary text-xs"
            >
              {submitting ? 'Allocating...' : 'Confirm Allocation'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Scale Allocation (Elasticity Demonstration) */}
      <Modal
        isOpen={scaleModalOpen}
        onClose={() => { setScaleModalOpen(false); setFormError(null); }}
        title={`Scale Compute: ${selectedAllocation?.resourceId}`}
        subtitle="Elasticity Demonstration: Dynamically increase or decrease core allocation"
      >
        <form onSubmit={handleScale} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="p-3 rounded-xl bg-warmIvory/60 border border-silverGrey flex items-center justify-between">
            <div>
              <span className="text-charcoal/60 text-[11px] block">Current Allocation:</span>
              <span className="text-base font-semibold text-charcoal">
                {selectedAllocation?.cores} Cores
              </span>
            </div>
            <ArrowUpDown className="w-5 h-5 text-slateBlue" />
            <div>
              <span className="text-charcoal/60 text-[11px] block">New Target Allocation:</span>
              <span className="text-base font-semibold text-slateBlue">
                {newCores} Cores
              </span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-charcoal">Adjust Cores Slider:</label>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-slateBlue/15 font-semibold text-charcoal">
                {newCores} Cores
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="48"
              value={newCores}
              onChange={(e) => setNewCores(parseInt(e.target.value, 10))}
              className="w-full accent-slateBlue cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-charcoal/50 mt-1">
              <span>Scale Down (1 Core)</span>
              <span>Scale Up (48 Cores)</span>
            </div>
          </div>

          <div className="pt-3 border-t border-silverGrey/70 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setScaleModalOpen(false)}
              className="cloud-button-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="cloud-button-primary text-xs"
            >
              {submitting ? 'Applying Scaling...' : 'Apply Elastic Scaling'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Delete / Release Confirmation */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Release Compute Resource"
        subtitle="Confirm decommissioning of this CPU node"
      >
        <div className="space-y-4 text-xs">
          <p className="text-charcoal leading-relaxed">
            Are you sure you want to release <strong className="text-charcoal">{allocationToDelete?.resourceId}</strong> ({allocationToDelete?.cores} cores)? 
            The cores will be immediately decommissioned and returned to the tenant's available pool.
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
              onClick={handleRelease}
              disabled={submitting}
              className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-medium hover:bg-rose-700 transition-colors"
            >
              {submitting ? 'Releasing...' : 'Confirm & Release'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ComputeManagement;
