import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { LayoutProvider, useLayout } from '../../../context/LayoutContext';
import Sidebar from '../Sidebar/Sidebar';
import './AppShell.css';

function RouteFallback() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '40vh',
      }}
      role="status"
      aria-label="Loading page"
    >
      <div
        className="animate-spin"
        style={{
          width: 32,
          height: 32,
          border: '3px solid var(--border-color)',
          borderTopColor: 'var(--brand-primary)',
          borderRadius: '50%',
        }}
      />
    </div>
  );
}

function AppShellInner() {
  const { sidebarOpen, closeSidebar } = useLayout();
  const location = useLocation();

  useEffect(() => {
    closeSidebar();
  }, [location.pathname, closeSidebar]);

  return (
    <div className="app-layout">
      <div
        className={`sidebar-backdrop${sidebarOpen ? ' is-open' : ''}`}
        onClick={closeSidebar}
        aria-hidden={!sidebarOpen}
      />
      <Sidebar />
      <div className="main-content">
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
}

/** Protected app chrome: sidebar once + page outlet. */
export default function AppShell() {
  return (
    <LayoutProvider>
      <AppShellInner />
    </LayoutProvider>
  );
}
