import React, { useState, useEffect } from 'react';
import { useCloud } from '../../context/CloudContext';
import { api } from '../../services/api';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import {
  Layers,
  Plus,
  RefreshCw,
  Search,
  Sliders,
  Trash2,
  AlertCircle,
  Activity,
  ArrowUpDown,
  CheckCircle2,
  Database
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const MemoryManagement = () => {
  const { refreshAllStats, showToast } = useCloud();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Allocate Modal
  const [allocateModalOpen, setAllocateModalOpen] = useState(false);
  const [allocatedGb, setAllocatedGb] = useState(16);
  const [workloadBinding, setWorkloadBinding] = useState('Primary App Server');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Scale Modal
  const [scaleModalOpen, setScaleModalOpen] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState(null);
  const [newGb, setNewGb] = useState(16);

  // Release Modal
  const [releaseModalOpen, setReleaseModalOpen] = useState(false);
  const [allocationToRelease, setAllocationToRelease] = useState(null);

  const fetchRamData = async () => {
    setLoading(true);
    try {
      const res = await api.memory.getSummary();
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
    fetchRamData();
  }, []);

  const handleAllocate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    try {
      const res = await api.memory.allocate({
        allocatedGb,
        workloadBinding,
      });
      showToast(res.message, 'success');
      setAllocateModalOpen(false);
      await fetchRamData();
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
      const res = await api.memory.scale(selectedAllocation._id, {
        allocatedGb: newGb,
      });
      showToast(res.message, 'success');
      setScaleModalOpen(false);
      setSelectedAllocation(null);
      await fetchRamData();
      await refreshAllStats();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRelease = async () => {
    if (!allocationToRelease) return;
    setSubmitting(true);

    try {
      const res = await api.memory.release(allocationToRelease._id);
      showToast(res.message, 'success');
      setReleaseModalOpen(false);
      setAllocationToRelease(null);
      await fetchRamData();
      await refreshAllStats();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const allocationsList = data?.allocations || [];
  const filteredAllocations = allocationsList.filter(item =>
    item.resourceId.toLowerCase().includes(search.toLowerCase()) ||
    item.workloadBinding.toLowerCase().includes(search.toLowerCase())
  );

  const ramTelemetryData = [
    { time: '10:00', memoryUsage: 48 },
    { time: '11:00', memoryUsage: 55 },
    { time: '12:00', memoryUsage: 64 },
    { time: '13:00', memoryUsage: 70 },
    { time: '14:00', memoryUsage: 62 },
    { time: '15:00', memoryUsage: data?.utilizationPercentage || 58 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-silverGrey p-6 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slateBlue/10 text-slateBlue border border-slateBlue/25">
              Memory Fabric
            </span>
            <span className="text-xs text-charcoal/50">•</span>
            <span className="text-xs text-charcoal/60">DDR5 ECC Pooled Memory Orchestration</span>
          </div>
          <h1 className="text-2xl font-semibold text-charcoal tracking-tight">
            Memory Management (RAM)
          </h1>
          <p className="text-sm text-charcoal/70 mt-1">
            Dynamically expand, shrink, and bind physical server memory to container applications and Redis caches.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchRamData}
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
            <span>Allocate Memory Block</span>
          </button>
        </div>
      </div>

      {/* 5 Statistics Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-silverGrey p-4 shadow-subtle">
          <span className="text-xs text-charcoal/60 font-medium">Total RAM Quota</span>
          <div className="text-xl font-semibold text-charcoal mt-1">
            {data?.totalRam || 256} <span className="text-xs text-charcoal/60 font-normal">GB</span>
          </div>
          <p className="text-[11px] text-charcoal/50 mt-2">DDR5-5600 Registered</p>
        </div>

        <div className="bg-white rounded-xl border border-silverGrey p-4 shadow-subtle">
          <span className="text-xs text-charcoal/60 font-medium">Allocated RAM</span>
          <div className="text-xl font-semibold text-slateBlue mt-1">
            {data?.allocatedRam || 0} <span className="text-xs text-charcoal/60 font-normal">GB</span>
          </div>
          <p className="text-[11px] text-charcoal/50 mt-2">Bound to Active Apps</p>
        </div>

        <div className="bg-white rounded-xl border border-silverGrey p-4 shadow-subtle">
          <span className="text-xs text-charcoal/60 font-medium">Currently Used RAM</span>
          <div className="text-xl font-semibold text-charcoal mt-1">
            {data?.usedRam || 0} <span className="text-xs text-charcoal/60 font-normal">GB</span>
          </div>
          <p className="text-[11px] text-charcoal/50 mt-2">Active Working Set</p>
        </div>

        <div className="bg-white rounded-xl border border-silverGrey p-4 shadow-subtle">
          <span className="text-xs text-charcoal/60 font-medium">Available Free RAM</span>
          <div className="text-xl font-semibold text-emerald-700 mt-1">
            {data?.availableRam || 256} <span className="text-xs text-charcoal/60 font-normal">GB</span>
          </div>
          <p className="text-[11px] text-charcoal/50 mt-2">Unallocated Pool</p>
        </div>

        <div className="bg-white rounded-xl border border-silverGrey p-4 shadow-subtle">
          <span className="text-xs text-charcoal/60 font-medium">RAM Utilization %</span>
          <div className="text-xl font-semibold text-charcoal mt-1">
            {data?.utilizationPercentage || 0}%
          </div>
          <div className="w-full h-1.5 bg-silverGrey/40 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-slateBlue rounded-full"
              style={{ width: `${Math.min(100, data?.utilizationPercentage || 0)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Memory Utilization Timeline Chart */}
      <div className="bg-white rounded-xl border border-silverGrey p-5 shadow-subtle">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-charcoal">Memory Allocation & Buffer Timeline</h3>
            <p className="text-xs text-charcoal/60 mt-0.5">Heap memory, cache footprint and tenant boundary buffer metrics</p>
          </div>
          <Badge variant="primary" size="sm">Kernel Telemetry</Badge>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={ramTelemetryData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="ramLoadGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4A4A4A" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4A4A4A" stopOpacity={0.0} />
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
              <Area type="monotone" dataKey="memoryUsage" name="RAM Pool Load %" stroke="#4A4A4A" strokeWidth={2} fill="url(#ramLoadGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Memory Allocation Table */}
      <div className="bg-white rounded-xl border border-silverGrey shadow-subtle overflow-hidden">
        <div className="p-4 border-b border-silverGrey/70 bg-warmIvory/30 flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-charcoal/40 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by module ID or workload binding..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white border border-silverGrey text-xs text-charcoal focus:border-slateBlue focus:outline-none"
            />
          </div>
          <span className="text-xs text-charcoal/60">
            Total Modules: <strong className="text-charcoal">{filteredAllocations.length}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-warmIvory/50 text-charcoal border-b border-silverGrey font-semibold">
              <tr>
                <th className="px-4 py-3">Resource ID</th>
                <th className="px-4 py-3">Workload Binding</th>
                <th className="px-4 py-3">Allocated RAM</th>
                <th className="px-4 py-3">Used RAM</th>
                <th className="px-4 py-3">Memory Pressure</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-silverGrey/50">
              {filteredAllocations.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-charcoal/60">
                    No RAM modules allocated yet. Click "Allocate Memory Block" to create one.
                  </td>
                </tr>
              ) : (
                filteredAllocations.map((item) => {
                  const percent = Math.round(((item.usedGb || 0) / item.allocatedGb) * 100);
                  return (
                    <tr key={item._id} className="hover:bg-warmIvory/20 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-semibold text-charcoal">
                        {item.resourceId}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-charcoal">
                        {item.workloadBinding}
                      </td>
                      <td className="px-4 py-3.5 font-mono font-semibold text-slateBlue">
                        {item.allocatedGb} GB
                      </td>
                      <td className="px-4 py-3.5 font-mono text-charcoal">
                        {item.usedGb || 0} GB
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2 max-w-[120px]">
                          <div className="flex-1 h-1.5 bg-silverGrey/40 rounded-full overflow-hidden">
                            <div className="h-full bg-slateBlue rounded-full" style={{ width: `${percent}%` }} />
                          </div>
                          <span className="text-[10px] font-mono text-charcoal/70">{percent}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant="active" size="sm">
                          {item.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedAllocation(item);
                              setNewGb(item.allocatedGb);
                              setScaleModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-md bg-white border border-silverGrey hover:border-slateBlue hover:text-slateBlue text-charcoal font-medium text-xs flex items-center gap-1 transition-colors"
                          >
                            <Sliders className="w-3 h-3 text-slateBlue" />
                            <span>Scale</span>
                          </button>
                          <button
                            onClick={() => {
                              setAllocationToRelease(item);
                              setReleaseModalOpen(true);
                            }}
                            className="p-1 rounded-md text-charcoal/50 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Allocate Memory */}
      <Modal
        isOpen={allocateModalOpen}
        onClose={() => { setAllocateModalOpen(false); setFormError(null); }}
        title="Provision Dedicated RAM Memory Pool"
        subtitle="Allocate physical DDR5 server memory with workload affinity"
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
              <label className="font-semibold text-charcoal">Select RAM Capacity (GB):</label>
              <span className="font-mono font-semibold px-2 py-0.5 rounded bg-slateBlue/15 text-charcoal">
                {allocatedGb} GB RAM
              </span>
            </div>
            <input
              type="range"
              min="2"
              max={Math.min(64, data?.availableRam || 64)}
              step="2"
              value={allocatedGb}
              onChange={(e) => setAllocatedGb(parseInt(e.target.value, 10))}
              className="w-full accent-slateBlue cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-charcoal/50 mt-1">
              <span>2 GB</span>
              <span>Available Limit: {data?.availableRam || 256} GB</span>
            </div>
          </div>

          <div>
            <label className="font-semibold text-charcoal block mb-1">Workload Binding:</label>
            <select
              value={workloadBinding}
              onChange={(e) => setWorkloadBinding(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white border border-silverGrey text-charcoal focus:border-slateBlue focus:outline-none"
            >
              <option value="Primary App Server">Primary App Server (Node/Go/Java runtime)</option>
              <option value="Redis In-Memory Cache">Redis In-Memory Cache (Key-Value fast tier)</option>
              <option value="Analytics Aggregator">Analytics Aggregator (Vector & OLAP Buffer)</option>
              <option value="Database Buffer Pool">Database Buffer Pool (PostgreSQL Shared Buffers)</option>
            </select>
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

      {/* Modal: Scale RAM (Elasticity Demonstration) */}
      <Modal
        isOpen={scaleModalOpen}
        onClose={() => setScaleModalOpen(false)}
        title={`Scale Memory Block: ${selectedAllocation?.resourceId}`}
        subtitle="Elasticity Demonstration: Dynamically expand or shrink RAM footprint"
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
              <span className="text-charcoal/60 text-[11px] block">Current Size:</span>
              <span className="text-base font-semibold text-charcoal">
                {selectedAllocation?.allocatedGb} GB
              </span>
            </div>
            <ArrowUpDown className="w-5 h-5 text-slateBlue" />
            <div>
              <span className="text-charcoal/60 text-[11px] block">New Target Size:</span>
              <span className="text-base font-semibold text-slateBlue">
                {newGb} GB
              </span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-charcoal">Adjust Memory Capacity:</label>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-slateBlue/15 font-semibold text-charcoal">
                {newGb} GB
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="96"
              step="2"
              value={newGb}
              onChange={(e) => setNewGb(parseInt(e.target.value, 10))}
              className="w-full accent-slateBlue cursor-pointer"
            />
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

      {/* Modal: Release RAM */}
      <Modal
        isOpen={releaseModalOpen}
        onClose={() => setReleaseModalOpen(false)}
        title="Release Memory Allocation"
        subtitle="Confirm decommissioning of this memory pool"
      >
        <div className="space-y-4 text-xs">
          <p className="text-charcoal leading-relaxed">
            Are you sure you want to release <strong className="text-charcoal">{allocationToRelease?.resourceId}</strong> ({allocationToRelease?.allocatedGb} GB)? 
            The memory space will be immediately reclaimed and returned to the tenant's free pool.
          </p>

          <div className="pt-3 border-t border-silverGrey/70 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setReleaseModalOpen(false)}
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

export default MemoryManagement;
