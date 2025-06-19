import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { sendQuoteEmail } from '@/lib/email';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const quote = await db.quote.findUnique({
      where: { id },
      include: {
        customer: true,
      },
    });

    if (!quote) {
      return new NextResponse('Quote not found', { status: 404 });
    }

    return NextResponse.json(quote);
  } catch (error) {
    console.error('[QUOTE_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    // Get the current quote to check status change
    const currentQuote = await db.quote.findUnique({
      where: { id },
      include: {
        customer: true,
      },
    });

    if (!currentQuote) {
      return new NextResponse('Quote not found', { status: 404 });
    }

    // Update the quote
    const updatedQuote = await db.quote.update({
      where: { id },
      data: body,
      include: {
        customer: true,
      },
    });

    // Send quote email if status changed to QUOTED
    if (body.status === 'QUOTED' && currentQuote.status !== 'QUOTED') {
      await sendQuoteEmail(updatedQuote);
    }

    return NextResponse.json(updatedQuote);
  } catch (error) {
    console.error('[QUOTE_PUT]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 