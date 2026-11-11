import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const CloudContext = createContext(null);

export const CloudProvider = ({ children }) => {
  const { isAuthenticated, tenant } = useAuth();

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    cpu: { totalCores: 64, allocatedCores: 0, availableCores: 64, utilizationPercentage: 0 },
    ram: { totalRam: 256, allocatedRam: 0, usedRam: 0, availableRam: 256, utilizationPercentage: 0 },
    databases: { totalDatabases: 0, activeDatabases: 0, totalStorageMb: 0 },
    storage: { totalCapacityGb: 500, usedStorageGb: 0, availableStorageGb: 500, utilizationPercentage: 0 },
  });
  const [loadingStats, setLoadingStats] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [quickActionModal, setQuickActionModal] = useState({ open: false, type: 'cpu' });
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Toast Notification Dispatcher
  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Fetch all core summaries
  const refreshAllStats = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingStats(true);
    try {
      const [cpuRes, ramRes, dbRes, storageRes, securityRes] = await Promise.allSettled([
        api.compute.getSummary(),
        api.memory.getSummary(),
        api.databases.getAll(),
        api.storage.getSummary(),
        api.security.getOverview(),
      ]);

      setStats({
        cpu: cpuRes.status === 'fulfilled' && cpuRes.value.success ? cpuRes.value.data : stats.cpu,
        ram: ramRes.status === 'fulfilled' && ramRes.value.success ? ramRes.value.data : stats.ram,
        databases: dbRes.status === 'fulfilled' && dbRes.value.success ? dbRes.value.data : stats.databases,
        storage: storageRes.status === 'fulfilled' && storageRes.value.success ? storageRes.value.data : stats.storage,
      });

      if (securityRes.status === 'fulfilled' && securityRes.value.success) {
        const logs = securityRes.value.recentAuditLogs || [];
        setNotifications(logs);
        setUnreadNotifications(logs.length);
      }
    } catch (err) {
      console.warn('[CloudContext] Error refreshing stats:', err.message);
    } finally {
      setLoadingStats(false);
    }
  }, [isAuthenticated, stats.cpu, stats.ram, stats.databases, stats.storage]);

  // Initial load and auto refresh
  useEffect(() => {
    if (isAuthenticated) {
      refreshAllStats();
      const interval = setInterval(refreshAllStats, 30000); // 30s background sync
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, tenant]);

  // Global Keyboard shortcut: Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const markNotificationsAsRead = () => {
    setUnreadNotifications(0);
  };

  return (
    <CloudContext.Provider
      value={{
        activeTab,
        setActiveTab,
        stats,
        loadingStats,
        refreshAllStats,
        toasts,
        showToast,
        removeToast,
        quickActionModal,
        setQuickActionModal,
        commandPaletteOpen,
        setCommandPaletteOpen,
        notifications,
        unreadNotifications,
        markNotificationsAsRead,
      }}
    >
      {children}
    </CloudContext.Provider>
  );
};

export const useCloud = () => {
  const context = useContext(CloudContext);
  if (!context) {
    throw new Error('useCloud must be used within a CloudProvider');
  }
  return context;
};
