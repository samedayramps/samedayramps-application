import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { sendAdminNotification } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, phone, installationAddress } = body;

    if (!firstName || !lastName || !email || !phone || !installationAddress) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    let customer = await db.customer.findUnique({
      where: { email },
    });

    if (!customer) {
      customer = await db.customer.create({
        data: {
          firstName,
          lastName,
          email,
          phone,
        },
      });
    }

    const quote = await db.quote.create({
      data: {
        customerId: customer.id,
        installationAddress,
      },
    });

    // Send internal notification email
    await sendAdminNotification({
      ...quote,
      customer
    });

    return NextResponse.json(quote, { status: 201 });
  } catch (error) {
    console.error('[QUOTES_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET() {
  try {
    const quotes = await db.quote.findMany({
      include: {
        customer: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(quotes);
  } catch (error) {
    console.error('[QUOTES_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 