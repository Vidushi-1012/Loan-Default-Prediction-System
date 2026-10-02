import React, { useState, useEffect } from 'react';
import { Sidebar, NavRoute } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { PredictPage } from './pages/PredictPage';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { ApplicationDetailPage } from './pages/ApplicationDetailPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ModelsPage } from './pages/ModelsPage';
import { MonitoringPage } from './pages/MonitoringPage';
import { SettingsPage } from './pages/SettingsPage';
import { UserProfile } from './types';
import { authService } from './services/auth';
import { ThemeProvider } from './context/ThemeContext';

function AppContent() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [currentRoute, setCurrentRoute] = useState<NavRoute>('dashboard');
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check initial auth state
    const initAuth = async () => {
      try {
        const user = await authService.getMe();
        setCurrentUser(user);
      } finally {
        setIsAuthLoading(false);
      }
    };
    initAuth();
  }, []);

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setCurrentRoute('dashboard');
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setCurrentRoute('dashboard');
  };

  const handleViewApplication = (id: string) => {
    setSelectedApplicationId(id);
  };

  const handleBackToApplications = () => {
    setSelectedApplicationId(null);
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-slate-300 dark:border-slate-700 border-t-slate-900 dark:border-t-emerald-400 rounded-full animate-spin" />
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Initializing LoanGuard Engine...</span>
        </div>
      </div>
    );
  }

  // If not authenticated, render login experience
  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Determine Page Title & Breadcrumb for Topbar
  const getPageTitleAndBreadcrumb = () => {
    if (selectedApplicationId) {
      return { title: `Application ${selectedApplicationId}`, breadcrumb: 'Applications' };
    }
    switch (currentRoute) {
      case 'dashboard':
        return { title: 'Loan Risk Overview', breadcrumb: 'Overview' };
      case 'applications':
        return { title: 'Loan Applications', breadcrumb: 'Registry' };
      case 'predict':
        return { title: 'Assess Loan Risk', breadcrumb: 'Inference' };
      case 'analytics':
        return { title: 'Risk Analytics', breadcrumb: 'Intelligence' };
      case 'models':
        return { title: 'Model Performance', breadcrumb: 'Governance' };
      case 'monitoring':
        return { title: 'Model Monitoring', breadcrumb: 'Telemetry' };
      case 'settings':
        return { title: 'Settings', breadcrumb: 'Preferences' };
      default:
        return { title: 'LoanGuard Dashboard', breadcrumb: '' };
    }
  };

  const { title: pageTitle, breadcrumb } = getPageTitleAndBreadcrumb();

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex transition-colors">
      {/* Sidebar Navigation */}
      <Sidebar
        currentRoute={currentRoute}
        onRouteChange={(route) => {
          setCurrentRoute(route);
          setSelectedApplicationId(null);
        }}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        user={currentUser}
        onLogout={handleLogout}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ease-in-out ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Top Header */}
        <Topbar
          pageTitle={pageTitle}
          breadcrumb={breadcrumb}
          user={currentUser}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onNavigateSettings={() => {
            setCurrentRoute('settings');
            setSelectedApplicationId(null);
          }}
        />

        {/* Viewport Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {selectedApplicationId ? (
            <ApplicationDetailPage
              applicationId={selectedApplicationId}
              onBack={handleBackToApplications}
            />
          ) : currentRoute === 'dashboard' ? (
            <DashboardPage
              onViewApplication={handleViewApplication}
              onNavigatePredict={() => setCurrentRoute('predict')}
            />
          ) : currentRoute === 'applications' ? (
            <ApplicationsPage
              onViewApplication={handleViewApplication}
              onNavigatePredict={() => setCurrentRoute('predict')}
            />
          ) : currentRoute === 'predict' ? (
            <PredictPage
              onViewApplication={handleViewApplication}
              onNavigateHistory={() => setCurrentRoute('applications')}
            />
          ) : currentRoute === 'analytics' ? (
            <AnalyticsPage />
          ) : currentRoute === 'models' ? (
            <ModelsPage />
          ) : currentRoute === 'monitoring' ? (
            <MonitoringPage />
          ) : currentRoute === 'settings' ? (
            <SettingsPage
              user={currentUser}
              onUpdateProfile={(updated) => setCurrentUser(updated)}
            />
          ) : null}
        </main>

        {/* Subtly Positioned Required Footer */}
        <footer className="py-4 px-6 text-center text-xs text-slate-400 dark:text-slate-500 border-t border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-[#0F172A] transition-colors">
          <span>© 2026 Vidushi Srivastava. All rights reserved.</span>
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
