import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import QuoteDetailClient from "./_components/QuoteDetailClient";

export default async function QuoteDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const quote = await db.quote.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
    },
  });

  if (!quote) {
    notFound();
  }

  return <QuoteDetailClient initialQuote={quote} />;
} 