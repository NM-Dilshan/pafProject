import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminBookingPanel from '../components/AdminBookingPanel';
import { LogOut } from 'lucide-react';

const AdminBookingsPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleLogout = () => {
    logout();
    navigate('/staff/login', { replace: true });
  };

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-green-900">Manage Bookings</h1>
            <p className="mt-2 text-lg text-slate-600">Review and approve pending resource bookings</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-2xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-green-200 transition hover:bg-green-700"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>

        {/* Admin Booking Panel */}
        <div className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
          <AdminBookingPanel refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  );
};

export default AdminBookingsPage;
