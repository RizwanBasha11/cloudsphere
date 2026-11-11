import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Tenant from '../models/Tenant.js';
import CpuAllocation from '../models/CpuAllocation.js';
import RamAllocation from '../models/RamAllocation.js';
import CloudDatabase from '../models/CloudDatabase.js';
import StorageFile from '../models/StorageFile.js';
import ApiKey from '../models/ApiKey.js';
import ActivityLog from '../models/ActivityLog.js';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('[CloudSphere Seed] Database already seeded. Skipping initial seed.');
      return;
    }

    console.log('[CloudSphere Seed] Seeding initial CloudSphere multi-tenant data...');

    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('dileep65', salt);
    const tenantPassword = await bcrypt.hash('TechCorp@2026', salt);

    // 1. Create Tenant 1: Enterprise Cloud
    const tenant1 = await Tenant.create({
      tenantId: 'tenant-cloudsphere-prod',
      name: 'CloudSphere Global Infrastructure',
      plan: 'Enterprise Cloud',
      maxCpuCores: 64,
      maxRamGb: 256,
      maxStorageGb: 500,
      maxDatabases: 20,
      region: 'us-east-1 (N. Virginia)',
      tierStatus: 'Healthy / Active',
    });

    // 2. Create User 1 (Admin)
    const user1 = await User.create({
      name: 'Meesala Dileep Kumar',
      email: 'dileep@cloudsphere.io',
      password: adminPassword,
      role: 'admin',
      tenantId: tenant1.tenantId,
      tenantName: tenant1.name,
    });

    // Compute Allocations for Tenant 1 (Total: 24 cores / 64 max)
    await CpuAllocation.create([
      {
        resourceId: 'cpu-node-101',
        tenantId: tenant1.tenantId,
        userId: user1._id,
        cores: 8,
        workloadType: 'API Gateway Cluster',
        status: 'Active',
        utilization: 46.2,
        notes: 'High-availability Kong / Envoy reverse proxy and edge routing',
      },
      {
        resourceId: 'cpu-node-102',
        tenantId: tenant1.tenantId,
        userId: user1._id,
        cores: 12,
        workloadType: 'Microservices Node',
        status: 'Active',
        utilization: 58.4,
        notes: 'Core billing, user profiles, and catalog microservices pool',
      },
      {
        resourceId: 'cpu-node-103',
        tenantId: tenant1.tenantId,
        userId: user1._id,
        cores: 4,
        workloadType: 'Background Workers',
        status: 'Active',
        utilization: 32.1,
        notes: 'RabbitMQ and Celery async queue processing cluster',
      },
    ]);

    // RAM Allocations for Tenant 1 (Total: 64 GB / 256 max)
    await RamAllocation.create([
      {
        resourceId: 'ram-mod-201',
        tenantId: tenant1.tenantId,
        userId: user1._id,
        allocatedGb: 32,
        usedGb: 21.6,
        workloadBinding: 'Primary App Server',
        status: 'Active',
      },
      {
        resourceId: 'ram-mod-202',
        tenantId: tenant1.tenantId,
        userId: user1._id,
        allocatedGb: 16,
        usedGb: 11.2,
        workloadBinding: 'Redis In-Memory Cache',
        status: 'Cached',
      },
      {
        resourceId: 'ram-mod-203',
        tenantId: tenant1.tenantId,
        userId: user1._id,
        allocatedGb: 16,
        usedGb: 8.4,
        workloadBinding: 'Database Buffer Pool',
        status: 'Active',
      },
    ]);

    // Databases for Tenant 1
    await CloudDatabase.create([
      {
        databaseId: 'db-8021',
        tenantId: tenant1.tenantId,
        userId: user1._id,
        name: 'production-postgres-core',
        engine: 'PostgreSQL',
        version: '16.2 LTS',
        status: 'Active',
        storageMb: 8450,
        connectionHost: 'pg-prod-core.cloudsphere.internal',
        port: 5432,
        iops: 5000,
      },
      {
        databaseId: 'db-8022',
        tenantId: tenant1.tenantId,
        userId: user1._id,
        name: 'session-cache-redis',
        engine: 'Redis',
        version: '7.2 Cluster',
        status: 'Active',
        storageMb: 1200,
        connectionHost: 'redis-cache.cloudsphere.internal',
        port: 6379,
        iops: 10000,
      },
      {
        databaseId: 'db-8023',
        tenantId: tenant1.tenantId,
        userId: user1._id,
        name: 'telemetry-mongo-lake',
        engine: 'MongoDB',
        version: '7.0 Enterprise',
        status: 'Active',
        storageMb: 14200,
        connectionHost: 'mongo-telemetry.cloudsphere.internal',
        port: 27017,
        iops: 4200,
      },
    ]);

    // Sample storage files for Tenant 1
    const uploadDir = path.join(__dirname, '..', 'uploads', tenant1.tenantId);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const sampleFilePath1 = path.join(uploadDir, 'cloud-architecture-spec.json');
    fs.writeFileSync(sampleFilePath1, JSON.stringify({ project: 'CloudSphere', version: '2.4', region: 'us-east-1', redundancy: 'multi-az' }, null, 2));

    await StorageFile.create([
      {
        fileId: 'obj-44102',
        tenantId: tenant1.tenantId,
        userId: user1._id,
        fileName: 'cloud-architecture-spec.json',
        originalName: 'cloud-architecture-spec.json',
        fileType: 'application/json',
        sizeBytes: 1024 * 420, // 420 KB
        filePath: sampleFilePath1,
      },
      {
        fileId: 'obj-44103',
        tenantId: tenant1.tenantId,
        userId: user1._id,
        fileName: 'backup-snapshot-2026-11.tar.gz',
        originalName: 'backup-snapshot-2026-11.tar.gz',
        fileType: 'application/gzip',
        sizeBytes: 1024 * 1024 * 24.5, // 24.5 MB
        filePath: sampleFilePath1,
      },
    ]);

    // API Key for Tenant 1
    const apiKeyHash1 = crypto.createHash('sha256').update('cs_live_9a7d88e0192bc54fae87').digest('hex');
    await ApiKey.create({
      keyId: 'key-1092',
      tenantId: tenant1.tenantId,
      userId: user1._id,
      name: 'Terraform Automation Key',
      prefix: 'cs_live_9a7d88',
      maskedKey: 'cs_live_9a7d88••••••••••••••',
      hashedKey: apiKeyHash1,
      role: 'Full Infrastructure Admin',
      status: 'active',
      lastUsedAt: new Date(),
    });

    // Activity Logs for Tenant 1
    await ActivityLog.create([
      {
        tenantId: tenant1.tenantId,
        userId: user1._id,
        userName: user1.name,
        userEmail: user1.email,
        action: 'ALLOCATE_CPU',
        category: 'Compute',
        details: 'Provisioned 8 cores for [API Gateway Cluster] (cpu-node-101).',
        status: 'Success',
        ipAddress: '192.168.1.10',
      },
      {
        tenantId: tenant1.tenantId,
        userId: user1._id,
        userName: user1.name,
        userEmail: user1.email,
        action: 'PROVISION_DATABASE',
        category: 'Database',
        details: 'Provisioned PostgreSQL 16.2 database "production-postgres-core".',
        status: 'Success',
        ipAddress: '192.168.1.10',
      },
      {
        tenantId: tenant1.tenantId,
        userId: user1._id,
        userName: user1.name,
        userEmail: user1.email,
        action: 'SCALE_RAM',
        category: 'Memory',
        details: 'Allocated 32 GB RAM to Primary App Server pool (ram-mod-201).',
        status: 'Success',
        ipAddress: '192.168.1.10',
      },
    ]);

    // 3. Create Tenant 2 (Multi-tenancy demonstration!)
    const tenant2 = await Tenant.create({
      tenantId: 'tenant-techcorp-labs',
      name: 'TechCorp Global Labs',
      plan: 'Growth Tier',
      maxCpuCores: 32,
      maxRamGb: 128,
      maxStorageGb: 250,
      maxDatabases: 10,
      region: 'eu-west-1 (Frankfurt)',
      tierStatus: 'Healthy / Active',
    });

    const user2 = await User.create({
      name: 'Alex Rivera',
      email: 'alex@techcorp.com',
      password: tenantPassword,
      role: 'admin',
      tenantId: tenant2.tenantId,
      tenantName: tenant2.name,
    });

    await CpuAllocation.create([
      {
        resourceId: 'cpu-node-501',
        tenantId: tenant2.tenantId,
        userId: user2._id,
        cores: 6,
        workloadType: 'AI / ML Inference',
        status: 'Active',
        utilization: 78.2,
        notes: 'PyTorch model inference batch worker',
      },
    ]);

    await RamAllocation.create([
      {
        resourceId: 'ram-mod-601',
        tenantId: tenant2.tenantId,
        userId: user2._id,
        allocatedGb: 24,
        usedGb: 16.8,
        workloadBinding: 'Analytics Aggregator',
        status: 'Active',
      },
    ]);

    await CloudDatabase.create([
      {
        databaseId: 'db-9011',
        tenantId: tenant2.tenantId,
        userId: user2._id,
        name: 'techcorp-analytics-mysql',
        engine: 'MySQL',
        version: '8.2',
        status: 'Active',
        storageMb: 3200,
        connectionHost: 'mysql-techcorp.cloudsphere.internal',
        port: 3306,
        iops: 2500,
      }
    ]);

    console.log('[CloudSphere Seed] Seed completed successfully!');
    console.log('  -> Tenant 1: meesala dileep kumar (or dileep@cloudsphere.io) / dileep65');
    console.log('  -> Tenant 2: alex@techcorp.com / TechCorp@2026');
  } catch (error) {
    console.error('[CloudSphere Seed] Error seeding database:', error.message);
  }
};
