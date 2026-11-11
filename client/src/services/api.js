// CloudSphere Centralized API Client

const getAuthHeader = () => {
  const token = localStorage.getItem('cloudsphere_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {
  // Generic fetch wrapper
  async request(endpoint, options = {}) {
    const url = `/api${endpoint}`;
    const headers = {
      ...getAuthHeader(),
      ...options.headers,
    };

    // Don't set Content-Type if sending FormData (browser handles boundary)
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    try {
      const response = await fetch(url, { ...options, headers });
      const data = await response.json().catch(() => ({ success: false, message: 'Invalid server response' }));

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: Request failed`);
      }
      return data;
    } catch (error) {
      console.error(`[API Error] ${endpoint}:`, error.message);
      throw error;
    }
  },

  // Auth endpoints
  auth: {
    login: (credentials) => api.request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (userData) => api.request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    getMe: () => api.request('/auth/me'),
    updateProfile: (profile) => api.request('/auth/profile', { method: 'PUT', body: JSON.stringify(profile) }),
  },

  // Compute (CPU) endpoints
  compute: {
    getSummary: () => api.request('/compute/summary'),
    allocate: (data) => api.request('/compute/allocate', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => api.request(`/compute/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    release: (id) => api.request(`/compute/${id}`, { method: 'DELETE' }),
  },

  // Memory (RAM) endpoints
  memory: {
    getSummary: () => api.request('/memory/summary'),
    allocate: (data) => api.request('/memory/allocate', { method: 'POST', body: JSON.stringify(data) }),
    scale: (id, data) => api.request(`/memory/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    release: (id) => api.request(`/memory/${id}`, { method: 'DELETE' }),
  },

  // Database endpoints
  databases: {
    getAll: (params = '') => api.request(`/databases${params ? '?' + params : ''}`),
    create: (data) => api.request('/databases/create', { method: 'POST', body: JSON.stringify(data) }),
    getDetails: (id) => api.request(`/databases/${id}`),
    delete: (id) => api.request(`/databases/${id}`, { method: 'DELETE' }),
  },

  // Storage endpoints
  storage: {
    getSummary: () => api.request('/storage/summary'),
    upload: (formData) => api.request('/storage/upload', { method: 'POST', body: formData }),
    delete: (id) => api.request(`/storage/${id}`, { method: 'DELETE' }),
    getDownloadUrl: (id) => `/api/storage/download/${id}`,
  },

  // Analytics endpoints
  analytics: {
    getData: (timeRange = '24h') => api.request(`/analytics?timeRange=${timeRange}`),
  },

  // Tenant endpoints
  tenant: {
    getInfo: () => api.request('/tenants/info'),
    inviteMember: (data) => api.request('/tenants/invite', { method: 'POST', body: JSON.stringify(data) }),
  },

  // Security endpoints
  security: {
    getOverview: () => api.request('/security/overview'),
    getKeys: () => api.request('/security/keys'),
    createKey: (data) => api.request('/security/keys', { method: 'POST', body: JSON.stringify(data) }),
    revokeKey: (id) => api.request(`/security/keys/${id}`, { method: 'DELETE' }),
    getAuditLogs: (category = 'all', limit = 50) => api.request(`/security/audit-logs?category=${category}&limit=${limit}`),
  },

  // System health
  health: () => api.request('/health'),
};
