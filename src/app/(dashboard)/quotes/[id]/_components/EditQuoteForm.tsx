"use client";

import { useState } from "react";
import { Loader2, Edit, X } from "lucide-react";
import { Quote } from "@/types";
import AutocompleteInput from "@/components/ui/AutocompleteInput";

interface EditQuoteFormProps {
  quote: Quote;
  onUpdate: (updatedQuote: Quote) => void;
}

export default function EditQuoteForm({ quote, onUpdate }: EditQuoteFormProps) {
  const getInitialFormData = () => ({
    // Customer fields
    firstName: quote.customer.firstName,
    lastName: quote.customer.lastName,
    email: quote.customer.email,
    phone: quote.customer.phone,
    alternatePhone: quote.customer.alternatePhone || "",
    
    // Quote fields
    installationAddress: quote.installationAddress,
    adminNotes: quote.adminNotes || "",
  });

  const [formData, setFormData] = useState(getInitialFormData());
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleAddressChange = (address: string) => {
    setFormData({ ...formData, installationAddress: address });
  };

  const handleCancel = () => {
    setFormData(getInitialFormData());
    setIsEditing(false);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`/api/quotes/${quote.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update quote");
      }

      const updatedQuote = await res.json();
      onUpdate(updatedQuote);
      setIsEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg shadow p-4 md:p-6">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Customer & Quote Details</h3>
            {!isEditing && (
                 <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-x-1.5 rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                    <Edit className="-ml-0.5 h-5 w-5" />
                    Edit
                </button>
            )}
        </div>
        
        <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
          {/* Customer Fields */}
          <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" disabled={!isEditing} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50" />
          <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" disabled={!isEditing} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50" />
          <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" disabled={!isEditing} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50" />
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Primary Phone" disabled={!isEditing} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50" />
          <div className="sm:col-span-2">
            <input type="tel" name="alternatePhone" value={formData.alternatePhone} onChange={handleChange} placeholder="Alternate Phone (Optional)" disabled={!isEditing} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50" />
          </div>

          {/* Quote Fields */}
          <div className="sm:col-span-2">
            <AutocompleteInput
                value={formData.installationAddress}
                onChange={handleAddressChange}
                disabled={!isEditing}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
             />
          </div>
          <div className="sm:col-span-2">
            <textarea name="adminNotes" value={formData.adminNotes} onChange={handleChange} placeholder="Admin Notes (Internal Use Only)" rows={4} disabled={!isEditing} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50" />
          </div>
        </div>

        {isEditing && (
            <div className="mt-6 flex items-center justify-end gap-x-4">
                {error && <p className="text-sm text-red-600">{error}</p>}
                {success && <p className="text-sm text-green-600">Successfully updated!</p>}

                <button
                    type="button"
                    onClick={handleCancel}
                    className="inline-flex items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                    <X className="-ml-0.5 h-5 w-5" />
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save Changes"}
                </button>
            </div>
        )}
      </div>
    </form>
  );
} 