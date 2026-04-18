import React from 'react'
import CreateTicketForm from './CreateTicketForm'

export const CreateTicketPage = ({ onSuccess, onCancel }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Create Incident Ticket</h1>
        <button
          onClick={onCancel}
          className="text-gray-600 hover:text-gray-800 font-medium"
        >
          ← Back to List
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CreateTicketForm onSuccess={onSuccess} />
        </div>

        <div className="lg:col-span-1">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-3">Quick Tips</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>✓ Be specific in your title</li>
              <li>✓ Include all relevant details</li>
              <li>✓ Add attachments if helpful</li>
              <li>✓ Provide valid contact info</li>
              <li>✓ Choose appropriate priority</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateTicketPage
