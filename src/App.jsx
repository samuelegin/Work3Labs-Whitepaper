import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'

import Whitepaper            from './pages/Whitepaper'
import Apply                 from './pages/Apply'
import Admin                 from './pages/Admin'
import AdminLogin            from './pages/AdminLogin'
import AdminForgotPassword   from './pages/AdminForgotPassword'
import AdminSetup            from './pages/AdminSetup'
import AdminResetPassword    from './pages/AdminResetPassword'

/**
 * RequireAuth — wraps any route that needs a valid session.
 * Unauthenticated users are redirected to /admin/login, with
 * the attempted URL preserved so they land back after signing in.
 */
function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }
  return children
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"      element={<Whitepaper />} />
      <Route path="/apply" element={<Apply />} />

      {/* Admin auth */}
      <Route path="/admin/login"           element={<AdminLogin />} />
      <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
      <Route path="/admin/reset-password"  element={<AdminResetPassword />} />
      <Route path="/admin/setup"           element={<AdminSetup />} />

      {/* Protected admin routes */}
      <Route path="/admin"           element={<RequireAuth><Admin /></RequireAuth>} />
      <Route path="/admin/dashboard" element={<RequireAuth><Admin /></RequireAuth>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
