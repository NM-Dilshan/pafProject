import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BookingForm from '../components/BookingForm';
import BookingList from '../components/BookingList';
import { ArrowLeft, LogOut } from 'lucide-react';

/**
 * UserBookingsPage
 * 
 * Comprehensive page for users to manage their resource bookings.
 * 
 * Features:
 * - Create new bookings using BookingForm
 * - View and manage user bookings with BookingList
 * - Automatic list refresh when bookings are created/cancelled
 * - Tab-based view switching between Create and My Bookings
 * - Responsive design matching dashboard theme
 */
const UserBookingsPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('create');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleBookingCreated = () => {
    // Trigger list refresh
    setRefreshTrigger((prev) => prev + 1);
    // Show success and switch to bookings view
    setActiveTab('bookings');
  };

  const handleCancel = () => {
    // User cancelled form, go back to bookings view
    setActiveTab('bookings');
  };

  return (
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <header className="border-b border-green-100 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center justify-center h-10 w-10 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                aria-label="Back to dashboard"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-green-900">Resource Bookings</h1>
                <p className="mt-1 text-sm text-slate-600">Create and manage your resource bookings</p>
              </div>
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
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Tab Navigation */}
        <div className="mb-8 flex gap-2 border-b border-green-100">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-6 py-3 text-sm font-semibold transition border-b-2 ${
              activeTab === 'create'
                ? 'border-green-600 text-green-700 bg-green-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Book a Resource
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-6 py-3 text-sm font-semibold transition border-b-2 ${
              activeTab === 'bookings'
                ? 'border-green-600 text-green-700 bg-green-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            My Bookings
          </button>
        </div>

        {/* Tab Content */}
        <div className="rounded-3xl border border-green-100 bg-white shadow-sm">
          {/* Create Booking Tab */}
          {activeTab === 'create' && (
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-green-900">Create a New Booking</h2>
                <p className="mt-1 text-slate-600">Fill in the details below to book a resource for your needs.</p>
              </div>
              <BookingForm 
                onBookingCreated={handleBookingCreated}
                onCancel={handleCancel}
              />
            </div>
          )}

          {/* My Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-green-900">Your Bookings</h2>
                <p className="mt-1 text-slate-600">View and manage all your resource bookings below.</p>
              </div>
              <BookingList refreshTrigger={refreshTrigger} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserBookingsPage;
