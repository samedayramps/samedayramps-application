import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import RentalDetailClient from "./_components/RentalDetailClient";

export default async function RentalDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const rental = await db.rental.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      quote: true,
    },
  });

  if (!rental) {
    notFound();
  }

  return <RentalDetailClient initialRental={rental} />;
} 