import { db } from "@/lib/db";
import Link from "next/link";
import { Search, Eye } from "lucide-react";

interface Customer {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface Quote {
  id: string;
  status: string;
  createdAt: Date;
  installationAddress: string;
  adminNotes?: string | null;
  customerNotes?: string | null;
  estimatedCost?: unknown; // Prisma Decimal type
  customer: Customer;
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

const formatCurrency = (amount: unknown) => {
  if (!amount) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(amount));
};

export default async function QuotesPage() {
  const quotes: Quote[] = await db.quote.findMany({
    include: {
      customer: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const statusCounts = quotes.reduce((acc, quote) => {
    acc[quote.status] = (acc[quote.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-4 md:p-6">
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col space-y-1">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900">Quotes</h1>
            <p className="text-sm md:text-base text-gray-600">{quotes.length} total quotes</p>
          </div>
          <div className="relative w-full sm:w-auto sm:max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search quotes..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Status Overview */}
        <div className="flex flex-wrap gap-3">
          {Object.entries(statusCounts).map(([status, count]) => (
            <span
              key={status}
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}
            >
              {status.toLowerCase()}: {count}
            </span>
          ))}
        </div>

        {/* Quotes Grid */}
        <div className="space-y-3">
          {quotes.length > 0 ? quotes.map((quote) => (
            <div key={quote.id} className="bg-white rounded-lg shadow p-4 md:p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex gap-4 items-start flex-1">
                  {/* Customer Avatar */}
                  <div className="w-8 h-8 md:w-12 md:h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm md:text-base font-medium">
                      {quote.customer.firstName[0]}{quote.customer.lastName[0]}
                    </span>
                  </div>
                  
                  {/* Quote Details */}
                  <div className="flex flex-col space-y-2 flex-1">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start gap-2">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm md:text-base font-bold text-gray-900">
                          {quote.customer.firstName} {quote.customer.lastName}
                        </p>
                        <p className="text-xs md:text-sm text-gray-600">
                          {quote.customer.email}
                        </p>
                        <p className="text-xs md:text-sm text-gray-600 sm:hidden">
                          {quote.customer.phone}
                        </p>
                        <p className="text-xs md:text-sm text-gray-600 hidden sm:block">
                          {quote.customer.email} • {quote.customer.phone}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(quote.status)}`}>
                        {quote.status.toLowerCase()}
                      </span>
                    </div>
                    
                    <p className="text-xs md:text-sm text-gray-600 line-clamp-2">
                      {quote.installationAddress}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 items-start sm:items-center">
                      <p className="text-xs md:text-sm text-gray-600">
                        Created: {new Date(quote.createdAt).toLocaleDateString()}
                      </p>
                      {quote.estimatedCost ? (
                        <p className="text-xs md:text-sm font-medium text-green-600">
                          Est: {formatCurrency(quote.estimatedCost)}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-row md:flex-row gap-2 items-center justify-start md:justify-center w-full">
                  <Link
                    href={`/quotes/${quote.id}`}
                    className="hidden md:flex items-center justify-center w-8 h-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/quotes/${quote.id}`}
                    className="flex-1 md:flex-none md:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          )) : (
            <div className="bg-white rounded-lg shadow p-6 md:p-8">
              <div className="flex flex-col items-center justify-center space-y-3 py-8">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 bg-gray-400 rounded"></div>
                </div>
                <p className="text-lg md:text-xl font-medium text-gray-900">No quotes found</p>
                <p className="text-sm md:text-base text-gray-600">Quotes will appear here when customers submit requests</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 