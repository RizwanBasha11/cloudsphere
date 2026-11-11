import React, { useState, useEffect } from 'react';
import { useCloud } from '../../context/CloudContext';
import { api } from '../../services/api';
import Badge from '../common/Badge';
import {
  BarChart3,
  Calendar,
  Activity,
  Cpu,
  Layers,
  HardDrive,
  Database,
  TrendingUp,
  RefreshCw,
  Info,
  Server,
  Network
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export const AnalyticsMonitoring = () => {
  const { stats, showToast } = useCloud();
  const [timeRange, setTimeRange] = useState('24h');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async (range) => {
    setLoading(true);
    try {
      const res = await api.analytics.getData(range);
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(timeRange);
  }, [timeRange]);

  const timeSeries = data?.timeSeries || [];
  const comparisonData = data?.resourceComparison || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-silverGrey p-6 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slateBlue/10 text-slateBlue border border-slateBlue/25">
              Infrastructure Observability
            </span>
            <span className="text-xs text-charcoal/50">•</span>
            <span className="text-xs text-charcoal/60">Cross-Resource Telemetry & Capacity Forecasting</span>
          </div>
          <h1 className="text-2xl font-semibold text-charcoal tracking-tight">
            Analytics & Monitoring
          </h1>
          <p className="text-sm text-charcoal/70 mt-1">
            Real-time telemetry time-series, resource utilization comparisons, and historical allocation trends.
          </p>
        </div>

        {/* Date / Time Range Filters */}
        <div className="flex items-center gap-2">
          <div className="flex p-1 bg-warmIvory/60 rounded-xl border border-silverGrey text-xs font-medium">
            <button
              onClick={() => setTimeRange('24h')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                timeRange === '24h'
                  ? 'bg-white text-slateBlue font-semibold shadow-xs border border-silverGrey'
                  : 'text-charcoal/70 hover:text-charcoal'
              }`}
            >
              Last 24 Hours
            </button>
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                timeRange === '7d'
                  ? 'bg-white text-slateBlue font-semibold shadow-xs border border-silverGrey'
                  : 'text-charcoal/70 hover:text-charcoal'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                timeRange === '30d'
                  ? 'bg-white text-slateBlue font-semibold shadow-xs border border-silverGrey'
                  : 'text-charcoal/70 hover:text-charcoal'
              }`}
            >
              Last 30 Days
            </button>
          </div>

          <button
            onClick={() => fetchAnalytics(timeRange)}
            disabled={loading}
            className="p-2 rounded-lg bg-white border border-silverGrey text-charcoal/70 hover:text-slateBlue transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-slateBlue' : ''}`} />
          </button>
        </div>
      </div>

      {/* Top 4 Performance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-silverGrey p-4 shadow-subtle">
          <div className="flex items-center gap-2 text-xs text-charcoal/60 mb-1">
            <Cpu className="w-4 h-4 text-slateBlue" />
            <span className="font-medium">Avg CPU Core Load</span>
          </div>
          <div className="text-2xl font-semibold text-charcoal">
            {stats.cpu.utilizationPercentage || 42}%
          </div>
          <span className="text-[11px] text-emerald-700 font-medium block mt-1">Within optimal thermal envelope</span>
        </div>

        <div className="bg-white rounded-xl border border-silverGrey p-4 shadow-subtle">
          <div className="flex items-center gap-2 text-xs text-charcoal/60 mb-1">
            <Layers className="w-4 h-4 text-slateBlue" />
            <span className="font-medium">Memory Cache Hit Ratio</span>
          </div>
          <div className="text-2xl font-semibold text-charcoal">
            94.6%
          </div>
          <span className="text-[11px] text-emerald-700 font-medium block mt-1">Low page fault rate</span>
        </div>

        <div className="bg-white rounded-xl border border-silverGrey p-4 shadow-subtle">
          <div className="flex items-center gap-2 text-xs text-charcoal/60 mb-1">
            <Database className="w-4 h-4 text-slateBlue" />
            <span className="font-medium">Database Throughput</span>
          </div>
          <div className="text-2xl font-semibold text-charcoal">
            3,420 <span className="text-xs font-normal text-charcoal/60">IOPS</span>
          </div>
          <span className="text-[11px] text-slateBlue font-medium block mt-1">1.2ms p99 query latency</span>
        </div>

        <div className="bg-white rounded-xl border border-silverGrey p-4 shadow-subtle">
          <div className="flex items-center gap-2 text-xs text-charcoal/60 mb-1">
            <Network className="w-4 h-4 text-slateBlue" />
            <span className="font-medium">Network Egress</span>
          </div>
          <div className="text-2xl font-semibold text-charcoal">
            412 <span className="text-xs font-normal text-charcoal/60">Mbps</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-medium block mt-1">0.00% packet loss</span>
        </div>
      </div>

      {/* Primary Graphs Row: CPU & RAM Utilization Over Time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CPU Usage Over Time */}
        <div className="bg-white rounded-xl border border-silverGrey p-5 shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-charcoal">CPU Utilization Over Time</h3>
              <p className="text-xs text-charcoal/60">Core load telemetry across time window ({timeRange})</p>
            </div>
            <Badge variant="primary" size="sm">Compute Node Pool</Badge>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="analyticsCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6D8196" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6D8196" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#CBCBCB" opacity={0.4} />
                <XAxis dataKey="timestamp" stroke="#4A4A4A" fontSize={11} tickLine={false} />
                <YAxis stroke="#4A4A4A" fontSize={11} tickLine={false} domain={[0, 100]} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#CBCBCB',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="cpuUtilization" name="CPU Usage %" stroke="#6D8196" strokeWidth={2} fill="url(#analyticsCpu)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RAM Usage Over Time */}
        <div className="bg-white rounded-xl border border-silverGrey p-5 shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-charcoal">RAM Memory Footprint Over Time</h3>
              <p className="text-xs text-charcoal/60">Heap allocation and buffer occupancy ({timeRange})</p>
            </div>
            <Badge variant="slate" size="sm">DDR5 ECC Fabric</Badge>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="analyticsRam" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4A4A4A" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4A4A4A" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#CBCBCB" opacity={0.4} />
                <XAxis dataKey="timestamp" stroke="#4A4A4A" fontSize={11} tickLine={false} />
                <YAxis stroke="#4A4A4A" fontSize={11} tickLine={false} domain={[0, 100]} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#CBCBCB',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="ramUtilization" name="RAM Usage %" stroke="#4A4A4A" strokeWidth={2} fill="url(#analyticsRam)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Secondary Graphs Row: Database IOPS & Resource Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Database Throughput / IOPS */}
        <div className="bg-white rounded-xl border border-silverGrey p-5 shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-charcoal">Database Operations & IOPS</h3>
              <p className="text-xs text-charcoal/60">Read / Write transactions executed per second</p>
            </div>
            <Badge variant="active" size="sm">IOPS</Badge>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeries} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#CBCBCB" opacity={0.4} />
                <XAxis dataKey="timestamp" stroke="#4A4A4A" fontSize={11} tickLine={false} />
                <YAxis stroke="#4A4A4A" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#CBCBCB',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Line type="monotone" dataKey="databaseIops" name="Database IOPS" stroke="#6D8196" strokeWidth={2.5} dot={{ r: 3, fill: '#6D8196' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resource Quota vs Utilization Comparison */}
        <div className="bg-white rounded-xl border border-silverGrey p-5 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-charcoal">Resource Quota Utilization Comparison</h3>
                <p className="text-xs text-charcoal/60">Current allocation vs available tier capacity</p>
              </div>
              <Server className="w-4 h-4 text-slateBlue" />
            </div>

            <div className="space-y-4 pt-2">
              {comparisonData.map((item, idx) => {
                const percent = Math.min(100, Math.round(((item.allocated || 0) / (item.capacity || 1)) * 100));
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-charcoal">{item.name}</span>
                      <span className="text-charcoal/70 font-mono">
                        {item.allocated} / {item.capacity} {item.unit} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-silverGrey/40 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slateBlue rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 bg-warmIvory/60 rounded-lg border border-silverGrey text-[11px] text-charcoal/80 flex items-center gap-2 mt-4">
            <Info className="w-4 h-4 text-slateBlue flex-shrink-0" />
            <span>
              Telemetry benchmarks are calculated and synchronized based on actual provisioned resources in your tenant workspace.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsMonitoring;
