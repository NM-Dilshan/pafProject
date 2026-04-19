import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BookingForm from '../components/BookingForm';
import BookingList from '../components/BookingList';
import PortalHeader from '../components/PortalHeader';

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
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('create');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isLocationEnabled, setIsLocationEnabled] = useState(() => {
    return localStorage.getItem('studyAreaLocationPreference') === 'enabled';
  });

  const toggleLocation = () => {
    const nextValue = !isLocationEnabled;
    if (nextValue) {
      localStorage.setItem('studyAreaLocationPreference', 'enabled');
    } else {
      localStorage.removeItem('studyAreaLocationPreference');
    }
    setIsLocationEnabled(nextValue);
  };

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
    <div className="min-h-screen bg-[radial-gradient(1000px_600px_at_10%_-10%,#dcfce7_0%,#f8fafc_42%,#f0fdf4_100%)] text-slate-900">
      <PortalHeader
        user={user}
        onLogout={handleLogout}
        onBack={() => navigate('/dashboard')}
        showBackButton
        isLocationEnabled={isLocationEnabled}
        onToggleLocation={toggleLocation}
        isNotificationOpen={isNotificationOpen}
        setIsNotificationOpen={setIsNotificationOpen}
      />

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
