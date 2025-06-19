"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  Search, 
  Filter, 
  Plus, 
  ChevronDown,
  ChevronUp,
  Eye
} from "lucide-react";

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
  lifecycleStage: string;
  priority: string;
  customerType: string;
  totalQuotes: number;
  totalRentals: number;
  totalRevenue: number;
  lastContactDate: string | null;
  nextFollowUpDate: string | null;
  tags: string[];
  createdAt: string;
  quotes: Array<{
    id: string;
    status: string;
    createdAt: string;
  }>;
  _count: {
    quotes: number;
    rentals: number;
    communications: number;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface CustomersResponse {
  customers: Customer[];
  pagination: Pagination;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE': return 'bg-green-100 text-green-800';
    case 'INACTIVE': return 'bg-gray-100 text-gray-800';
    case 'BLOCKED': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getLifecycleColor = (stage: string) => {
  switch (stage) {
    case 'LEAD': return 'bg-blue-100 text-blue-800';
    case 'PROSPECT': return 'bg-yellow-100 text-yellow-800';
    case 'CUSTOMER': return 'bg-green-100 text-green-800';
    case 'FORMER_CUSTOMER': return 'bg-gray-100 text-gray-800';
    case 'ADVOCATE': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'LOW': return 'bg-gray-100 text-gray-800';
    case 'STANDARD': return 'bg-blue-100 text-blue-800';
    case 'HIGH': return 'bg-orange-100 text-orange-800';
    case 'URGENT': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Never';
  return new Date(dateString).toLocaleDateString();
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search and filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [lifecycleFilter, setLifecycleFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [tagsFilter, setTagsFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // UI state
  const [showFilters, setShowFilters] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy,
        sortOrder,
      });

      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (lifecycleFilter) params.append('lifecycleStage', lifecycleFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      if (tagsFilter) params.append('tags', tagsFilter);

      const response = await fetch(`/api/customers?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }

      const data: CustomersResponse = await response.json();
      setCustomers(data.customers);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, statusFilter, lifecycleFilter, priorityFilter, tagsFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setLifecycleFilter('');
    setPriorityFilter('');
    setTagsFilter('');
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) return <ChevronDown className="h-4 w-4 text-gray-400" />;
    return sortOrder === 'asc' ? 
      <ChevronUp className="h-4 w-4 text-blue-600" /> : 
      <ChevronDown className="h-4 w-4 text-blue-600" />;
  };

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">Error: {error}</p>
          <button 
            onClick={fetchCustomers}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col space-y-1">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900">Customers</h1>
            <p className="text-sm md:text-base text-gray-600">
              {pagination.total} total customers
            </p>
          </div>
          <Link
            href="/customers/new"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Customer</span>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search customers by name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              
              {(search || statusFilter || lifecycleFilter || priorityFilter || tagsFilter) && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Clear all filters
                </button>
              )}
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">All Statuses</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="BLOCKED">Blocked</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lifecycle Stage</label>
                  <select
                    value={lifecycleFilter}
                    onChange={(e) => setLifecycleFilter(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">All Stages</option>
                    <option value="LEAD">Lead</option>
                    <option value="PROSPECT">Prospect</option>
                    <option value="CUSTOMER">Customer</option>
                    <option value="FORMER_CUSTOMER">Former Customer</option>
                    <option value="ADVOCATE">Advocate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">All Priorities</option>
                    <option value="LOW">Low</option>
                    <option value="STANDARD">Standard</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                  <input
                    type="text"
                    placeholder="Enter tags (comma-separated)"
                    value={tagsFilter}
                    onChange={(e) => setTagsFilter(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading customers...</p>
            </div>
          ) : customers.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">No customers found</p>
              {search || statusFilter || lifecycleFilter || priorityFilter || tagsFilter ? (
                <button
                  onClick={clearFilters}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Clear filters
                </button>
              ) : (
                <Link
                  href="/customers/new"
                  className="mt-2 inline-flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add your first customer</span>
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('name')}
                          className="flex items-center space-x-1 hover:text-gray-700"
                        >
                          <span>Customer</span>
                          <SortIcon field="name" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('status')}
                          className="flex items-center space-x-1 hover:text-gray-700"
                        >
                          <span>Status</span>
                          <SortIcon field="status" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('lifecycleStage')}
                          className="flex items-center space-x-1 hover:text-gray-700"
                        >
                          <span>Stage</span>
                          <SortIcon field="lifecycleStage" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('totalRevenue')}
                          className="flex items-center space-x-1 hover:text-gray-700"
                        >
                          <span>Revenue</span>
                          <SortIcon field="totalRevenue" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('lastContactDate')}
                          className="flex items-center space-x-1 hover:text-gray-700"
                        >
                          <span>Last Contact</span>
                          <SortIcon field="lastContactDate" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <span>Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {customers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                                <span className="text-sm font-medium text-white">
                                  {customer.firstName[0]}{customer.lastName[0]}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {customer.firstName} {customer.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{customer.email}</div>
                              <div className="text-sm text-gray-500">{customer.phone}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                              {customer.status.toLowerCase()}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(customer.priority)}`}>
                              {customer.priority.toLowerCase()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLifecycleColor(customer.lifecycleStage)}`}>
                            {customer.lifecycleStage.toLowerCase().replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="space-y-1">
                            <div>{formatCurrency(customer.totalRevenue)}</div>
                            <div className="text-xs text-gray-500">
                              {customer._count.quotes} quotes • {customer._count.rentals} rentals
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(customer.lastContactDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            href={`/customers/${customer.id}`}
                            className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing{' '}
                        <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span>
                        {' '}to{' '}
                        <span className="font-medium">
                          {Math.min(pagination.page * pagination.limit, pagination.total)}
                        </span>
                        {' '}of{' '}
                        <span className="font-medium">{pagination.total}</span>
                        {' '}results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => handlePageChange(pagination.page - 1)}
                          disabled={pagination.page === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        
                        {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                          const page = i + 1;
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                page === pagination.page
                                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                        
                        <button
                          onClick={() => handlePageChange(pagination.page + 1)}
                          disabled={pagination.page === pagination.pages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 