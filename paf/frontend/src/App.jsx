
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AuthenticatedRoute from './components/auth/AuthenticatedRoute';
import AdminRoute from './components/auth/AdminRoute';
import StaffRoute from './components/auth/StaffRoute';
import TechnicianRoute from './components/auth/TechnicianRoute';
import UserRoute from './components/auth/UserRoute';
import TechnicianManager from './components/admin/TechnicianManager';
import AuthCallbackPage from './pages/AuthCallbackPage';
import AdminBookingsPage from './pages/AdminBookingsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminTicketsPage from './pages/AdminTicketsPage';
import EnhancedRegistrationPage from './pages/EnhancedRegistrationPage';
import ForceChangePasswordPage from './pages/ForceChangePasswordPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import RegistrationPage from './pages/RegistrationPage';
import StaffLoginPage from './pages/StaffLoginPage';
import TechnicianDashboardPage from './pages/TechnicianDashboardPage';
import TechnicianTicketsPage from './pages/TechnicianTicketsPage';
import UserDashboardPage from './pages/UserDashboardPage';
import './App.css';

function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center max-w-md w-full">
        <h2 className="text-2xl font-semibold text-slate-900">Access Denied</h2>
        <p className="text-slate-500 mt-2">You do not have permission to access this page.</p>
      </div>
    </div>
  );

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegistrationPage from './pages/RegistrationPage'
import EnhancedRegistrationPage from './pages/EnhancedRegistrationPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import HomePage from './pages/HomePage'

function Unauthorized() {
  return <Navigate to="/login" replace />

}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<EnhancedRegistrationPage />} />
          <Route path="/register-simple" element={<RegistrationPage />} />
          <Route path="/staff/login" element={<StaffLoginPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />


          {/* Staff-only guard for forced password change */}
          <Route element={<StaffRoute />}>
            <Route path="/staff/change-password" element={<ForceChangePasswordPage />} />
          </Route>

          {/* Student routes */}
          <Route element={<UserRoute />}>
            <Route path="/dashboard" element={<UserDashboardPage />} />
          </Route>

          {/* Admin routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/technicians" element={<TechnicianManager />} />
            <Route path="/admin/tickets" element={<AdminTicketsPage />} />
            <Route path="/admin/bookings" element={<AdminBookingsPage />} />
          </Route>

          {/* Technician routes */}
          <Route element={<TechnicianRoute />}>
            <Route path="/technician/dashboard" element={<TechnicianDashboardPage />} />
            <Route path="/technician/tickets" element={<TechnicianTicketsPage />} />
          </Route>

          {/* Shared authenticated route */}
          <Route element={<AuthenticatedRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />

          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App;
