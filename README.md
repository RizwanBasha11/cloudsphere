# CloudSphere — Enterprise Cloud Resource Management Platform

**CloudSphere** is a production-quality Multi-Tenant Cloud Resource Management Platform designed and engineered for modern cloud infrastructure orchestration. Built as an advanced Cloud Computing project, CloudSphere demonstrates core cloud principles including **Elasticity**, **Multi-Tenancy**, **Resource Virtualization (CPU, RAM, Databases, Object Storage)**, **Metering & Observability**, and **Zero-Trust Security**.

---

## 🌟 Key Highlights & Academic Objectives

| Cloud Principle | Implementation in CloudSphere |
| :--- | :--- |
| **Cloud Elasticity** | Real-time horizontal and vertical scaling of CPU cores and RAM pools with dynamic quota validation and immediate telemetry updates. |
| **Multi-Tenancy** | Strict tenant isolation where multiple organizations share underlying infrastructure while guaranteeing complete logical, cryptographic, and filesystem isolation. User A cannot view or access User B's resources. |
| **Resource Virtualization** | Abstracted compute nodes (vCPU), memory fabric (DDR5 ECC), multi-engine databases (PostgreSQL, MongoDB, MySQL, Redis), and encrypted object storage vaults. |
| **Resource Governance & Metering** | Enforced tier quotas (e.g., 64 Cores, 256 GB RAM, 500 GB Storage, 20 Databases) with utilization tracking, warning thresholds, and capacity forecasting. |
| **Zero-Trust Security** | 256-bit HMAC-SHA256 JWT sessions, bcrypt password hashing, scoped programmatic API key generation (SHA-256), and immutable audit logs. |

---

## 🎨 Design System & Mandatory Color Palette

CloudSphere adheres strictly to a single light theme inspired by Linear, Stripe, and modern cloud infrastructure platforms:

- **Primary Slate Blue**: `#6D8196` (Primary buttons, active indicators, chart emphasis)
- **Charcoal**: `#4A4A4A` (Headings, primary typography, deep accents)
- **Silver Grey**: `#CBCBCB` (Card borders, dividers, subtle tracks)
- **Warm Ivory**: `#FFFFE3` (Main page canvas and elevated card panels)
- **Card Background**: `#FFFFFF` (Surface cards and modal dialogs)
- **Typography**: **Poppins** Google Font across all headings, metrics, tables, and buttons.

> **Note**: As per design specifications, CloudSphere features exclusively **one unified light theme** with zero dark mode switching or decorative clutter.

---

## 🚀 Quickstart Guide

### Prerequisites
- **Node.js** (v18.0 or higher — verified on Node v24)
- **npm** (v9.0 or higher)

### 1. Installation
Clone or navigate to the project directory:
```bash
cd "cc project"
```

Install root, server, and client dependencies (one-time setup):
```bash
npm install
cd server && npm install && cd ..
cd client && npm install --legacy-peer-deps && cd ..
```

### 2. Start the Application
Run both backend and frontend concurrently with a single command from the project root:
```bash
npm run dev
```

- **Frontend Client**: [http://localhost:5173](http://localhost:5173)
- **Backend API Server**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔑 Pre-Configured Demo Accounts (For Presentation & Evaluation)

For an effortless evaluation, the login page includes **1-Click Demo Login** buttons:

### Tenant 1 (Primary Enterprise Tenant)
- **Login Name**: `meesala dileep kumar` (or Email: `dileep@cloudsphere.io`)
- **Password**: `dileep65`
- **Role**: Infrastructure Administrator (Meesala Dileep Kumar)
- **Organization**: CloudSphere Global Infrastructure (`tenant-cloudsphere-prod`)
- **Initial Resources**: 24 CPU cores allocated, 64 GB RAM pooled, 3 managed databases (PostgreSQL, Redis, MongoDB), encrypted storage files.

### Tenant 2 (Multi-Tenancy Verification Tenant)
- **Email**: `alex@techcorp.com`
- **Password**: `TechCorp@2026`
- **Role**: Tenant Lead
- **Organization**: TechCorp Global Labs (`tenant-techcorp-labs`)
- **Initial Resources**: 6 CPU cores, 24 GB RAM, 1 MySQL database. Completely segregated from Tenant 1.

---

## 🧩 Architectural Modules

### 1. Overview Dashboard
- Personalized greeting: `"Good morning, Welcome to CloudSphere"`
- **4 Major Resource Summary Cards**:
  1. **CPU**: Total allocated cores, utilization %, available cores, progress bar.
  2. **RAM**: Total allocated memory, used memory, available memory, utilization %.
  3. **Database**: Total databases, active status, storage consumption.
  4. **Storage**: Total capacity, used space, available quota, utilization %.
- **Recharts Data Visualizations**: Multi-metric utilization area charts, storage breakdown distribution.
- **Active Services Overview** & **Recent Audit Activities**.
- **Quick Action Provisioning Launcher** (`+ Allocate Resource`).

### 2. Compute Resources (CPU)
- Dedicated virtualization engine with total, allocated, and available cores.
- **Elastic Allocation Interface**: Slider-controlled core provisioning (1–64 cores) bound to workload profiles (API Gateway, Microservices, AI/ML Inference, Worker Queues).
- **Dynamic Elastic Scaling**: Scale existing instances up or down live, testing quota headroom.
- **Decommission / Release**: Release CPU cores back to the free tenant pool.

### 3. Memory Management (RAM)
- DDR5 ECC server memory pooling (Total RAM, Allocated RAM, Used RAM, Available RAM, Utilization %).
- Real-time memory footprint charts and memory pressure meters.
- Elastic increase/decrease scaling and workload bindings (App Server Heap, Redis Cache, Database Buffers).

### 4. Database Management
- Multi-engine provisioning supporting **PostgreSQL**, **MongoDB**, **MySQL**, **Redis**, and **Cassandra**.
- Real database records persisted in backend storage.
- Interactive modal showing encrypted connection strings, port configurations, and replica health.
- Decommissioning with safe confirmation.

### 5. Storage Management
- Dedicated object vault with drag-and-drop upload zone and manual file browser.
- **Multi-Tenant Filesystem Partitioning**: Files uploaded by Tenant 1 are saved in `server/uploads/tenant-cloudsphere-prod/` and cannot be accessed or downloaded by Tenant 2.
- Storage capacity visualizer categorized by file formats (Documents, Images, Archives, Data).
- Secure file downloads and deletion.

### 6. Analytics & Observability
- Historical time-series telemetry with date range filters (**Last 24 Hours**, **Last 7 Days**, **Last 30 Days**).
- Synchronized CPU load, RAM usage, database IOPS throughput, and network egress curves.
- Resource quota vs utilization comparison meters.

### 7. Users & Tenants
- Multi-tenant organization profile and subscription status.
- Real-time quota meters (CPU, RAM, Storage, Database limits).
- Team member list with role assignments (Admin, Cloud Engineer, Auditor) and invitation modal.
- In-dashboard **Multi-Tenant Switcher** for instant side-by-side presentation.

### 8. Security & Access Control
- Zero-Trust security posture overview (98% compliance, TLS 1.3, JWT 256-bit).
- Programmatic API Key Management: Generate `cs_live_...` API keys, copy secret tokens, and revoke credentials.
- Real-time searchable and category-filtered immutable Audit Event Trail.

### 9. Platform Settings
- Tenant configuration, auto-scaling saturation alerts (CPU > 80%, RAM > 85%), maintenance windows, and profile management.
- Built-in College Presentation Architecture Guide.

### 10. Global Command Palette (`Ctrl+K` / `⌘K`)
- Instant keyboard-driven navigation across all 9 pages, resource provisioning, and quick search.

---

## 🛠️ Technology Stack

| Tier | Technologies Used |
| :--- | :--- |
| **Frontend** | React 19, Tailwind CSS v3, Recharts, Lucide React, Google Fonts Poppins |
| **Backend** | Node.js, Express.js REST API Architecture, Multer (File Engine), Morgan |
| **Security & Auth** | JSON Web Tokens (JWT), Bcrypt.js, Crypto (SHA-256 API Keys), CORS |
| **Database Layer** | Dual-Mode Architecture: Live MongoDB & Mongoose + Zero-Config High-Performance In-Memory/File Persistent Engine (`server/data/cloudsphere.json`) |
| **DevOps** | Concurrently, Vite Proxy Gateway, Isolated Tenant Directories |

---

## 🧪 Professor Presentation / Viva FAQ

**Q1: How does CloudSphere demonstrate Cloud Elasticity?**  
*A:* Under the Compute and Memory tabs, an administrator can dynamically scale CPU cores or RAM up and down. The platform checks tenant quota headroom in real-time, adjusts the resource allocation, reflects the change on the live dashboard meters, and logs the elastic scaling event in the immutable audit trail.

**Q2: How is Multi-Tenancy enforced?**  
*A:* Every API request is signed with a JWT containing the user's `tenantId`. The backend middleware extracts this context and enforces tenant boundaries at the database layer (all queries filter by `tenantId`) and at the filesystem layer (files are stored in partitioned directories per tenant).

**Q3: Does the platform require an external MongoDB server to run?**  
*A:* No. CloudSphere features an intelligent **Dual-Mode Data Layer**. If an external MongoDB server is running locally or configured via `MONGODB_URI`, it automatically connects via Mongoose. If MongoDB is not running, CloudSphere seamlessly activates its built-in zero-config persistent document store, ensuring 100% of features, CRUD operations, and multi-tenant persistence work instantly on any computer.

---

## 📜 License
Developed for Academic Evaluation & Demonstration in Cloud Computing.
All rights reserved © 2026 CloudSphere Team.
