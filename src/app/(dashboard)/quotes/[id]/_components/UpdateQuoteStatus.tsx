"use client";

import { useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import { updateQuoteStatus } from "../_actions/updateQuoteStatus";

interface Quote {
  id: string;
  status: string;
  adminNotes?: string | null;
  customerNotes?: string | null;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING': return 'bg-gray-100 text-gray-800';
    case 'REVIEWING': return 'bg-blue-100 text-blue-800';
    case 'QUOTED': return 'bg-yellow-100 text-yellow-800';
    case 'ACCEPTED': return 'bg-green-100 text-green-800';
    case 'CONVERTED': return 'bg-green-100 text-green-800';
    case 'DECLINED': return 'bg-red-100 text-red-800';
    case 'EXPIRED': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const statusOptions = [
  { value: "PENDING", label: "Pending", description: "Waiting for review" },
  { value: "REVIEWING", label: "Reviewing", description: "Under review" },
  { value: "QUOTED", label: "Quoted", description: "Quote sent to customer" },
  { value: "ACCEPTED", label: "Accepted", description: "Customer accepted quote" },
  { value: "DECLINED", label: "Declined", description: "Customer declined quote" },
  { value: "EXPIRED", label: "Expired", description: "Quote has expired" },
  { value: "CONVERTED", label: "Converted", description: "Sale completed" },
];

export default function UpdateQuoteStatus({ quote }: { quote: Quote }) {
  const [status, setStatus] = useState(quote.status);
  const [loading, setLoading] = useState(false);

  const handleUpdateStatus = async () => {
    setLoading(true);
    try {
      await updateQuoteStatus(quote.id, status);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = status !== quote.status;
  const currentOption = statusOptions.find(option => option.value === status);

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <p className="text-sm md:text-base font-medium text-gray-900">Current Status</p>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(quote.status)}`}>
          {quote.status.toLowerCase()}
        </span>
      </div>

      <div className="flex flex-col space-y-3">
        <p className="text-sm md:text-base font-medium text-gray-900">Update Status</p>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label} - {option.description}
            </option>
          ))}
        </select>

        {hasChanges && currentOption && (
          <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              Will change to: <strong>{currentOption.label}</strong>
            </p>
          </div>
        )}
      </div>

      <button
        onClick={handleUpdateStatus}
        disabled={loading || !hasChanges}
        className={`w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
          hasChanges
            ? 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {loading ? (
          <>
            <RotateCcw className="h-4 w-4 animate-spin" />
            <span>Updating...</span>
          </>
        ) : hasChanges ? (
          <>
            <Check className="h-4 w-4" />
            <span>Update Status</span>
          </>
        ) : (
          <span>No Changes</span>
        )}
      </button>
    </div>
  );
} 