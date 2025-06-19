import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import QuoteDetailClient from "./_components/QuoteDetailClient";

export default async function QuoteDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  const quote = await db.quote.findUnique({
    where: { id },
    include: {
      customer: true,
    },
  });

  if (!quote) {
    notFound();
  }

  const serializableQuote = {
    ...quote,
    upfrontCost: quote.upfrontCost?.toString() ?? null,
    monthlyRate: quote.monthlyRate?.toString() ?? null,
    totalEstimatedCost: quote.totalEstimatedCost?.toString() ?? null,
    deliveryFee: quote.deliveryFee?.toString() ?? null,
    installFee: quote.installFee?.toString() ?? null,
    rampLength: quote.rampLength?.toString() ?? null,
    customer: {
      ...quote.customer,
      totalRevenue: quote.customer.totalRevenue.toString(),
    }
  };

  return <QuoteDetailClient initialQuote={serializableQuote} />;
} 