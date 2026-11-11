import React, { useState, useEffect } from 'react';
import { useCloud } from '../../context/CloudContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import StatCard from '../common/StatCard';
import Badge from '../common/Badge';
import {
  Cpu,
  Layers,
  Database,
  HardDrive,
  Activity,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Server,
  Zap,
  Shield,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export const Overview = () => {
  const { stats, setActiveTab, setQuickActionModal } = useCloud();
  const { user, tenant } = useAuth();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        const res = await api.analytics.getData('24h');
        if (res.success) {
          setAnalytics(res);
        }
      } catch (err) {
        console.warn('Could not load analytics for overview', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOverviewData();
  }, [stats]);

  const timeSeriesData = analytics?.timeSeries || [
    { timestamp: '00:00', cpuUtilization: 42, ramUtilization: 52, databaseIops: 2100 },
    { timestamp: '04:00', cpuUtilization: 38, ramUtilization: 49, databaseIops: 1950 },
    { timestamp: '08:00', cpuUtilization: 65, ramUtilization: 68, databaseIops: 3400 },
    { timestamp: '12:00', cpuUtilization: 78, ramUtilization: 74, databaseIops: 4200 },
    { timestamp: '16:00', cpuUtilization: 71, ramUtilization: 70, databaseIops: 3800 },
    { timestamp: '20:00', cpuUtilization: 54, ramUtilization: 60, databaseIops: 2800 },
    { timestamp: '22:00', cpuUtilization: 45, ramUtilization: 54, databaseIops: 2300 },
  ];

  const storageBreakdownData = [
    { name: 'Databases', size: stats.databases.totalStorageMb ? (stats.databases.totalStorageMb / 1024).toFixed(1) : 4.2 },
    { name: 'Vault Files', size: stats.storage.usedStorageGb || 2.1 },
    { name: 'Snapshots', size: 3.5 },
    { name: 'Logs & Metrics', size: 1.8 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Impressive Dashboard Landing Header */}
      <div className="bg-white rounded-2xl border border-silverGrey p-6 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slateBlue/10 text-slateBlue border border-slateBlue/25">
              Live Cloud Infrastructure
            </span>
            <span className="text-xs text-charcoal/50">•</span>
            <span className="text-xs text-charcoal/60 font-mono">Tenant: {tenant?.name || 'Enterprise'}</span>
          </div>
          <h1 className="text-2xl font-semibold text-charcoal tracking-tight">
            Good morning, Welcome to CloudSphere
          </h1>
          <p className="text-sm text-charcoal/70 mt-1">
            Monitor and manage your cloud infrastructure from one place.
          </p>
        </div>

        {/* Quick Action Buttons for Allocating Resources */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setQuickActionModal({ open: true, type: 'cpu' })}
            className="cloud-button-primary text-xs flex items-center gap-1.5"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Allocate CPU</span>
          </button>
          <button
            onClick={() => setQuickActionModal({ open: true, type: 'ram' })}
            className="cloud-button-secondary text-xs flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-slateBlue" />
            <span>Allocate RAM</span>
          </button>
          <button
            onClick={() => setQuickActionModal({ open: true, type: 'db' })}
            className="cloud-button-secondary text-xs flex items-center gap-1.5"
          >
            <Database className="w-3.5 h-3.5 text-slateBlue" />
            <span>New Database</span>
          </button>
          <button
            onClick={() => setQuickActionModal({ open: true, type: 'file' })}
            className="cloud-button-secondary text-xs flex items-center gap-1.5"
          >
            <HardDrive className="w-3.5 h-3.5 text-slateBlue" />
            <span>Upload File</span>
          </button>
        </div>
      </div>

      {/* 4 Major Resource Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. CPU Card */}
        <StatCard
          title="CPU Compute"
          subtitle="Elastic Cores"
          icon={Cpu}
          mainValue={stats.cpu.allocatedCores}
          unit={`/ ${stats.cpu.totalCores} Cores`}
          utilizationPercent={stats.cpu.utilizationPercentage}
          actionText="Manage CPU"
          onAction={() => setActiveTab('compute')}
          metrics={[
            { label: 'Total Allocated', value: `${stats.cpu.allocatedCores} Cores` },
            { label: 'Available Cores', value: `${stats.cpu.availableCores} Cores` },
            { label: 'Quota Limit', value: `${stats.cpu.totalCores} Cores` },
            { label: 'Active Clusters', value: stats.cpu.activeNodesCount || '3 Nodes' },
          ]}
        />

        {/* 2. RAM Card */}
        <StatCard
          title="Memory Management"
          subtitle="DDR5 Server Pools"
          icon={Layers}
          mainValue={stats.ram.allocatedRam}
          unit={`/ ${stats.ram.totalRam} GB`}
          utilizationPercent={stats.ram.utilizationPercentage}
          actionText="Manage RAM"
          onAction={() => setActiveTab('memory')}
          metrics={[
            { label: 'Allocated Memory', value: `${stats.ram.allocatedRam} GB` },
            { label: 'Currently Used', value: `${stats.ram.usedRam} GB` },
            { label: 'Available Memory', value: `${stats.ram.availableRam} GB` },
            { label: 'Cache Utilization', value: `${stats.ram.utilizationPercentage}%` },
          ]}
        />

        {/* 3. Database Card */}
        <StatCard
          title="Managed Databases"
          subtitle="Multi-Engine Clusters"
          icon={Database}
          mainValue={stats.databases.totalDatabases}
          unit="Active Instances"
          actionText="View Databases"
          onAction={() => setActiveTab('database')}
          metrics={[
            { label: 'Total Databases', value: stats.databases.totalDatabases },
            { label: 'Active Status', value: stats.databases.activeDatabases },
            { label: 'Storage Consumed', value: `${(stats.databases.totalStorageMb / 1024).toFixed(2)} GB` },
            { label: 'Engines Running', value: 'PG, Mongo, Redis' },
          ]}
        />

        {/* 4. Storage Card */}
        <StatCard
          title="Object Storage Vault"
          subtitle="Tenant S3 Quota"
          icon={HardDrive}
          mainValue={stats.storage.usedStorageGb}
          unit={`/ ${stats.storage.totalCapacityGb} GB`}
          utilizationPercent={stats.storage.utilizationPercentage}
          actionText="Manage Vault"
          onAction={() => setActiveTab('storage')}
          metrics={[
            { label: 'Total Capacity', value: `${stats.storage.totalCapacityGb} GB` },
            { label: 'Used Storage', value: `${stats.storage.usedStorageGb} GB` },
            { label: 'Available Space', value: `${stats.storage.availableStorageGb} GB` },
            { label: 'Stored Objects', value: stats.storage.totalFilesCount || '2 Objects' },
          ]}
        />
      </div>

      {/* Interactive Charts Section using Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Resource Utilization Chart (CPU vs RAM %) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-silverGrey p-5 shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-charcoal">
                Resource Utilization Timeline
              </h3>
              <p className="text-xs text-charcoal/60 mt-0.5">
                Real-time synchronized CPU cores & RAM memory consumption telemetry
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-charcoal/70 bg-warmIvory/60 px-2 py-1 rounded border border-silverGrey">
                <span className="w-2 h-2 rounded-full bg-slateBlue" /> CPU %
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-charcoal/70 bg-warmIvory/60 px-2 py-1 rounded border border-silverGrey">
                <span className="w-2 h-2 rounded-full bg-charcoal" /> RAM %
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6D8196" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6D8196" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="ramGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4A4A4A" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4A4A4A" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#CBCBCB" opacity={0.5} />
                <XAxis dataKey="timestamp" stroke="#4A4A4A" fontSize={11} tickLine={false} />
                <YAxis stroke="#4A4A4A" fontSize={11} tickLine={false} domain={[0, 100]} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#CBCBCB',
                    borderRadius: '8px',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(74,74,74,0.1)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="cpuUtilization"
                  name="CPU Utilization"
                  stroke="#6D8196"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#cpuGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="ramUtilization"
                  name="RAM Utilization"
                  stroke="#4A4A4A"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#ramGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Storage & Database Consumption Chart */}
        <div className="bg-white rounded-xl border border-silverGrey p-5 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-charcoal">
                  Storage Consumption
                </h3>
                <p className="text-xs text-charcoal/60 mt-0.5">
                  Allocated storage distribution across cloud services
                </p>
              </div>
              <HardDrive className="w-5 h-5 text-slateBlue" />
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={storageBreakdownData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#CBCBCB" opacity={0.5} />
                  <XAxis dataKey="name" stroke="#4A4A4A" fontSize={10} tickLine={false} />
                  <YAxis stroke="#4A4A4A" fontSize={11} tickLine={false} unit="GB" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#CBCBCB',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="size" name="Allocated Size (GB)" fill="#6D8196" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-3 bg-warmIvory/60 rounded-lg border border-silverGrey text-[11px] text-charcoal/80 flex items-center justify-between mt-2">
            <span>Total Tenant Quota:</span>
            <span className="font-semibold text-charcoal">{stats.storage.totalCapacityGb} GB SSD</span>
          </div>
        </div>
      </div>

      {/* Active Services Overview & Recent Activities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Cloud Services Overview */}
        <div className="bg-white rounded-xl border border-silverGrey p-5 shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-charcoal">Active Services</h3>
              <p className="text-xs text-charcoal/60 mt-0.5">Provisioned cloud components</p>
            </div>
            <Server className="w-4 h-4 text-slateBlue" />
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-lg border border-silverGrey bg-warmIvory/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-slateBlue/10 text-slateBlue">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-charcoal">Compute Virtualization</p>
                  <p className="text-[11px] text-charcoal/60">{stats.cpu.allocatedCores} Cores Allocated</p>
                </div>
              </div>
              <Badge variant="active" size="sm">Operational</Badge>
            </div>

            <div className="p-3 rounded-lg border border-silverGrey bg-warmIvory/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-slateBlue/10 text-slateBlue">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-charcoal">Memory Fabric</p>
                  <p className="text-[11px] text-charcoal/60">{stats.ram.allocatedRam} GB DDR5 Pooled</p>
                </div>
              </div>
              <Badge variant="active" size="sm">Optimal</Badge>
            </div>

            <div className="p-3 rounded-lg border border-silverGrey bg-warmIvory/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-slateBlue/10 text-slateBlue">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-charcoal">Managed Database Engine</p>
                  <p className="text-[11px] text-charcoal/60">{stats.databases.activeDatabases} Active Clusters</p>
                </div>
              </div>
              <Badge variant="active" size="sm">Healthy</Badge>
            </div>

            <div className="p-3 rounded-lg border border-silverGrey bg-warmIvory/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-slateBlue/10 text-slateBlue">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-charcoal">Encrypted Object Vault</p>
                  <p className="text-[11px] text-charcoal/60">{stats.storage.usedStorageGb} GB In Use</p>
                </div>
              </div>
              <Badge variant="active" size="sm">Secured</Badge>
            </div>
          </div>
        </div>

        {/* Recent Resource Activities */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-silverGrey p-5 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-charcoal">Recent Activities</h3>
                <p className="text-xs text-charcoal/60 mt-0.5">Immutable audit events and allocation lifecycle</p>
              </div>
              <button
                onClick={() => setActiveTab('security')}
                className="text-xs font-medium text-slateBlue hover:underline flex items-center gap-1"
              >
                <span>Audit Log</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-silverGrey/50 max-h-72 overflow-y-auto">
              {(!analytics?.recentLogs || analytics.recentLogs.length === 0) ? (
                <div className="p-6 text-center text-xs text-charcoal/50">
                  No activity events recorded yet.
                </div>
              ) : (
                analytics.recentLogs.slice(0, 5).map((log, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-2 h-2 rounded-full bg-slateBlue flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="font-semibold text-charcoal block truncate">
                          {log.action}
                        </span>
                        <span className="text-[11px] text-charcoal/70 block truncate">
                          {log.details}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 text-right">
                      <Badge variant="slate" size="sm">
                        {log.category}
                      </Badge>
                      <span className="text-[10px] text-charcoal/50 font-mono">
                        {new Date(log.createdAt || log.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-silverGrey/50 flex items-center gap-2 text-[11px] text-charcoal/60">
            <Info className="w-3.5 h-3.5 text-slateBlue flex-shrink-0" />
            <span>
              All sample statistics and telemetry curves are synchronized with active tenant quotas.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
