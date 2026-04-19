import React from 'react'
import { StatusBadge, PriorityBadge } from './StatusBadge'
import SLABadge from './SLABadge'
import { ChevronRight } from 'lucide-react'

export const TicketCard = ({ ticket, onClick }) => {
  const createdDate = new Date(ticket.createdAt).toLocaleDateString()

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer border border-gray-200 p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
            {ticket.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {ticket.description}
          </p>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 ml-2" />
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3 pt-3 border-t border-gray-100">
        <div className="flex gap-2 flex-wrap">
          <StatusBadge status={ticket.status} size="sm" />
          <PriorityBadge priority={ticket.priority} size="sm" />
          {ticket.escalationLevel && (
            <SLABadge 
              slaDeadline={ticket.slaDeadline}
              escalationLevel={ticket.escalationLevel}
              isOverdue={ticket.isOverdue}
              size="sm"
              showTime={true}
            />
          )}
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-600">
          <span>#{ticket.id.substring(0, 8)}</span>
          <span>{createdDate}</span>
          {ticket.comments && ticket.comments.length > 0 && (
            <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded">
              {ticket.comments.length} comments
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default TicketCard
