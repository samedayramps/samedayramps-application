import { NextResponse } from 'next/server';
import { sendAdminNotification, sendQuoteEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const { type } = await req.json();
    
    const testQuote = {
      id: 'test-quote-123',
      installationAddress: '123 Test Street, Test City, TX 12345',
      urgency: 'URGENT',
      customerNotes: 'This is a test quote for email functionality',
      estimatedHeight: 36,
      estimatedLength: 20,
      installationFee: 150,
      monthlyRate: 200,
      estimatedCost: 1500,
      customer: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        phone: '(555) 123-4567',
      },
    };

    if (type === 'admin') {
      await sendAdminNotification(testQuote);
      return NextResponse.json({ message: 'Admin notification sent successfully' });
    } else if (type === 'quote') {
      await sendQuoteEmail(testQuote);
      return NextResponse.json({ message: 'Quote email sent successfully' });
    } else {
      return NextResponse.json({ error: 'Invalid email type' }, { status: 400 });
    }
  } catch (error) {
    console.error('[TEST_EMAIL]', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
} 