import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { LayoutProvider, useLayout } from '../../../context/LayoutContext';
import Sidebar from '../Sidebar/Sidebar';
import PageLoader from '../../common/PageLoader/PageLoader';
import './AppShell.css';

function AppShellInner() {
  const { sidebarOpen, closeSidebar } = useLayout();
  const location = useLocation();

  useEffect(() => {
    closeSidebar();
  }, [location.pathname, closeSidebar]);

  useEffect(() => {
    if (!sidebarOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') closeSidebar();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sidebarOpen, closeSidebar]);

  return (
    <div className="app-layout">
      <div
        className={`sidebar-backdrop${sidebarOpen ? ' is-open' : ''}`}
        onClick={closeSidebar}
        aria-hidden={!sidebarOpen}
      />
      <Sidebar />
      <div className="main-content" id="main-content">
        <Suspense fallback={<PageLoader />}>
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
