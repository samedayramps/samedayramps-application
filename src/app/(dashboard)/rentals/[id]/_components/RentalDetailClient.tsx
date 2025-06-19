"use client";

import { useState } from "react";
import { Rental } from "@/types";
import { Decimal } from "@prisma/client/runtime/library";
import {
  Calendar,
  Mail,
  Phone,
  User,
  FileText,
  DollarSign,
} from "lucide-react";
import RentalWorkflow from "./RentalWorkflow";

const getStatusColor = (status: string) => {
  switch (status) {
    case "PENDING":
      return "bg-gray-100 text-gray-800";
    case "AGREEMENT_SENT":
      return "bg-purple-100 text-purple-800";
    case "AGREEMENT_SIGNED":
      return "bg-indigo-100 text-indigo-800";
    case "INSTALLATION_SCHEDULED":
      return "bg-blue-100 text-blue-800";
    case "ACTIVE":
      return "bg-green-100 text-green-800";
    case "REMOVAL_SCHEDULED":
      return "bg-orange-100 text-orange-800";
    case "COMPLETED":
      return "bg-gray-100 text-gray-800";
    case "ON_HOLD":
      return "bg-yellow-100 text-yellow-800";
    case "CANCELLED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const formatCurrency = (amount: number | Decimal | null | undefined) => {
  if (amount === null || amount === undefined) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(amount));
};

export default function RentalDetailClient({ initialRental }: { initialRental: Rental }) {
  const [rental, setRental] = useState(initialRental);

  const handleUpdate = (updatedRental: Rental) => {
    setRental(updatedRental);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="space-y-4 md:space-y-6">
        <RentalWorkflow rental={rental} onUpdate={handleUpdate} />

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start gap-3">
          <div className="flex flex-col space-y-2">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900">
              Rental Details
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              Rental ID: {rental.id}
            </p>
          </div>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
              rental.status
            )}`}
          >
            {rental.status.replace(/_/g, " ").toLowerCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Left Column: Customer and Quote Info */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow p-4 md:p-6">
              <div className="flex items-center space-x-3 mb-4">
                <User className="h-6 w-6 text-gray-500" />
                <h2 className="text-lg md:text-xl font-bold text-gray-900">
                  {rental.customer.firstName} {rental.customer.lastName}
                </h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <p className="text-sm text-gray-900">
                    {rental.customer.email}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <p className="text-sm text-gray-900">
                    {rental.customer.phone}
                  </p>
                </div>
              </div>
            </div>

            {/* Quote Information */}
            {rental.quote && (
              <div className="bg-white rounded-lg shadow p-4 md:p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <FileText className="h-6 w-6 text-gray-500" />
                  <h2 className="text-lg md:text-xl font-bold text-gray-900">
                    Original Quote
                  </h2>
                </div>
                <p className="text-sm text-gray-600">
                  Installation Address: {rental.quote.installationAddress}
                </p>
                <div className="mt-4 flex space-x-4">
                  <a
                    href={`/quotes/${rental.quote.id}`}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    View full quote details
                  </a>
                  {rental.signedAgreementUrl && (
                    <a
                      href={rental.signedAgreementUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-green-600 hover:underline"
                    >
                      View Signed Agreement
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Financials */}
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex items-center space-x-3 mb-4">
              <DollarSign className="h-6 w-6 text-gray-500" />
              <h2 className="text-lg md:text-xl font-bold text-gray-900">
                Financials
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Upfront Cost</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(rental.upfrontCost)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Monthly Rate</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(rental.monthlyRate)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Paid</p>
                <p className="text-lg font-semibold text-green-600">
                  {formatCurrency(rental.totalPaid)}
                </p>
              </div>
              <hr />
              <div>
                <p className="text-sm text-gray-600">Start Date</p>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p className="text-sm text-gray-900">
                    {new Date(rental.startDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {rental.nextPaymentDate && (
                 <div>
                  <p className="text-sm text-gray-600">Next Payment Due</p>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-gray-900">
                      {new Date(rental.nextPaymentDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 