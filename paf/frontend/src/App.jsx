import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import React from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegistrationPage from './pages/RegistrationPage'
import EnhancedRegistrationPage from './pages/EnhancedRegistrationPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import NotificationBell from './components/NotificationBell'
import NotificationDropdown from './components/NotificationDropdown'
import './App.css'

// Dashboard component (placeholder)
function Dashboard() {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = React.useState(false);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Smart Campus Hub</h1>
        <div className="header-actions">
          <div style={{ position: 'relative' }}>
            <NotificationBell onBellClick={() => setShowNotifications(!showNotifications)} />
            <NotificationDropdown 
              isOpen={showNotifications} 
              onClose={() => setShowNotifications(false)} 
            />
          </div>
          <div className="user-info">
            <span>{user?.name}</span>
            <button onClick={logout}>Logout</button>
          </div>
        </div>
      </header>
      <main className="dashboard-content">
        <h2>Welcome to the Dashboard</h2>
        <p>Your notification bell is in the header.</p>
      </main>
    </div>
  );
}

// Unauthorized page
function Unauthorized() {
  return (
    <div className="unauthorized-page">
      <h2>Access Denied</h2>
      <p>You don't have permission to access this page.</p>
      <Navigate to="/dashboard" replace />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<EnhancedRegistrationPage />} />
          <Route path="/register-simple" element={<RegistrationPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App
