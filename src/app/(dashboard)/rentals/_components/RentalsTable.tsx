"use client";

import { useState } from "react";
import Link from "next/link";
import { Rental } from "@/types";
import { Eye, Search, ChevronsUpDown, ChevronDown, ChevronUp } from "lucide-react";
import { Decimal } from "@prisma/client/runtime/library";

type SortKey = keyof Rental | 'customer.firstName';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING': return 'bg-gray-100 text-gray-800';
    case 'AGREEMENT_SENT': return 'bg-purple-100 text-purple-800';
    case 'AGREEMENT_SIGNED': return 'bg-indigo-100 text-indigo-800';
    case 'INSTALLATION_SCHEDULED': return 'bg-blue-100 text-blue-800';
    case 'ACTIVE': return 'bg-green-100 text-green-800';
    case 'REMOVAL_SCHEDULED': return 'bg-orange-100 text-orange-800';
    case 'COMPLETED': return 'bg-gray-100 text-gray-800';
    case 'ON_HOLD': return 'bg-yellow-100 text-yellow-800';
    case 'CANCELLED': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const formatCurrency = (amount: number | Decimal | null | undefined) => {
  if (amount === null || amount === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(amount));
};

export default function RentalsTable({ initialData }: { initialData: Rental[] }) {
  const [rentals] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(null);

  const handleSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const sortedRentals = [...rentals]
    .filter(rental => 
      rental.customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rental.customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rental.status.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (!sortConfig) return 0;
      
      const getSortValue = (rental: Rental, key: SortKey) => {
        if (key === 'customer.firstName') return rental.customer.firstName;
        return rental[key as keyof Rental];
      }

      const aValue = getSortValue(a, sortConfig.key);
      const bValue = getSortValue(b, sortConfig.key);

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

  const SortableHeader = ({ label, sortKey }: { label: string; sortKey: SortKey }) => (
    <th onClick={() => handleSort(sortKey)} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
      <div className="flex items-center">
        {label}
        {sortConfig?.key === sortKey ? (
          sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
        ) : (
          <ChevronsUpDown className="h-4 w-4 ml-1 text-gray-400" />
        )}
      </div>
    </th>
  );

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search rentals..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <SortableHeader label="Customer" sortKey="customer.firstName" />
              <SortableHeader label="Status" sortKey="status" />
              <SortableHeader label="Start Date" sortKey="startDate" />
              <SortableHeader label="Monthly Rate" sortKey="monthlyRate" />
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedRentals.map(rental => (
              <tr key={rental.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{rental.customer.firstName} {rental.customer.lastName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                   <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(rental.status)}`}>
                        {rental.status.replace(/_/g, ' ')}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(rental.startDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(rental.monthlyRate)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link href={`/rentals/${rental.id}`} className="text-blue-600 hover:text-blue-900 flex items-center gap-1">
                    <Eye className="h-4 w-4"/>
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 