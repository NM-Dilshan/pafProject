import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { LogOut, ArrowLeft } from 'lucide-react'
import TicketListPage from './pages/TicketListPage'
import CreateTicketPage from './pages/CreateTicketPage'
import TicketDetailsPage from './pages/TicketDetailsPage'

export const IncidentTicketingPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [currentView, setCurrentView] = useState('list')
  const [selectedTicketId, setSelectedTicketId] = useState(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const isAdmin = user?.role === 'ADMIN'
  const isTechnician = user?.role === 'TECHNICIAN'

  const handleViewTicket = (ticketId) => {
    setSelectedTicketId(ticketId)
    setCurrentView('details')
  }

  const handleCreateNew = () => {
    if (isAdmin) {
      return
    }
    setCurrentView('create')
  }

  const handleCreateSuccess = () => {
    setRefreshTrigger((prev) => prev + 1)
    setCurrentView('list')
  }

  const handleBack = () => {
    setCurrentView('list')
    setSelectedTicketId(null)
  }

  const handleLogout = () => {
    const { logout } = useAuth()
    logout()
    navigate('/login', { replace: true })
  }

  const handleNavigateBack = () => {
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <header className="border-b border-green-100 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleNavigateBack}
                className="inline-flex items-center justify-center h-10 w-10 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                aria-label="Back to dashboard"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-green-900">
                  {isAdmin ? 'Support Tickets' : 'My Tickets'}
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  {isAdmin ? 'Manage and oversee all support tickets' : 'Create and track your support requests'}
                </p>
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
        {currentView === 'list' && (
          <TicketListPage
            isAdmin={isAdmin}
            isTechnician={isTechnician}
            currentUserId={user?.id}
            onCreateNew={handleCreateNew}
            onViewTicket={handleViewTicket}
            refreshTrigger={refreshTrigger}
          />
        )}

        {currentView === 'create' && !isAdmin && (
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
      </main>
    </div>
  )
}

export default IncidentTicketingPage
