import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CloudProvider, useCloud } from './context/CloudContext';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import ToastContainer from './components/common/Toast';
import CommandPalette from './components/common/CommandPalette';
import QuickActionModal from './components/common/QuickActionModal';

// Modules
import Overview from './components/modules/Overview';
import ComputeManagement from './components/modules/ComputeManagement';
import MemoryManagement from './components/modules/MemoryManagement';
import DatabaseManagement from './components/modules/DatabaseManagement';
import StorageManagement from './components/modules/StorageManagement';
import AnalyticsMonitoring from './components/modules/AnalyticsMonitoring';
import UsersTenants from './components/modules/UsersTenants';
import SecurityHub from './components/modules/SecurityHub';
import SettingsView from './components/modules/SettingsView';
import AuthView from './components/modules/AuthView';

const MainLayout = () => {
  const { isAuthenticated, loading } = useAuth();
  const { activeTab } = useCloud();

  if (loading) {
    return (
      <div className="min-h-screen bg-warmIvory flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-silverGrey border-t-slateBlue rounded-full animate-spin" />
          <span className="text-xs font-semibold text-charcoal tracking-wide uppercase font-mono">
            Loading CloudSphere...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthView />;
  }

  const renderModule = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview />;
      case 'compute':
        return <ComputeManagement />;
      case 'memory':
        return <MemoryManagement />;
      case 'database':
        return <DatabaseManagement />;
      case 'storage':
        return <StorageManagement />;
      case 'analytics':
        return <AnalyticsMonitoring />;
      case 'tenants':
        return <UsersTenants />;
      case 'security':
        return <SecurityHub />;
      case 'settings':
        return <SettingsView />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="min-h-screen bg-warmIvory flex font-sans antialiased text-charcoal">
      {/* Fixed Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen">
        <Topbar />
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {renderModule()}
        </main>
      </div>

      {/* Global Interactive Overlays */}
      <QuickActionModal />
      <CommandPalette />
      <ToastContainer />
    </div>
  );
};

export const App = () => {
  return (
    <AuthProvider>
      <CloudProvider>
        <MainLayout />
      </CloudProvider>
    </AuthProvider>
  );
};

export default App;
