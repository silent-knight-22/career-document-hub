import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/layout/ProtectedRoute/ProtectedRoute';
import GuestRoute from '../components/layout/GuestRoute/GuestRoute';
import AppShell from '../components/layout/AppShell/AppShell';
import ErrorBoundary from '../components/common/ErrorBoundary/ErrorBoundary';

const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const MySignatures = lazy(() => import('../pages/MySignatures'));
const CreateSignature = lazy(() => import('../pages/CreateSignature'));
const Documents = lazy(() => import('../pages/Documents'));
const SignDocument = lazy(() => import('../pages/SignDocument'));
const Profile = lazy(() => import('../pages/Profile'));
const Vault = lazy(() => import('../pages/Vault'));
const Certificates = lazy(() => import('../pages/Certificates'));
const ExpiryTracker = lazy(() => import('../pages/Expiry'));
const ResumeBuilder = lazy(() => import('../pages/Resume'));
const DocumentAI = lazy(() => import('../pages/DocumentAI'));
const NotFound = lazy(() => import('../pages/NotFound'));

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

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Suspense fallback={<RouteFallback />}><Login /></Suspense>
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <Suspense fallback={<RouteFallback />}><Register /></Suspense>
          </GuestRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <GuestRoute>
            <Suspense fallback={<RouteFallback />}><ForgotPassword /></Suspense>
          </GuestRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <ErrorBoundary>
              <AppShell />
            </ErrorBoundary>
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/vault" element={<Vault />} />
        <Route path="/certificates" element={<Certificates />} />
        <Route path="/expiry" element={<ExpiryTracker />} />
        <Route path="/resume" element={<ResumeBuilder />} />
        <Route path="/signatures" element={<MySignatures />} />
        <Route path="/signatures/create" element={<CreateSignature />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/documents/:id/sign" element={<SignDocument />} />
        <Route path="/ai" element={<DocumentAI />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="*"
        element={
          <Suspense fallback={<RouteFallback />}>
            <NotFound />
          </Suspense>
        }
      />
    </Routes>
  );
}
