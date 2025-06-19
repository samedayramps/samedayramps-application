"use server";

import { revalidatePath } from "next/cache";

export async function updateQuoteStatus(id: string, status: string) {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/quotes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        status: status as "PENDING" | "REVIEWING" | "QUOTED" | "ACCEPTED" | "DECLINED" | "EXPIRED" | "CONVERTED" 
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update quote status');
    }

    const updatedQuote = await response.json();

    revalidatePath(`/quotes/${id}`);
    revalidatePath(`/quotes`);

    return updatedQuote;
  } catch (error) {
    console.error("Error updating quote status:", error);
    throw new Error("Failed to update quote status");
  }
} 