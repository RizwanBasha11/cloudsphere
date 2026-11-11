import React, { useState } from 'react';
import { useCloud } from '../../context/CloudContext';
import { api } from '../../services/api';
import Modal from './Modal';
import { Cpu, Layers, Database, HardDrive, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';

export const QuickActionModal = () => {
  const { quickActionModal, setQuickActionModal, refreshAllStats, showToast } = useCloud();
  const { open, type } = quickActionModal;

  const [activeType, setActiveType] = useState(type || 'cpu');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Form states
  const [cpuCores, setCpuCores] = useState(4);
  const [cpuWorkload, setCpuWorkload] = useState('Microservices Node');

  const [ramGb, setRamGb] = useState(16);
  const [ramBinding, setRamBinding] = useState('Primary App Server');

  const [dbName, setDbName] = useState('');
  const [dbEngine, setDbEngine] = useState('PostgreSQL');
  const [dbStorage, setDbStorage] = useState(2048);

  const [selectedFile, setSelectedFile] = useState(null);

  // Sync activeType when modal opens
  React.useEffect(() => {
    if (type) setActiveType(type);
    setError(null);
  }, [type, open]);

  const handleClose = () => {
    setQuickActionModal({ open: false, type: 'cpu' });
    setError(null);
    setDbName('');
    setSelectedFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (activeType === 'cpu') {
        const res = await api.compute.allocate({ cores: cpuCores, workloadType: cpuWorkload });
        showToast(res.message || `Allocated ${cpuCores} CPU cores!`, 'success');
      } else if (activeType === 'ram') {
        const res = await api.memory.allocate({ allocatedGb: ramGb, workloadBinding: ramBinding });
        showToast(res.message || `Allocated ${ramGb} GB RAM!`, 'success');
      } else if (activeType === 'db') {
        if (!dbName.trim()) throw new Error('Please enter a database instance name.');
        const res = await api.databases.create({ name: dbName, engine: dbEngine, storageMb: dbStorage });
        showToast(res.message || `Provisioned ${dbEngine} database "${dbName}"!`, 'success');
      } else if (activeType === 'file') {
        if (!selectedFile) throw new Error('Please choose a file to upload.');
        const formData = new FormData();
        formData.append('file', selectedFile);
        const res = await api.storage.upload(formData);
        showToast(res.message || `File uploaded successfully!`, 'success');
      }

      await refreshAllStats();
      handleClose();
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={handleClose}
      title="Provision Cloud Infrastructure"
      subtitle="Instantly deploy and scale compute, memory, database, or storage resources"
      maxWidth="max-w-lg"
    >
      <div>
        {/* Resource Type Switcher Tabs */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-warmIvory/60 rounded-xl border border-silverGrey mb-5">
          <button
            type="button"
            onClick={() => { setActiveType('cpu'); setError(null); }}
            className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-xs font-medium transition-all ${
              activeType === 'cpu'
                ? 'bg-white text-slateBlue font-semibold shadow-xs border border-silverGrey'
                : 'text-charcoal/70 hover:text-charcoal'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>CPU</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveType('ram'); setError(null); }}
            className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-xs font-medium transition-all ${
              activeType === 'ram'
                ? 'bg-white text-slateBlue font-semibold shadow-xs border border-silverGrey'
                : 'text-charcoal/70 hover:text-charcoal'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>RAM</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveType('db'); setError(null); }}
            className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-xs font-medium transition-all ${
              activeType === 'db'
                ? 'bg-white text-slateBlue font-semibold shadow-xs border border-silverGrey'
                : 'text-charcoal/70 hover:text-charcoal'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Database</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveType('file'); setError(null); }}
            className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-xs font-medium transition-all ${
              activeType === 'file'
                ? 'bg-white text-slateBlue font-semibold shadow-xs border border-silverGrey'
                : 'text-charcoal/70 hover:text-charcoal'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>Storage</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* CPU Allocation Form */}
          {activeType === 'cpu' && (
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-charcoal">CPU Cores to Allocate:</label>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-slateBlue/15 text-charcoal font-semibold">
                    {cpuCores} Cores
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="32"
                  value={cpuCores}
                  onChange={(e) => setCpuCores(parseInt(e.target.value, 10))}
                  className="w-full accent-slateBlue cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-charcoal/50 mt-0.5">
                  <span>1 Core (Micro)</span>
                  <span>16 Cores (Cluster)</span>
                  <span>32 Cores (High Perf)</span>
                </div>
              </div>

              <div>
                <label className="font-semibold text-charcoal block mb-1">Workload Profile / Purpose:</label>
                <select
                  value={cpuWorkload}
                  onChange={(e) => setCpuWorkload(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-silverGrey text-charcoal focus:border-slateBlue focus:outline-none"
                >
                  <option value="API Gateway Cluster">API Gateway Cluster (Inbound Routing)</option>
                  <option value="Microservices Node">Microservices Node (App Workers)</option>
                  <option value="AI / ML Inference">AI / ML Inference (Batch & Neural)</option>
                  <option value="Background Workers">Background Workers (Queue Workers)</option>
                  <option value="Real-time WebSocket">Real-time WebSocket Server</option>
                </select>
              </div>

              <div className="p-3 rounded-lg bg-warmIvory/60 border border-silverGrey text-charcoal/80 text-[11px] leading-relaxed">
                Allocates dedicated virtual CPU execution units within your tenant security boundary. Elastic scaling can adjust or release cores at any time.
              </div>
            </div>
          )}

          {/* RAM Allocation Form */}
          {activeType === 'ram' && (
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-charcoal">RAM Memory Capacity:</label>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-slateBlue/15 text-charcoal font-semibold">
                    {ramGb} GB RAM
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="64"
                  step="2"
                  value={ramGb}
                  onChange={(e) => setRamGb(parseInt(e.target.value, 10))}
                  className="w-full accent-slateBlue cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-charcoal/50 mt-0.5">
                  <span>2 GB (Base)</span>
                  <span>32 GB (Production)</span>
                  <span>64 GB (Max Pool)</span>
                </div>
              </div>

              <div>
                <label className="font-semibold text-charcoal block mb-1">Workload Binding:</label>
                <select
                  value={ramBinding}
                  onChange={(e) => setRamBinding(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-silverGrey text-charcoal focus:border-slateBlue focus:outline-none"
                >
                  <option value="Primary App Server">Primary App Server (Heap)</option>
                  <option value="Redis In-Memory Cache">Redis In-Memory Cache (Key-Value)</option>
                  <option value="Analytics Aggregator">Analytics Aggregator (In-Memory Lake)</option>
                  <option value="Database Buffer Pool">Database Buffer Pool (Cache Pages)</option>
                </select>
              </div>

              <div className="p-3 rounded-lg bg-warmIvory/60 border border-silverGrey text-charcoal/80 text-[11px] leading-relaxed">
                Allocates high-speed DDR5 ECC physical server memory directly attached to selected workload cluster.
              </div>
            </div>
          )}

          {/* Database Creation Form */}
          {activeType === 'db' && (
            <div className="space-y-3">
              <div>
                <label className="font-semibold text-charcoal block mb-1">Database Instance Name:</label>
                <input
                  type="text"
                  placeholder="e.g. users-auth-db, analytics-store"
                  value={dbName}
                  onChange={(e) => setDbName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-white border border-silverGrey text-charcoal focus:border-slateBlue focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Database Engine:</label>
                  <select
                    value={dbEngine}
                    onChange={(e) => setDbEngine(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-silverGrey text-charcoal focus:border-slateBlue focus:outline-none"
                  >
                    <option value="PostgreSQL">PostgreSQL (Relational)</option>
                    <option value="MongoDB">MongoDB (Document)</option>
                    <option value="MySQL">MySQL (Relational)</option>
                    <option value="Redis">Redis (In-Memory Key/Val)</option>
                    <option value="Cassandra">Cassandra (Wide-Column)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Initial Storage:</label>
                  <select
                    value={dbStorage}
                    onChange={(e) => setDbStorage(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-silverGrey text-charcoal focus:border-slateBlue focus:outline-none"
                  >
                    <option value="1024">1 GB SSD</option>
                    <option value="2048">2 GB SSD</option>
                    <option value="5120">5 GB NVMe</option>
                    <option value="10240">10 GB NVMe</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-warmIvory/60 border border-silverGrey text-charcoal/80 text-[11px] leading-relaxed">
                Provisions a dedicated MongoDB/Postgres database instance with automatic connection string generation and storage monitoring.
              </div>
            </div>
          )}

          {/* Storage Upload Form */}
          {activeType === 'file' && (
            <div className="space-y-3">
              <div>
                <label className="font-semibold text-charcoal block mb-1">Select File to Upload:</label>
                <div className="border-2 border-dashed border-silverGrey rounded-xl p-5 text-center hover:border-slateBlue bg-warmIvory/30 transition-colors">
                  <Upload className="w-8 h-8 text-slateBlue mx-auto mb-2" />
                  <input
                    type="file"
                    id="quick-file-upload"
                    onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                    className="hidden"
                  />
                  <label
                    htmlFor="quick-file-upload"
                    className="cursor-pointer text-xs font-semibold text-slateBlue hover:underline block"
                  >
                    {selectedFile ? selectedFile.name : 'Click to browse or drag file here'}
                  </label>
                  <p className="text-[11px] text-charcoal/50 mt-1">
                    {selectedFile
                      ? `Size: ${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
                      : 'Supports documents, JSON, configs, archives up to 50MB'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-3 border-t border-silverGrey/70 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="cloud-button-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="cloud-button-primary text-xs flex items-center gap-1.5"
            >
              {submitting ? 'Provisioning...' : 'Confirm & Deploy'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default QuickActionModal;
