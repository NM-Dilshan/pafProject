import React, { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import ticketApiService from '../services/ticketApiService'
import TicketCard from '../components/TicketCard'
import TicketTable from '../components/TicketTable'
import { ErrorAlert } from '../components/ErrorAlert'
import LoadingSpinner from '../components/LoadingSpinner'

export const TicketListPage = ({ isAdmin, isTechnician, currentUserId, onCreateNew, onViewTicket, refreshTrigger }) => {
  const [tickets, setTickets] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [viewMode, setViewMode] = useState('grid')

  useEffect(() => {
    fetchTickets()
  }, [refreshTrigger])

  const fetchTickets = async () => {
    setIsLoading(true)
    setError(null)

    try {
      let data
      if (isAdmin) {
        data = await ticketApiService.getAllTickets()
      } else if (isTechnician) {
        data = await ticketApiService.getAssignedTickets()
      } else {
        data = await ticketApiService.getMyTickets()
      }
      setTickets(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Failed to load tickets')
      setTickets([])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredTickets = filterStatus === 'ALL'
    ? tickets
    : tickets.filter(t => t.status === filterStatus)

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && <ErrorAlert message={error} />}

      {/* Content Container */}
      <div className="rounded-3xl border border-green-100 bg-white p-8 shadow-sm">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-green-900">
              {isAdmin ? 'All Tickets' : isTechnician ? 'Assigned Tickets' : 'Your Tickets'}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {isAdmin ? 'Manage all support requests' : isTechnician ? 'Handle your assigned tickets' : 'View and manage your support requests'}
            </p>
          </div>
          {!isAdmin && (
            <button
              onClick={onCreateNew}
              className="inline-flex items-center gap-2 rounded-2xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-green-200 transition hover:bg-green-700"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Ticket</span>
            </button>
          )}
        </div>

        {/* Filter and View Mode Controls */}
        <div className="mb-8 space-y-4 border-b border-green-100 pb-6">
          {/* Status Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                  filterStatus === status
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                viewMode === 'grid'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                viewMode === 'table'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Table
            </button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <LoadingSpinner />
        ) : filteredTickets.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filteredTickets.map((ticket) => (
                <div key={ticket.id} onClick={() => onViewTicket(ticket.id)} className="cursor-pointer">
                  <TicketCard ticket={ticket} onClick={() => onViewTicket(ticket.id)} />
                </div>
              ))}
            </div>
          ) : (
            <TicketTable
              tickets={filteredTickets}
              onTicketClick={onViewTicket}
            />
          )
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-green-200 bg-green-50/50 py-12 text-center">
            <p className="text-lg text-gray-600 mb-4">
              {isAdmin ? 'No tickets found' : isTechnician ? 'No tickets assigned to you yet' : 'You have not created any tickets yet'}
            </p>
            {!isAdmin && (
              <button
                onClick={onCreateNew}
                className="inline-flex items-center gap-2 rounded-2xl bg-green-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-green-200 transition hover:bg-green-700"
              >
                <Plus className="h-4 w-4" />
                Create Your First Ticket
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default TicketListPage
