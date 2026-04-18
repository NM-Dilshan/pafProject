import React, { useState, useEffect } from 'react';
import bookingService from '../services/bookingService';

/**
 * AdminBookingPanel Component
 * 
 * Admin dashboard for managing pending bookings.
 * 
 * Features:
 * - Display pending bookings list
 * - Approve/Reject bookings
 * - Reason input for rejections
 * - Status updates with loading states
 * - Real-time notifications
 * - Booking details display
 * - Search and filter functionality
 */
const AdminBookingPanel = ({ refreshTrigger }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [actioningId, setActioningId] = useState(null);
  const [actioningStatus, setActioningStatus] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState('');
  const [currentAction, setCurrentAction] = useState(null); // 'APPROVE' or 'REJECT'

  // Load pending bookings on mount
  useEffect(() => {
    loadPendingBookings();
  }, [refreshTrigger]);

  const loadPendingBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await bookingService.getPendingBookings();
      setBookings(data || []);
    } catch (err) {
      setError('Failed to load pending bookings. Please try again later.');
      console.error('Error loading pending bookings:', err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter bookings by search term
  const filteredBookings = bookings.filter((booking) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      booking.resource?.hallName?.toLowerCase().includes(searchLower) ||
      booking.user?.name?.toLowerCase().includes(searchLower) ||
      booking.user?.email?.toLowerCase().includes(searchLower) ||
      booking.purpose?.toLowerCase().includes(searchLower)
    );
  });

  const openActionModal = (booking, action) => {
    setSelectedBooking(booking);
    setCurrentAction(action);
    setReason('');
    setShowModal(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedBooking || !currentAction) return;

    try {
      setActioningId(selectedBooking.id);
      setActioningStatus(currentAction);

      await bookingService.updateBookingStatus(
        selectedBooking.id,
        currentAction,
        reason
      );

      setSuccess(`✓ Booking ${currentAction.toLowerCase()}d successfully`);
      setShowModal(false);
      setSelectedBooking(null);
      setReason('');
      setCurrentAction(null);

      // Remove the booking from the list
      setBookings((prev) =>
        prev.filter((b) => b.id !== selectedBooking.id)
      );

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `Failed to ${currentAction.toLowerCase()} booking. Try again.`
      );
      console.error('Error updating booking status:', err);
    } finally {
      setActioningId(null);
      setActioningStatus(null);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format time
  const formatTime = (timeString) => {
    return timeString;
  };

  // Calculate booking duration
  const calculateDuration = (startTime, endTime) => {
    const [startHour, startMin] = startTime.split(':');
    const [endHour, endMin] = endTime.split(':');
    const startTotalMin = parseInt(startHour) * 60 + parseInt(startMin);
    const endTotalMin = parseInt(endHour) * 60 + parseInt(endMin);
    const durationMin = endTotalMin - startTotalMin;
    const hours = Math.floor(durationMin / 60);
    const mins = durationMin % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Booking Management</h1>
          <p className="mt-2 text-lg text-gray-600">
            Review and manage pending booking requests
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 animate-in fade-in-0 duration-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 animate-in fade-in-0 duration-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Search and Stats */}
        <div className="mb-6 rounded-lg bg-white p-4 shadow sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by resource, user, purpose..."
                  className="block w-full rounded-lg border-2 border-gray-300 px-4 py-3 pr-10 text-sm focus:border-blue-500 focus:outline-none"
                />
                <svg
                  className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-lg bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-800">
              <span className="inline-block h-3 w-3 rounded-full bg-amber-400"></span>
              {bookings.length} Pending Bookings
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex h-64 items-center justify-center rounded-lg bg-white shadow">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
              <p className="text-gray-600">Loading pending bookings...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && bookings.length === 0 && (
          <div className="rounded-lg bg-white p-12 text-center shadow">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              All Caught Up!
            </h3>
            <p className="mt-2 text-gray-600">
              There are no pending booking requests to review at the moment.
            </p>
          </div>
        )}

        {/* No Results */}
        {!loading && bookings.length > 0 && filteredBookings.length === 0 && (
          <div className="rounded-lg bg-white p-12 text-center shadow">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              No Results
            </h3>
            <p className="mt-2 text-gray-600">
              No bookings match your search criteria.
            </p>
          </div>
        )}

        {/* Bookings Table */}
        {!loading && filteredBookings.length > 0 && (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="rounded-lg bg-white shadow-md transition-all duration-200 hover:shadow-lg overflow-hidden"
              >
                <div className="flex flex-col gap-4 p-6 sm:gap-6">
                  {/* Top Section */}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    {/* Resource & User Info */}
                    <div className="flex-1">
                      <div className="mb-3">
                        <h3 className="text-lg font-bold text-gray-900">
                          {booking.resource?.hallName || 'Unknown Resource'}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">
                          {booking.resource?.resourceType}
                          {booking.resource?.buildingName &&
                            ` • ${booking.resource.buildingName}`}
                        </p>
                      </div>

                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="text-xs font-semibold uppercase text-gray-600">
                          Requested By
                        </p>
                        <p className="mt-1 font-semibold text-gray-900">
                          {booking.user?.name || 'Unknown User'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {booking.user?.email}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className="inline-flex items-center gap-1 rounded-full border-2 border-amber-300 bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800 self-start">
                      <span>⏳</span>
                      PENDING
                    </span>
                  </div>

                  {/* Details Grid */}
                  <div className="grid gap-4 border-t border-gray-200 pt-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Date */}
                    <div>
                      <p className="text-xs font-semibold uppercase text-gray-500">
                        Date
                      </p>
                      <p className="mt-1 font-semibold text-gray-900">
                        {formatDate(booking.date)}
                      </p>
                    </div>

                    {/* Time */}
                    <div>
                      <p className="text-xs font-semibold uppercase text-gray-500">
                        Time
                      </p>
                      <p className="mt-1 font-semibold text-gray-900">
                        {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                      </p>
                    </div>

                    {/* Duration */}
                    <div>
                      <p className="text-xs font-semibold uppercase text-gray-500">
                        Duration
                      </p>
                      <p className="mt-1 font-semibold text-gray-900">
                        {calculateDuration(booking.startTime, booking.endTime)}
                      </p>
                    </div>

                    {/* Attendees */}
                    <div>
                      <p className="text-xs font-semibold uppercase text-gray-500">
                        Attendees
                      </p>
                      <p className="mt-1 font-semibold text-gray-900">
                        {booking.attendees} / {booking.resource?.capacity || '?'}
                      </p>
                    </div>
                  </div>

                  {/* Purpose & Notes */}
                  <div className="border-t border-gray-200 pt-4">
                    <div>
                      <p className="text-xs font-semibold uppercase text-gray-600">
                        Purpose
                      </p>
                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        {booking.purpose}
                      </p>
                    </div>

                    {booking.notes && (
                      <div className="mt-3 rounded-lg bg-blue-50 p-3 border border-blue-200">
                        <p className="text-xs font-semibold text-blue-700">
                          Additional Notes:
                        </p>
                        <p className="mt-1 text-sm text-blue-900">
                          {booking.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 border-t border-gray-200 pt-4 flex-col sm:flex-row">
                    <button
                      onClick={() => openActionModal(booking, 'APPROVED')}
                      disabled={actioningId === booking.id}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 font-semibold text-white transition-all duration-200 hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {actioningId === booking.id && actioningStatus === 'APPROVED' ? (
                        <>
                          <svg className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Approving...
                        </>
                      ) : (
                        <>
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Approve
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => openActionModal(booking, 'REJECTED')}
                      disabled={actioningId === booking.id}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 font-semibold text-white transition-all duration-200 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {actioningId === booking.id && actioningStatus === 'REJECTED' ? (
                        <>
                          <svg className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Rejecting...
                        </>
                      ) : (
                        <>
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                          Reject
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Modal */}
        {showModal && selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
              {/* Header */}
              <div
                className={`border-b px-6 py-4 ${
                  currentAction === 'APPROVED'
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <h2
                  className={`text-lg font-bold ${
                    currentAction === 'APPROVED'
                      ? 'text-green-900'
                      : 'text-red-900'
                  }`}
                >
                  {currentAction === 'APPROVED'
                    ? '✓ Approve Booking'
                    : '✗ Reject Booking'}
                </h2>
              </div>

              {/* Content */}
              <div className="px-6 py-4">
                <p className="mb-3 text-sm text-gray-700">
                  Booking Details:
                </p>
                <div className="mb-4 rounded-lg bg-gray-50 p-3">
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedBooking.resource?.hallName}
                  </p>
                  <p className="text-xs text-gray-600">
                    {formatDate(selectedBooking.date)} at{' '}
                    {formatTime(selectedBooking.startTime)} -{' '}
                    {formatTime(selectedBooking.endTime)}
                  </p>
                  <p className="mt-1 text-xs text-gray-600">
                    Requested by: {selectedBooking.user?.name} (
                    {selectedBooking.user?.email})
                  </p>
                </div>

                {/* Reason Input */}
                <div>
                  <label
                    htmlFor="reason"
                    className="block text-sm font-semibold text-gray-900"
                  >
                    {currentAction === 'APPROVED'
                      ? 'Approval Notes (Optional)'
                      : 'Rejection Reason (Optional)'}
                  </label>
                  <p className="mt-1 text-xs text-gray-500">
                    {currentAction === 'APPROVED'
                      ? 'Add any notes or conditions for this approval'
                      : 'Please provide a reason for rejection'}
                  </p>
                  <textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={
                      currentAction === 'APPROVED'
                        ? 'E.g., Approved with projector setup provided'
                        : 'E.g., Resource is already booked at this time'
                    }
                    maxLength="500"
                    rows="4"
                    className="mt-2 block w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {reason.length}/500 characters
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 border-t border-gray-200 px-6 py-4">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedBooking(null);
                    setReason('');
                    setCurrentAction(null);
                  }}
                  className="flex-1 rounded-lg border-2 border-gray-300 px-4 py-2 font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAction}
                  disabled={actioningId === selectedBooking.id}
                  className={`flex-1 rounded-lg px-4 py-2 font-semibold text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
                    currentAction === 'APPROVED'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {actioningId === selectedBooking.id
                    ? `${currentAction === 'APPROVED' ? 'Approving' : 'Rejecting'}...`
                    : `Confirm ${currentAction}`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBookingPanel;
