import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import bookingService from '../services/bookingService';

/**
 * BookingForm Component
 * 
 * Allows users to create a new resource booking with full Tailwind UI styling.
 * 
 * Features:
 * - Resource dropdown (fetches from backend REST API)
 * - Date and time selection with validation
 * - Conflict detection with smart slot suggestions
 * - Comprehensive form validation
 * - Real-time error feedback
 * - Loading states and success/error notifications
 * - Responsive design with Tailwind CSS
 */
const BookingForm = ({ onBookingCreated, onCancel }) => {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [showSlotSuggestions, setShowSlotSuggestions] = useState(false);

  const [formData, setFormData] = useState({
    resourceId: '',
    date: '',
    startTime: '',
    endTime: '',
    purpose: '',
    attendees: 1,
    notes: '',
  });

  const [errors, setErrors] = useState({});

  // Fetch resources on component mount
  useEffect(() => {
    const loadResources = async () => {
      try {
        setLoading(true);
        const data = await bookingService.fetchResources();
        setResources(data);
      } catch (err) {
        setError('Failed to load resources. Please try again later.');
        console.error('Error loading resources:', err);
      } finally {
        setLoading(false);
      }
    };

    loadResources();
  }, []);

  // Fetch available slots when date and resource change
  useEffect(() => {
    if (formData.resourceId && formData.date) {
      const loadAvailableSlots = async () => {
        try {
          const slots = await bookingService.getAvailableSlots(
            formData.resourceId,
            formData.date,
            5 // Get 5 suggestions
          );
          setAvailableSlots(slots);
        } catch (err) {
          console.error('Error fetching available slots:', err);
          setAvailableSlots([]);
        }
      };

      loadAvailableSlots();
    }
  }, [formData.resourceId, formData.date]);

  /**
   * Comprehensive validation for all form fields
   * Validates:
   * - Required fields
   * - Date constraints (not in past)
   * - Time constraints (working hours 08:00-18:00)
   * - Time logic (end time after start time)
   * - Purpose length (minimum 3 characters)
   * - Attendees count (at least 1)
   * - Capacity constraint (attendees vs resource capacity)
   */
  const validateForm = () => {
    const newErrors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Validate Resource Selection
    if (!formData.resourceId) {
      newErrors.resourceId = 'Please select a resource';
    }

    // Validate Date
    if (!formData.date) {
      newErrors.date = 'Please select a date';
    } else if (new Date(formData.date) < today) {
      newErrors.date = 'Date cannot be in the past';
    }

    // Validate Start Time
    if (!formData.startTime) {
      newErrors.startTime = 'Please enter start time';
    }

    // Validate End Time
    if (!formData.endTime) {
      newErrors.endTime = 'Please enter end time';
    }

    // Validate Time Logic
    if (formData.startTime && formData.endTime) {
      if (formData.startTime >= formData.endTime) {
        newErrors.endTime = 'End time must be after start time';
      }

      // Validate Working Hours (08:00 - 18:00)
      if (formData.startTime < '08:00') {
        newErrors.startTime = 'Start time must be at or after 08:00 AM';
      }
      if (formData.endTime > '18:00') {
        newErrors.endTime = 'End time must be at or before 06:00 PM';
      }

      // Check minimum booking duration (at least 30 minutes)
      const [startHour, startMin] = formData.startTime.split(':');
      const [endHour, endMin] = formData.endTime.split(':');
      const startTotalMin = parseInt(startHour) * 60 + parseInt(startMin);
      const endTotalMin = parseInt(endHour) * 60 + parseInt(endMin);
      const duration = endTotalMin - startTotalMin;

      if (duration < 30) {
        newErrors.endTime = 'Booking must be at least 30 minutes long';
      }
    }

    // Validate Purpose
    if (!formData.purpose || formData.purpose.trim().length < 3) {
      newErrors.purpose = 'Purpose must be at least 3 characters long';
    }
    if (formData.purpose.length > 100) {
      newErrors.purpose = 'Purpose must not exceed 100 characters';
    }

    // Validate Attendees
    if (formData.attendees < 1) {
      newErrors.attendees = 'Attendees must be at least 1';
    }
    if (formData.attendees > 1000) {
      newErrors.attendees = 'Attendees cannot exceed 1000';
    }

    // Validate against resource capacity
    const selectedResource = resources.find((r) => r.id === formData.resourceId);
    if (selectedResource && formData.attendees > selectedResource.capacity) {
      newErrors.capacity = `Attendees (${formData.attendees}) exceed resource capacity (${selectedResource.capacity})`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes with real-time error clearing
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Handle slot suggestion selection
  const handleSelectSlot = (slot) => {
    setFormData((prev) => ({
      ...prev,
      startTime: slot.startTime,
      endTime: slot.endTime,
    }));
    setShowSlotSuggestions(false);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const response = await bookingService.createBooking(formData);
      
      setSuccess('🎉 Booking created successfully! You can view it in your dashboard.');
      
      // Reset form
      setFormData({
        resourceId: '',
        date: '',
        startTime: '',
        endTime: '',
        purpose: '',
        attendees: 1,
        notes: '',
      });

      // Call parent callback
      if (onBookingCreated) {
        onBookingCreated(response);
      }

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create booking';
      setError(`❌ ${errorMessage}`);
      console.error('Booking creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get selected resource for info display
  const selectedResource = resources.find((r) => r.id === formData.resourceId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        {/* Form Container */}
        <div className="rounded-xl bg-white shadow-lg">
          {/* Header Section */}
          <div className="border-b border-gray-200 bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-8 text-center text-white sm:px-8">
            <h2 className="text-3xl font-bold tracking-tight">Create New Booking</h2>
            <p className="mt-2 text-sm text-blue-100">Book a resource for your event, class, or meeting</p>
          </div>

          <div className="px-6 py-8 sm:px-8">
            {/* Error Alert */}
            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 animate-in fade-in-0 duration-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
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
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">{success}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Resource Selection */}
              <div>
                <label htmlFor="resourceId" className="block text-sm font-semibold text-gray-900">
                  Select Resource <span className="text-red-500">*</span>
                </label>
                <p className="mt-1 text-xs text-gray-600">Choose the facility or resource you want to book</p>
                <select
                  id="resourceId"
                  name="resourceId"
                  value={formData.resourceId}
                  onChange={handleChange}
                  disabled={loading}
                  className={`mt-2 block w-full rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    errors.resourceId
                      ? 'border-red-300 bg-red-50 text-gray-900'
                      : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400'
                  } ${loading ? 'cursor-not-allowed opacity-60' : ''}`}
                >
                  <option value="">-- Select a Resource --</option>
                  {resources.map((resource) => (
                    <option key={resource.id} value={resource.id}>
                      {resource.hallName} (Capacity: {resource.capacity} people)
                    </option>
                  ))}
                </select>
                {errors.resourceId && (
                  <p className="mt-2 flex items-center text-sm font-medium text-red-600">
                    <svg className="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18.101 12.93l-.902-14.85a1.5 1.5 0 00-1.528-1.393H4.329a1.5 1.5 0 00-1.529 1.393L1.899 12.93A3 3 0 104.743 19h10.514a3 3 0 00-2.857-6.07z" clipRule="evenodd" />
                    </svg>
                    {errors.resourceId}
                  </p>
                )}

                {/* Resource Info Card */}
                {selectedResource && (
                  <div className="mt-4 rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
                    <div className="grid gap-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Resource Details</p>
                          <p className="mt-1 text-lg font-bold text-gray-900">{selectedResource.hallName}</p>
                        </div>
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                          {selectedResource.resourceType}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 border-t border-blue-200 pt-3">
                        <div>
                          <p className="text-xs text-blue-600">Capacity</p>
                          <p className="text-sm font-bold text-gray-900">{selectedResource.capacity} people</p>
                        </div>
                        <div>
                          <p className="text-xs text-blue-600">Location</p>
                          <p className="text-sm font-bold text-gray-900">
                            {selectedResource.buildingName}, Block {selectedResource.blockName}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-blue-600">Floor</p>
                          <p className="text-sm font-bold text-gray-900">Floor {selectedResource.floorNumber}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Date Selection */}
              <div>
                <label htmlFor="date" className="block text-sm font-semibold text-gray-900">
                  Booking Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={`mt-2 block w-full rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    errors.date
                      ? 'border-red-300 bg-red-50 text-gray-900'
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                />
                {errors.date && (
                  <p className="mt-2 flex items-center text-sm font-medium text-red-600">
                    <svg className="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18.101 12.93l-.902-14.85a1.5 1.5 0 00-1.528-1.393H4.329a1.5 1.5 0 00-1.529 1.393L1.899 12.93A3 3 0 104.743 19h10.514a3 3 0 00-2.857-6.07z" clipRule="evenodd" />
                    </svg>
                    {errors.date}
                  </p>
                )}
              </div>

              {/* Time Selection */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="startTime" className="block text-sm font-semibold text-gray-900">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    id="startTime"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    min="08:00"
                    max="18:00"
                    className={`mt-2 block w-full rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      errors.startTime
                        ? 'border-red-300 bg-red-50 text-gray-900'
                        : 'border-gray-300 bg-white text-gray-900'
                    }`}
                  />
                  {errors.startTime && (
                    <p className="mt-2 flex items-center text-sm font-medium text-red-600">
                      <svg className="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18.101 12.93l-.902-14.85a1.5 1.5 0 00-1.528-1.393H4.329a1.5 1.5 0 00-1.529 1.393L1.899 12.93A3 3 0 104.743 19h10.514a3 3 0 00-2.857-6.07z" clipRule="evenodd" />
                      </svg>
                      {errors.startTime}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="endTime" className="block text-sm font-semibold text-gray-900">
                    End Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    id="endTime"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    min="08:00"
                    max="18:00"
                    className={`mt-2 block w-full rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      errors.endTime
                        ? 'border-red-300 bg-red-50 text-gray-900'
                        : 'border-gray-300 bg-white text-gray-900'
                    }`}
                  />
                  {errors.endTime && (
                    <p className="mt-2 flex items-center text-sm font-medium text-red-600">
                      <svg className="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18.101 12.93l-.902-14.85a1.5 1.5 0 00-1.528-1.393H4.329a1.5 1.5 0 00-1.529 1.393L1.899 12.93A3 3 0 104.743 19h10.514a3 3 0 00-2.857-6.07z" clipRule="evenodd" />
                      </svg>
                      {errors.endTime}
                    </p>
                  )}
                </div>
              </div>

              {/* Smart Slot Suggestions */}
              {availableSlots.length > 0 && (
                <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-4">
                  <button
                    type="button"
                    onClick={() => setShowSlotSuggestions(!showSlotSuggestions)}
                    className="inline-flex items-center text-sm font-semibold text-amber-700 hover:text-amber-900"
                  >
                    <svg className={`mr-2 h-5 w-5 transition-transform ${showSlotSuggestions ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    💡 {showSlotSuggestions ? 'Hide' : 'Show'} Suggested Time Slots
                  </button>
                  {showSlotSuggestions && (
                    <div className="mt-4 grid gap-2">
                      {availableSlots.map((slot, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSelectSlot(slot)}
                          className="rounded-lg border-2 border-amber-300 bg-white px-4 py-3 text-left text-sm font-medium text-amber-900 transition-all hover:border-amber-500 hover:bg-amber-100 active:bg-amber-200"
                        >
                          <span className="font-bold">{slot.startTime}</span>
                          <span className="mx-2 text-gray-500">→</span>
                          <span className="font-bold">{slot.endTime}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Purpose */}
              <div>
                <label htmlFor="purpose" className="block text-sm font-semibold text-gray-900">
                  Purpose of Booking <span className="text-red-500">*</span>
                </label>
                <p className="mt-1 text-xs text-gray-600">What will this resource be used for?</p>
                <input
                  type="text"
                  id="purpose"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  placeholder="e.g., Lecture Class, Team Meeting, Research Lab Session"
                  maxLength="100"
                  className={`mt-2 block w-full rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    errors.purpose
                      ? 'border-red-300 bg-red-50 text-gray-900'
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                />
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-xs text-gray-500">{formData.purpose.length}/100 characters</p>
                  {errors.purpose && (
                    <p className="flex items-center text-xs font-medium text-red-600">
                      <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18.101 12.93l-.902-14.85a1.5 1.5 0 00-1.528-1.393H4.329a1.5 1.5 0 00-1.529 1.393L1.899 12.93A3 3 0 104.743 19h10.514a3 3 0 00-2.857-6.07z" clipRule="evenodd" />
                      </svg>
                      {errors.purpose}
                    </p>
                  )}
                </div>
              </div>

              {/* Attendees */}
              <div>
                <label htmlFor="attendees" className="block text-sm font-semibold text-gray-900">
                  Number of Attendees <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="attendees"
                  name="attendees"
                  value={formData.attendees}
                  onChange={handleChange}
                  min="1"
                  max="1000"
                  className={`mt-2 block w-full rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    errors.attendees || errors.capacity
                      ? 'border-red-300 bg-red-50 text-gray-900'
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                />
                {(errors.attendees || errors.capacity) && (
                  <p className="mt-2 flex items-center text-sm font-medium text-red-600">
                    <svg className="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18.101 12.93l-.902-14.85a1.5 1.5 0 00-1.528-1.393H4.329a1.5 1.5 0 00-1.529 1.393L1.899 12.93A3 3 0 104.743 19h10.514a3 3 0 00-2.857-6.07z" clipRule="evenodd" />
                    </svg>
                    {errors.attendees || errors.capacity}
                  </p>
                )}
                {selectedResource && formData.attendees > 0 && (
                  <div className={`mt-3 rounded-lg px-4 py-2 text-sm ${
                    formData.attendees <= selectedResource.capacity
                      ? 'border border-green-200 bg-green-50 text-green-800'
                      : 'border border-orange-200 bg-orange-50 text-orange-800'
                  }`}>
                    <p className="font-medium">
                      {formData.attendees <= selectedResource.capacity
                        ? `✓ Fits within capacity (${selectedResource.capacity} people)`
                        : `⚠️ Exceeds capacity (${selectedResource.capacity} people)`}
                    </p>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-semibold text-gray-900">
                  Additional Notes <span className="text-gray-500 font-normal">(Optional)</span>
                </label>
                <p className="mt-1 text-xs text-gray-600">Any special requirements or comments</p>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="E.g., Need projector setup, require accessibility features, dietary requirements..."
                  rows="3"
                  maxLength="500"
                  className="mt-2 block w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                />
                <p className="mt-1 text-xs text-gray-500">{formData.notes.length}/500 characters</p>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col gap-3 border-t border-gray-200 pt-6 sm:flex-row">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex items-center justify-center rounded-lg px-6 py-3 font-semibold text-white transition-all duration-200 ${
                    loading
                      ? 'cursor-not-allowed bg-gray-400'
                      : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-md hover:shadow-lg'
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="mr-2 h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Creating Booking...
                    </>
                  ) : (
                    <>
                      <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Create Booking
                    </>
                  )}
                </button>
                {onCancel && (
                  <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="rounded-lg border-2 border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-50 active:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            {/* Info Section */}
            <div className="mt-8 rounded-lg border border-blue-100 bg-blue-50 p-4">
              <h3 className="text-sm font-semibold text-blue-900">📝 Booking Information</h3>
              <ul className="mt-2 space-y-2 text-xs text-blue-800">
                <li>• Bookings are subject to admin approval</li>
                <li>• Working hours: 08:00 AM to 06:00 PM</li>
                <li>• Minimum booking duration: 30 minutes</li>
                <li>• You can manage your bookings from your dashboard</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
