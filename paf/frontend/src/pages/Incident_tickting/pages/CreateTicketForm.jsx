import React, { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { validateTicketForm } from '../utils/validationUtils'
import ticketApiService from '../services/ticketApiService'
import { ErrorAlert, SuccessAlert } from '../components/ErrorAlert'
import LoadingSpinner from '../components/LoadingSpinner'
import AttachmentUploader from '../components/AttachmentUploader'

export const CreateTicketForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    resourceId: '',
    location: '',
    priority: 'MEDIUM',
    preferredContact: '',
    attachments: []
  })

  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleFilesSelected = (files) => {
    setFormData(prev => ({ ...prev, attachments: files }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSuccessMessage(null)

    // Validate form
    const validation = validateTicketForm(formData)
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    setErrors({})
    setIsLoading(true)

    try {
      const submitData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category.trim(),
        resourceId: formData.resourceId?.trim() || null,
        location: formData.location?.trim() || null,
        priority: formData.priority,
        preferredContact: formData.preferredContact.trim()
      }

      await ticketApiService.createTicket(submitData)
      setSuccessMessage('Ticket created successfully!')
      
      setTimeout(() => {
        onSuccess()
      }, 1500)
    } catch (err) {
      setErrors({ submit: err.message || 'Failed to create ticket' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Incident Ticket</h2>

      {successMessage && <SuccessAlert message={successMessage} />}
      {errors.submit && <ErrorAlert message={errors.submit} />}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Brief description of the issue"
            maxLength={100}
            disabled={isLoading}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.title ? 'border-red-500 bg-red-50' : 'border-gray-300'
            } disabled:bg-gray-100`}
          />
          <div className="flex justify-between mt-1">
            <p className="text-xs text-red-600">{errors.title}</p>
            <p className="text-xs text-gray-500">{formData.title.length}/100</p>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Detailed description of the incident"
            maxLength={1000}
            rows="4"
            disabled={isLoading}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.description ? 'border-red-500 bg-red-50' : 'border-gray-300'
            } disabled:bg-gray-100`}
          />
          <div className="flex justify-between mt-1">
            <p className="text-xs text-red-600">{errors.description}</p>
            <p className="text-xs text-gray-500">{formData.description.length}/1000</p>
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleInputChange}
            disabled={isLoading}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.priority ? 'border-red-500 bg-red-50' : 'border-gray-300'
            } disabled:bg-gray-100`}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
          {errors.priority && <p className="text-xs text-red-600 mt-1">{errors.priority}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            placeholder="e.g., Facility, IT, Safety"
            disabled={isLoading}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.category ? 'border-red-500 bg-red-50' : 'border-gray-300'
            } disabled:bg-gray-100`}
          />
          {errors.category && <p className="text-xs text-red-600 mt-1">{errors.category}</p>}
        </div>

        {/* Resource ID / Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resource ID</label>
            <input
              type="text"
              name="resourceId"
              value={formData.resourceId}
              onChange={handleInputChange}
              placeholder="e.g., LAB-101"
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="e.g., Building A, 2nd Floor"
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
            />
          </div>
        </div>
        {errors.resource && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded">
            <AlertCircle className="h-4 w-4" />
            {errors.resource}
          </div>
        )}

        {/* Preferred Contact */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Contact (Email or Phone) *</label>
          <input
            type="text"
            name="preferredContact"
            value={formData.preferredContact}
            onChange={handleInputChange}
            placeholder="email@example.com or (123) 456-7890"
            disabled={isLoading}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.preferredContact ? 'border-red-500 bg-red-50' : 'border-gray-300'
            } disabled:bg-gray-100`}
          />
          {errors.preferredContact && <p className="text-xs text-red-600 mt-1">{errors.preferredContact}</p>}
        </div>

        {/* Attachments */}
        <AttachmentUploader onFilesSelected={handleFilesSelected} disabled={isLoading} />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
        >
          {isLoading ? 'Creating Ticket...' : 'Create Ticket'}
        </button>
      </form>
    </div>
  )
}

export default CreateTicketForm
