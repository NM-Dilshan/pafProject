import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import TicketListPage from './pages/TicketListPage'
import CreateTicketPage from './pages/CreateTicketPage'
import TicketDetailsPage from './pages/TicketDetailsPage'

export const IncidentTicketingPage = () => {
  const { user } = useAuth()
  const [currentView, setCurrentView] = useState('list') // 'list', 'create', 'details'
  const [selectedTicketId, setSelectedTicketId] = useState(null)

  const isAdmin = user?.role === 'ADMIN'
  const isTechnician = user?.role === 'TECHNICIAN'

  const handleViewTicket = (ticketId) => {
    setSelectedTicketId(ticketId)
    setCurrentView('details')
  }

  const handleCreateNew = () => {
    setCurrentView('create')
  }

  const handleCreateSuccess = () => {
    setCurrentView('list')
  }

  const handleBack = () => {
    setCurrentView('list')
    setSelectedTicketId(null)
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {currentView === 'list' && (
          <TicketListPage
            isAdmin={isAdmin}
            isTechnician={isTechnician}
            currentUserId={user?.id}
            onCreateNew={handleCreateNew}
            onViewTicket={handleViewTicket}
          />
        )}

        {currentView === 'create' && (
          <CreateTicketPage
            onSuccess={handleCreateSuccess}
            onCancel={handleBack}
          />
        )}

        {currentView === 'details' && selectedTicketId && (
          <TicketDetailsPage
            ticketId={selectedTicketId}
            isAdmin={isAdmin}
            isTechnician={isTechnician}
            currentUserId={user?.id}
            onBack={handleBack}
          />
        )}
      </div>
    </div>
  )
}

export default IncidentTicketingPage
