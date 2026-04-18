import React, { useState, useEffect } from 'react'
import { Plus, Filter } from 'lucide-react'
import ticketApiService from '../services/ticketApiService'
import TicketCard from '../components/TicketCard'
import TicketTable from '../components/TicketTable'
import { ErrorAlert } from '../components/ErrorAlert'
import LoadingSpinner from '../components/LoadingSpinner'

export const TicketListPage = ({ isAdmin, isTechnician, currentUserId, onCreateNew, onViewTicket }) => {
  const [tickets, setTickets] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'table'

  useEffect(() => {
    fetchTickets()
  }, [])

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          {isAdmin ? 'All Tickets' : isTechnician ? 'Assigned Tickets' : 'My Tickets'}
        </h1>
        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium"
        >
          <Plus className="h-5 w-5" />
          New Ticket
        </button>
      </div>

      {/* Error Alert */}
      {error && <ErrorAlert message={error} />}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition ${
              filterStatus === status
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
          className={`px-3 py-2 rounded text-sm font-medium ${
            viewMode === 'grid'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Grid
        </button>
        <button
          onClick={() => setViewMode('table')}
          className={`px-3 py-2 rounded text-sm font-medium ${
            viewMode === 'table'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Table
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSpinner />
      ) : filteredTickets.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredTickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onClick={() => onViewTicket(ticket.id)}
              />
            ))}
          </div>
        ) : (
          <TicketTable
            tickets={filteredTickets}
            onTicketClick={onViewTicket}
          />
        )
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">
            {isAdmin ? 'No tickets found' : isTechnician ? 'No tickets assigned to you yet' : 'You have not created any tickets yet'}
          </p>
          <button
            onClick={onCreateNew}
            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-medium"
          >
            <Plus className="h-5 w-5" />
            Create Your First Ticket
          </button>
        </div>
      )}
    </div>
  )
}

export default TicketListPage
