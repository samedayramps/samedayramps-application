"use client";

import { useState } from "react";
import { Decimal } from "@prisma/client/runtime/library";
import { Calendar, Mail, Phone } from "lucide-react";
import QuoteWorkflow from "./QuoteWorkflow";
import EditQuoteForm from "./EditQuoteForm";
import { Quote } from "@/types";

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING': return 'bg-gray-100 text-gray-800';
    case 'INFORMATION_GATHERING': return 'bg-blue-100 text-blue-800';
    case 'QUOTED': return 'bg-yellow-100 text-yellow-800';
    case 'ACCEPTED': return 'bg-green-100 text-green-800';
    case 'CONVERTED': return 'bg-green-100 text-green-800';
    case 'DECLINED': return 'bg-red-100 text-red-800';
    case 'EXPIRED': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const formatCurrency = (amount: number | Decimal | null | undefined) => {
  if (amount === null || amount === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(amount));
};

interface QuoteDetailClientProps {
  initialQuote: Quote;
}

export default function QuoteDetailClient({ initialQuote }: QuoteDetailClientProps) {
  const [quote, setQuote] = useState(initialQuote);

  const handleQuoteUpdate = (updatedQuote: Quote) => {
    setQuote(updatedQuote);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="space-y-4 md:space-y-6">
        {/* Workflow Tracker */}
        <QuoteWorkflow quote={quote} onUpdate={handleQuoteUpdate} />
        
        {/* Edit Form */}
        <EditQuoteForm quote={quote} onUpdate={handleQuoteUpdate} />
        
        {/* Header & Info */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start gap-3">
          <div className="flex flex-col space-y-2">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900">Quote Details</h1>
            <p className="text-sm md:text-base text-gray-600">Quote ID: {quote.id}</p>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(quote.status)}`}>
            {quote.status.replace(/_/g, ' ').toLowerCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 md:w-12 md:h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm md:text-base font-medium">
                    {quote.customer.firstName[0]}{quote.customer.lastName[0]}
                  </span>
                </div>
                <div className="flex flex-col space-y-1">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900">
                    {quote.customer.firstName} {quote.customer.lastName}
                  </h2>
                  <p className="text-sm text-gray-600">Customer Information</p>
                </div>
              </div>
              <hr className="border-gray-200" />
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <p className="text-sm md:text-base text-gray-900">{quote.customer.email}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <p className="text-sm md:text-base text-gray-900">{quote.customer.phone}</p>
                </div>
                 {quote.customer.alternatePhone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <p className="text-sm md:text-base text-gray-900">{quote.customer.alternatePhone} (alt)</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quote Information */}
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="space-y-4">
               <h2 className="text-lg md:text-xl font-bold text-gray-900">Project Details</h2>
              <hr className="border-gray-200" />
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                   <p className="text-sm text-gray-600 font-medium">Installation Address:</p>
                  <p className="text-sm md:text-base text-gray-900">{quote.installationAddress}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                   <p className="text-sm md:text-base text-gray-900">{new Date(quote.createdAt).toLocaleDateString()}</p>
                </div>
                {quote.totalEstimatedCost && (
                  <div className="flex items-center space-x-3">
                    <p className="text-sm text-gray-600 font-medium">Estimated Cost:</p>
                    <p className="text-sm md:text-base font-medium text-green-600">
                      {formatCurrency(quote.totalEstimatedCost)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        {(quote.adminNotes || quote.customerNotes) && (
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Notes</h2>
            <hr className="border-gray-200" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {quote.adminNotes && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Admin Notes</h3>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">{quote.adminNotes}</div>
                </div>
              )}
              {quote.customerNotes && (
                 <div>
                  <h3 className="text-sm font-medium text-gray-900">Customer Notes</h3>
                  <div className="mt-1 p-3 bg-blue-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">{quote.customerNotes}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 