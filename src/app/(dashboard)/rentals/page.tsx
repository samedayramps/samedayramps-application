import { db } from "@/lib/db";
import RentalsTable from "./_components/RentalsTable";

export default async function RentalsPage() {
  const rentals = await db.rental.findMany({
    include: {
      customer: true,
      quote: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="p-4 md:p-6">
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col space-y-1">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900">Rentals</h1>
            <p className="text-sm md:text-base text-gray-600">{rentals.length} total rentals</p>
          </div>
        </div>
        <RentalsTable initialData={rentals} />
      </div>
    </div>
  );
} 