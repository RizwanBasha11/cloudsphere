# 🚀 CloudSphere — Cloud Deployment Guide

This guide explains how to deploy **CloudSphere** to live production cloud hosting with a public HTTPS URL.

---

## ⚡ Method 1: Deploy on Render.com (Free & Recommended)

Render provides free hosting for full-stack Node.js web applications and automatically generates an **HTTPS URL** (e.g. `https://cloudsphere.onrender.com`).

### Step-by-Step:
1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Deploy CloudSphere Enterprise Platform"
   # Create a new repository on github.com (e.g., https://github.com/YOUR_USERNAME/cloudsphere.git)
   git remote add origin https://github.com/YOUR_USERNAME/cloudsphere.git
   git branch -M main
   git push -u origin main
   ```

2. **Connect to Render**:
   - Go to [https://render.com](https://render.com) and log in (with GitHub).
   - Click **"New +"** -> **"Web Service"**.
   - Select your `cloudsphere` GitHub repository.

3. **Configure Settings**:
   - **Name**: `cloudsphere-platform`
   - **Region**: Choose closest to you (e.g. Oregon, Frankfurt, Singapore)
   - **Branch**: `main`
   - **Root Directory**: Leave blank (uses root)
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm install && npm run build
     ```
   - **Start Command**:
     ```bash
     npm start
     ```
   - **Plan**: `Free`

4. **Environment Variables**:
   Under the **Environment Variables** section, add:
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = `cloudsphere_production_secret_key_2026_jwt_token`

5. **Deploy**:
   - Click **"Create Web Service"**.
   - Render will automatically install dependencies, build the React client, and launch the server.
   - Your live website URL will appear at the top (e.g., `https://cloudsphere-platform.onrender.com`).

---

## 🚂 Method 2: Deploy on Railway.app

1. Go to [https://railway.app](https://railway.app) and sign in with GitHub.
2. Click **"New Project"** -> **"Deploy from GitHub repo"**.
3. Select your `cloudsphere` repository.
4. Railway will automatically detect the root `Dockerfile` and build the container.
5. In project settings, click **"Generate Domain"** to get a public HTTPS link (e.g., `https://cloudsphere.up.railway.app`).

---

## 🐳 Method 3: Deploy with Docker Container

CloudSphere includes an optimized multi-stage `Dockerfile`:

```bash
# Build the Docker image
docker build -t cloudsphere:latest .

# Run the container locally or on any cloud VPS (port 5000)
docker run -d -p 5000:5000 --name cloudsphere-app cloudsphere:latest
```

The app will be accessible at `http://YOUR_SERVER_IP:5000`.

---

## 💻 Method 4: Local / Presentation Deployment

If presenting locally on a college projector or lab computer:

```bash
# Start unified production server
npm start
```
Open **[http://localhost:5000](http://localhost:5000)** in your browser.

---

## 🔑 Default Administrator Credentials for Evaluation

- **Login Name / Username**: `meesala dileep kumar`
- **Email**: `dileep@cloudsphere.io`
- **Password**: `dileep65`
- **Role**: Infrastructure Administrator (Meesala Dileep Kumar)
- **Tenant 2 (Testing Multi-Tenancy)**: `alex@techcorp.com` / `TechCorp@2026`
