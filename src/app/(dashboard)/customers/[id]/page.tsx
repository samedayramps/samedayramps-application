import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import CustomerDetailTabs from "./CustomerDetailTabs";

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const customer = await db.customer.findUnique({
    where: { id },
    include: {
      quotes: true,
      // rentals: true, // Uncomment if rentals model exists
      communications: true,
      tasks: true,
    },
  });

  if (!customer) notFound();

  return (
    <div className="p-4 md:p-6">
      <div className="space-y-4 md:space-y-6">
        {/* Customer Header */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-bold">
                {customer.firstName[0]}{customer.lastName[0]}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{customer.firstName} {customer.lastName}</h1>
              <div className="text-sm text-gray-600">{customer.email} • {customer.phone}</div>
              <div className="flex gap-2 mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {customer.status.toLowerCase()}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {customer.lifecycleStage.toLowerCase().replace("_", " ")}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  {customer.priority.toLowerCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
          <CustomerDetailTabs customer={customer} />
        </Suspense>
      </div>
    </div>
  );
} 