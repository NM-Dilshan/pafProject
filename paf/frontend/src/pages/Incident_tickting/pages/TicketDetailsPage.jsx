import React, { useState, useEffect } from 'react'
import { ChevronLeft, AlertCircle, Check } from 'lucide-react'
import ticketApiService from '../services/ticketApiService'
import { StatusBadge, PriorityBadge } from '../components/StatusBadge'
import AttachmentPreviewList from '../components/AttachmentPreviewList'
import CommentThread from '../components/CommentThread'
import { ErrorAlert, SuccessAlert } from '../components/ErrorAlert'
import LoadingSpinner from '../components/LoadingSpinner'
import { formatDateTime } from '../utils/formatUtils'

export const TicketDetailsPage = ({ ticketId, isAdmin, isTechnician, currentUserId, onBack }) => {
  const [ticket, setTicket] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [showStatusForm, setShowStatusForm] = useState(false)
  const [newStatus, setNewStatus] = useState(null)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    fetchTicket()
  }, [ticketId])

  const fetchTicket = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await ticketApiService.getTicket(ticketId)
      setTicket(data)
      setNewStatus(data.status)
    } catch (err) {
      setError(err.message || 'Failed to load ticket')
    } finally {
      setIsLoading(false)
    }
  }

  const getValidTransitions = (status, role) => {
    const adminTransitions = {
      OPEN: ['IN_PROGRESS', 'REJECTED'],
      IN_PROGRESS: ['RESOLVED', 'REJECTED'],
      RESOLVED: ['CLOSED'],
      CLOSED: [],
      REJECTED: []
    }
    
    const technicianTransitions = {
      OPEN: ['IN_PROGRESS'],
      IN_PROGRESS: ['RESOLVED'],
      RESOLVED: [],
      CLOSED: [],
      REJECTED: []
    }
    
    const transitions = role === 'TECHNICIAN' ? technicianTransitions : adminTransitions
    return transitions[status] || []
  }

  const handleStatusChange = async () => {
    if (!newStatus || newStatus === ticket.status) {
      return
    }

    if (newStatus === 'RESOLVED' && !notes.trim()) {
      setError('Resolution notes are required when marking as RESOLVED')
      return
    }

    if (newStatus === 'REJECTED' && !notes.trim()) {
      setError('Rejection reason is required when marking as REJECTED')
      return
    }

    setIsUpdatingStatus(true)
    setError(null)

    try {
      const statusData = { status: newStatus }
      if (newStatus === 'RESOLVED') {
        statusData.resolutionNotes = notes
      } else if (newStatus === 'REJECTED') {
        statusData.rejectionReason = notes
      }

      await ticketApiService.updateTicketStatus(ticketId, statusData)
      setSuccessMessage('Ticket status updated successfully')
      setShowStatusForm(false)
      setNotes('')
      fetchTicket()

      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err.message || 'Failed to update ticket status')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  if (isLoading) return <LoadingSpinner />

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-700 text-lg">{error || 'Ticket not found'}</p>
      </div>
    )
  }

  const validTransitions = getValidTransitions(ticket.status, isTechnician ? 'TECHNICIAN' : 'ADMIN')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium"
        >
          <ChevronLeft className="h-5 w-5" />
          Back
        </button>
      </div>

      {/* Alerts */}
      {successMessage && <SuccessAlert message={successMessage} />}
      {error && <ErrorAlert message={error} />}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Ticket Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{ticket.title}</h1>
                <p className="text-gray-500 text-sm mt-1">Ticket ID: {ticket.id}</p>
              </div>
              <div className="flex gap-2">
                <StatusBadge status={ticket.status} size="lg" />
                <PriorityBadge priority={ticket.priority} size="lg" />
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
            </div>
          </div>

          {/* Details Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Category</p>
                <p className="text-sm font-medium text-gray-900">{ticket.category}</p>
              </div>
              {ticket.resourceId && (
                <div>
                  <p className="text-sm text-gray-600">Resource ID</p>
                  <p className="text-sm font-medium text-gray-900">{ticket.resourceId}</p>
                </div>
              )}
              {ticket.location && (
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="text-sm font-medium text-gray-900">{ticket.location}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Preferred Contact</p>
                <p className="text-sm font-medium text-gray-900">{ticket.preferredContact}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Reported By</p>
                <p className="text-sm font-medium text-gray-900">{ticket.reportedByName}</p>
              </div>
              {ticket.assignedTo && (
                <div>
                  <p className="text-sm text-gray-600">Assigned To</p>
                  <p className="text-sm font-medium text-gray-900">{ticket.assignedToName}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="text-sm font-medium text-gray-900">{formatDateTime(ticket.createdAt)}</p>
              </div>
              {ticket.resolutionNotes && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Resolution Notes</p>
                  <p className="text-sm font-medium text-gray-900 whitespace-pre-wrap">{ticket.resolutionNotes}</p>
                </div>
              )}
              {ticket.rejectionReason && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Rejection Reason</p>
                  <p className="text-sm font-medium text-gray-900 whitespace-pre-wrap">{ticket.rejectionReason}</p>
                </div>
              )}
            </div>
          </div>

          {/* Attachments */}
          {ticket.attachmentUrls && ticket.attachmentUrls.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <AttachmentPreviewList attachmentUrls={ticket.attachmentUrls} />
            </div>
          )}

          {/* Comments */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Comments</h2>
            <CommentThread
              ticketId={ticketId}
              comments={ticket.comments || []}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              onCommentAdded={fetchTicket}
            />
          </div>
        </div>

        {/* Right Column - Actions */}
        {(isAdmin || isTechnician) && (
          <div>
            <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{isAdmin ? 'Admin' : 'Technician'} Actions</h3>

              {showStatusForm ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Change Status
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      disabled={isUpdatingStatus}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={ticket.status}>{ticket.status}</option>
                      {validTransitions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  {newStatus === 'RESOLVED' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Resolution Notes
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        disabled={isUpdatingStatus}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  {isAdmin && newStatus === 'REJECTED' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rejection Reason
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        disabled={isUpdatingStatus}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={handleStatusChange}
                      disabled={isUpdatingStatus || newStatus === ticket.status}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check className="h-4 w-4" />
                      Update
                    </button>
                    <button
                      onClick={() => {
                        setShowStatusForm(false)
                        setNewStatus(ticket.status)
                        setNotes('')
                      }}
                      disabled={isUpdatingStatus}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setShowStatusForm(true)}
                    disabled={validTransitions.length === 0}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    Change Status
                  </button>
                  {validTransitions.length === 0 && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      No transitions available for this status
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TicketDetailsPage
