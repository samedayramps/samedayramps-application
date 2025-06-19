import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();

    const {
      firstName,
      lastName,
      email,
      phone,
      alternatePhone,
      installationAddress,
      adminNotes,
    } = body;

    const currentQuote = await db.quote.findUnique({ where: { id } });
    if (!currentQuote) {
      return new NextResponse(JSON.stringify({ message: "Quote not found" }), { status: 404 });
    }

    const transactionResult = await db.$transaction([
      db.customer.update({
        where: { id: currentQuote.customerId },
        data: {
          firstName,
          lastName,
          email,
          phone,
          alternatePhone,
        },
      }),
      db.quote.update({
        where: { id },
        data: {
          installationAddress,
          adminNotes,
        },
        include: {
          customer: true,
        },
      }),
    ]);

    const updatedQuote = transactionResult[1];

    return NextResponse.json(updatedQuote);
  } catch (error) {
    console.error('[QUOTE_PUT]', error);
    if (error instanceof Error) {
      return new NextResponse(JSON.stringify({ message: error.message }), { status: 500 });
    }
    return new NextResponse(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { action, ...fields } = body;

    const quote = await db.quote.findUnique({ where: { id }, include: { customer: true } });
    if (!quote) return new NextResponse('Quote not found', { status: 404 });

    let updatedQuote;

    if (action === 'revertStage') {
      switch (quote.status) {
        case 'INFORMATION_GATHERING':
          updatedQuote = await db.quote.update({ where: { id }, data: { status: 'PENDING', informationGathered: false }, include: { customer: true } });
          break;
        case 'QUOTED':
          updatedQuote = await db.quote.update({ where: { id }, data: { status: 'INFORMATION_GATHERING', priceProvided: false, priceProvidedDate: null }, include: { customer: true } });
          break;
        case 'ACCEPTED':
          updatedQuote = await db.quote.update({ where: { id }, data: { status: 'QUOTED', customerAccepted: false, acceptedDate: null }, include: { customer: true } });
          break;
        case 'CONVERTED':
           // Note: Reverting from CONVERTED is a complex operation.
           // This requires deleting the associated rental, which could have financial implications.
           // For now, we will just revert the status. A more robust implementation
           // would involve checks or a multi-step process.
          await db.rental.deleteMany({ where: { quoteId: id } });
          updatedQuote = await db.quote.update({ where: { id }, data: { status: 'ACCEPTED' }, include: { customer: true } });
          break;
        default:
          return new NextResponse('Cannot revert from current status', { status: 400 });
      }
    } else {
      switch (action) {
        case 'markInfoGathered':
          updatedQuote = await db.quote.update({
            where: { id },
            data: {
              status: 'INFORMATION_GATHERING',
              informationGathered: true,
            },
            include: { customer: true },
          });
          break;
        case 'providePrice':
          updatedQuote = await db.quote.update({
            where: { id },
            data: {
              status: 'QUOTED',
              priceProvided: true,
              priceProvidedDate: new Date(),
              upfrontCost: fields.upfrontCost,
              monthlyRate: fields.monthlyRate,
              totalEstimatedCost: fields.totalEstimatedCost,
              rampLength: fields.rampLength,
              deliveryFee: fields.deliveryFee,
              installFee: fields.installFee,
            },
            include: { customer: true },
          });
          break;
        case 'acceptQuote':
          updatedQuote = await db.quote.update({
            where: { id },
            data: {
              status: 'ACCEPTED',
              customerAccepted: true,
              acceptedDate: new Date(),
            },
            include: { customer: true },
          });
          break;
        case 'convertToRental':
          // Mark quote as converted
          updatedQuote = await db.quote.update({
            where: { id },
            data: {
              status: 'CONVERTED',
            },
            include: { customer: true },
          });
          // Create rental
          await db.rental.create({
            data: {
              customerId: quote.customerId,
              quoteId: quote.id,
              startDate: new Date(),
              upfrontCost: quote.upfrontCost ?? 0,
              monthlyRate: quote.monthlyRate ?? 0,
            },
          });
          break;
        default:
          return new NextResponse('Invalid action', { status: 400 });
      }
    }

    return NextResponse.json(updatedQuote);
  } catch (error) {
    console.error('[QUOTE_PATCH]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 