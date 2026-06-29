import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/layout/ProtectedRoute/ProtectedRoute';

import Login           from '../pages/auth/Login';
import Register        from '../pages/auth/Register';
import ForgotPassword  from '../pages/auth/ForgotPassword';
import Dashboard       from '../pages/Dashboard';
import MySignatures    from '../pages/MySignatures';
import CreateSignature from '../pages/CreateSignature';
import Documents       from '../pages/Documents';
import SignDocument    from '../pages/SignDocument';
import Profile         from '../pages/Profile';
import Vault           from '../pages/Vault';
import Certificates    from '../pages/Certificates';
import ExpiryTracker   from '../pages/Expiry';
import ResumeBuilder   from '../pages/Resume';
import DocumentAI      from '../pages/DocumentAI';

const P = ({ children }) => <ProtectedRoute>{children}</ProtectedRoute>;

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login"           element={<Login />} />
      <Route path="/register"        element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected */}
      <Route path="/dashboard"          element={<P><Dashboard /></P>} />
      <Route path="/vault"              element={<P><Vault /></P>} />
      <Route path="/certificates"       element={<P><Certificates /></P>} />
      <Route path="/expiry"             element={<P><ExpiryTracker /></P>} />
      <Route path="/resume"             element={<P><ResumeBuilder /></P>} />
      <Route path="/signatures"         element={<P><MySignatures /></P>} />
      <Route path="/signatures/create"  element={<P><CreateSignature /></P>} />
      <Route path="/documents"          element={<P><Documents /></P>} />
      <Route path="/documents/:id/sign" element={<P><SignDocument /></P>} />
      <Route path="/ai"                element={<P><DocumentAI /></P>} />
      <Route path="/profile"            element={<P><Profile /></P>} />

      {/* Default */}
      <Route path="/"  element={<Navigate to="/dashboard" replace />} />
      <Route path="*"  element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
