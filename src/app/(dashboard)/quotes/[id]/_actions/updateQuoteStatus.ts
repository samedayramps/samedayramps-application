"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateQuoteStatus(id: string, status: string) {
  try {
    const updatedQuote = await db.quote.update({
      where: { id },
      data: { status: status as any },
    });

    // Simulate sending an email notification
    console.log(`Quote ${id} status updated to ${status}`);

    revalidatePath(`/quotes/${id}`);
    revalidatePath(`/quotes`);

    return updatedQuote;
  } catch (error) {
    console.error("Error updating quote status:", error);
    throw new Error("Failed to update quote status");
  }
} 