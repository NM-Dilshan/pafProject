import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import bookingService from '../services/bookingService';
import './BookingForm.css';

/**
 * BookingForm Component
 * 
 * Allows users to create a new resource booking.
 * 
 * Features:
 * - Resource dropdown (fetches from backend)
 * - Date and time selection
 * - Conflict detection with smart suggestions
 * - Real-time form validation
 * - Loading states and error handling
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
        setError('Failed to load resources');
        console.error(err);
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

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};

    if (!formData.resourceId) {
      newErrors.resourceId = 'Please select a resource';
    }

    if (!formData.date) {
      newErrors.date = 'Please select a date';
    } else if (new Date(formData.date) < new Date().setHours(0, 0, 0, 0)) {
      newErrors.date = 'Date cannot be in the past';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Please enter start time';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'Please enter end time';
    }

    if (formData.startTime && formData.endTime) {
      if (formData.startTime >= formData.endTime) {
        newErrors.endTime = 'End time must be after start time';
      }

      // Check working hours (08:00 - 18:00)
      if (formData.startTime < '08:00') {
        newErrors.startTime = 'Start time must be at or after 08:00';
      }
      if (formData.endTime > '18:00') {
        newErrors.endTime = 'End time must be at or before 18:00';
      }
    }

    if (!formData.purpose || formData.purpose.trim().length < 3) {
      newErrors.purpose = 'Purpose must be at least 3 characters';
    }

    if (formData.attendees < 1) {
      newErrors.attendees = 'Attendees must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
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

  // Handle slot suggestion click
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
      
      setSuccess('Booking created successfully!');
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

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create booking';
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Get selected resource name
  const selectedResource = resources.find((r) => r.id === formData.resourceId);
  const resourceName = selectedResource ? selectedResource.hallName : '';

  return (
    <div className="booking-form-container">
      <div className="booking-form-header">
        <h2>Create New Booking</h2>
        <p className="booking-form-subtitle">Book a resource for your event or class</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit} className="booking-form">
        {/* Resource Selection */}
        <div className="form-group">
          <label htmlFor="resourceId" className="form-label">
            Resource <span className="required">*</span>
          </label>
          <select
            id="resourceId"
            name="resourceId"
            value={formData.resourceId}
            onChange={handleChange}
            className={`form-input ${errors.resourceId ? 'input-error' : ''}`}
            disabled={loading}
          >
            <option value="">Select a resource...</option>
            {resources.map((resource) => (
              <option key={resource.id} value={resource.id}>
                {resource.hallName} (Capacity: {resource.capacity})
              </option>
            ))}
          </select>
          {errors.resourceId && <span className="error-text">{errors.resourceId}</span>}
          {selectedResource && (
            <div className="resource-info">
              <p className="info-text">
                <strong>Type:</strong> {selectedResource.resourceType}
              </p>
              <p className="info-text">
                <strong>Location:</strong> {selectedResource.buildingName}, Block {selectedResource.blockName}, Floor {selectedResource.floorNumber}
              </p>
              <p className="info-text">
                <strong>Capacity:</strong> {selectedResource.capacity} people
              </p>
            </div>
          )}
        </div>

        {/* Date Selection */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date" className="form-label">
              Date <span className="required">*</span>
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={`form-input ${errors.date ? 'input-error' : ''}`}
              min={new Date().toISOString().split('T')[0]}
            />
            {errors.date && <span className="error-text">{errors.date}</span>}
          </div>
        </div>

        {/* Time Selection */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startTime" className="form-label">
              Start Time <span className="required">*</span>
            </label>
            <input
              type="time"
              id="startTime"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className={`form-input ${errors.startTime ? 'input-error' : ''}`}
              min="08:00"
              max="18:00"
            />
            {errors.startTime && <span className="error-text">{errors.startTime}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="endTime" className="form-label">
              End Time <span className="required">*</span>
            </label>
            <input
              type="time"
              id="endTime"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className={`form-input ${errors.endTime ? 'input-error' : ''}`}
              min="08:00"
              max="18:00"
            />
            {errors.endTime && <span className="error-text">{errors.endTime}</span>}
          </div>
        </div>

        {/* Smart Slot Suggestions */}
        {availableSlots.length > 0 && (
          <div className="slot-suggestions">
            <button
              type="button"
              className="suggestions-toggle"
              onClick={() => setShowSlotSuggestions(!showSlotSuggestions)}
            >
              💡 {showSlotSuggestions ? 'Hide' : 'Show'} Available Time Slots
            </button>
            {showSlotSuggestions && (
              <div className="suggestions-list">
                {availableSlots.map((slot, index) => (
                  <button
                    key={index}
                    type="button"
                    className="suggestion-item"
                    onClick={() => handleSelectSlot(slot)}
                  >
                    <span className="slot-time">
                      {slot.startTime} - {slot.endTime}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Purpose */}
        <div className="form-group">
          <label htmlFor="purpose" className="form-label">
            Purpose <span className="required">*</span>
          </label>
          <input
            type="text"
            id="purpose"
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            placeholder="e.g., Class Lecture, Team Meeting"
            className={`form-input ${errors.purpose ? 'input-error' : ''}`}
          />
          {errors.purpose && <span className="error-text">{errors.purpose}</span>}
        </div>

        {/* Attendees */}
        <div className="form-group">
          <label htmlFor="attendees" className="form-label">
            Number of Attendees <span className="required">*</span>
          </label>
          <input
            type="number"
            id="attendees"
            name="attendees"
            value={formData.attendees}
            onChange={handleChange}
            min="1"
            className={`form-input ${errors.attendees ? 'input-error' : ''}`}
          />
          {errors.attendees && <span className="error-text">{errors.attendees}</span>}
          {selectedResource && formData.attendees > selectedResource.capacity && (
            <span className="warning-text">
              ⚠️ Attendees exceed resource capacity ({selectedResource.capacity})
            </span>
          )}
        </div>

        {/* Notes */}
        <div className="form-group">
          <label htmlFor="notes" className="form-label">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any special requirements or notes..."
            rows="3"
            className="form-input"
          />
        </div>

        {/* Action Buttons */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating Booking...' : 'Create Booking'}
          </button>
          {onCancel && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default BookingForm;
