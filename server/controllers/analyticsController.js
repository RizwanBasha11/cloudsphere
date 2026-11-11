import CpuAllocation from '../models/CpuAllocation.js';
import RamAllocation from '../models/RamAllocation.js';
import CloudDatabase from '../models/CloudDatabase.js';
import StorageFile from '../models/StorageFile.js';
import Tenant from '../models/Tenant.js';
import ActivityLog from '../models/ActivityLog.js';

export const getAnalyticsData = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { timeRange = '24h' } = req.query;

    const tenant = await Tenant.findOne({ tenantId });
    const cpuAllocations = await CpuAllocation.find({ tenantId });
    const ramAllocations = await RamAllocation.find({ tenantId });
    const databases = await CloudDatabase.find({ tenantId });
    const files = await StorageFile.find({ tenantId });
    const logs = await ActivityLog.find({ tenantId }).sort({ createdAt: -1 }).limit(20);

    const totalCores = cpuAllocations.reduce((sum, item) => sum + item.cores, 0);
    const totalRamGb = ramAllocations.reduce((sum, item) => sum + item.allocatedGb, 0);
    const totalDbStorageMb = databases.reduce((sum, item) => sum + item.storageMb, 0);
    const totalFileBytes = files.reduce((sum, item) => sum + item.sizeBytes, 0);
    const totalStorageGb = Number((totalFileBytes / (1024 * 1024 * 1024)).toFixed(3));

    // Base current utilization
    const baseCpuUtil = totalCores > 0
      ? cpuAllocations.reduce((acc, curr) => acc + (curr.cores * curr.utilization), 0) / totalCores
      : 30;

    const baseRamUtil = totalRamGb > 0
      ? (ramAllocations.reduce((acc, curr) => acc + curr.usedGb, 0) / totalRamGb) * 100
      : 35;

    // Generate coherent historical timeline points based on timeRange
    let pointsCount = 12;
    let labelPrefix = 'h';
    let timeLabels = [];

    if (timeRange === '24h') {
      timeLabels = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
    } else if (timeRange === '7d') {
      timeLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    } else {
      timeLabels = ['W1', 'W2', 'W3', 'W4'];
    }

    const timeSeries = timeLabels.map((time, idx) => {
      // Natural harmonic variation around baseline
      const variance = Math.sin(idx * 0.8) * 12 + ((idx % 3) * 2 - 2);
      const cpu = Math.max(10, Math.min(95, Number((baseCpuUtil + variance).toFixed(1))));
      const ram = Math.max(15, Math.min(92, Number((baseRamUtil + variance * 0.6).toFixed(1))));
      const iops = Math.round(1800 + (cpu * 25) + (idx * 30));
      const networkMbps = Math.round(120 + (cpu * 4.5));

      return {
        timestamp: time,
        cpuUtilization: cpu,
        ramUtilization: ram,
        storageGb: Number((totalStorageGb * (0.85 + (idx / timeLabels.length) * 0.15)).toFixed(2)),
        databaseIops: iops,
        networkThroughputMbps: networkMbps,
      };
    });

    // Breakdown comparisons
    const resourceComparison = [
      { name: 'Compute Cores', allocated: totalCores, capacity: tenant?.maxCpuCores || 64, unit: 'Cores' },
      { name: 'Memory', allocated: totalRamGb, capacity: tenant?.maxRamGb || 256, unit: 'GB' },
      { name: 'Object Storage', allocated: totalStorageGb, capacity: tenant?.maxStorageGb || 500, unit: 'GB' },
      { name: 'Databases', allocated: databases.length, capacity: tenant?.maxDatabases || 20, unit: 'Instances' },
    ];

    return res.json({
      success: true,
      timeRange,
      metrics: {
        totalCores,
        totalRamGb,
        totalDbStorageMb,
        totalStorageGb,
        totalDatabases: databases.length,
        totalFiles: files.length,
        activeTenantsCount: 1, // Isolated per tenant
      },
      timeSeries,
      resourceComparison,
      recentLogs: logs,
    });
  } catch (error) {
    console.error('[AnalyticsController.getAnalyticsData] Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
