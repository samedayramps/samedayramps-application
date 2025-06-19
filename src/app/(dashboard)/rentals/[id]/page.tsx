import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import RentalDetailClient from "./_components/RentalDetailClient";

export default async function RentalDetailPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const rental = await db.rental.findUnique({
    where: { id },
    include: {
      customer: true,
      quote: true,
    },
  });

  if (!rental) {
    notFound();
  }

  const serializableRental = {
    ...rental,
    upfrontCost: rental.upfrontCost.toString(),
    monthlyRate: rental.monthlyRate.toString(),
    totalPaid: rental.totalPaid.toString(),
    customer: {
      ...rental.customer,
      totalRevenue: rental.customer.totalRevenue.toString(),
    },
    quote: rental.quote ? {
      ...rental.quote,
      upfrontCost: rental.quote.upfrontCost?.toString() ?? null,
      monthlyRate: rental.quote.monthlyRate?.toString() ?? null,
      totalEstimatedCost: rental.quote.totalEstimatedCost?.toString() ?? null,
      deliveryFee: rental.quote.deliveryFee?.toString() ?? null,
      installFee: rental.quote.installFee?.toString() ?? null,
      rampLength: rental.quote.rampLength?.toString() ?? null,
    } : null,
  };

  return <RentalDetailClient initialRental={serializableRental} />;
} 