import { Resend } from 'resend';
import { Decimal } from '@prisma/client/runtime/library';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

interface QuoteWithCustomer {
  id: string;
  installationAddress: string;
  urgency?: string;
  customerNotes?: string | null;
  estimatedHeight?: number | null;
  estimatedLength?: number | null;
  installationFee?: Decimal | number | null;
  monthlyRate?: Decimal | number | null;
  estimatedCost?: Decimal | number | null;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

function formatDecimal(value: Decimal | number | null | undefined): string {
  if (!value) return '';
  return typeof value === 'number' ? value.toString() : value.toString();
}

export async function sendAdminNotification(quote: QuoteWithCustomer) {
  if (!process.env.RESEND_API_KEY || !resend) {
    console.log('Email service not configured - skipping notification');
    return;
  }

  const urgencyEmoji = quote.urgency === 'URGENT' ? '🚨 ' : '';
  
  try {
    await resend.emails.send({
      from: 'admin@samedayramps.com',
      to: 'ty@samedayramps.com',
      subject: `${urgencyEmoji}New Quote Request #${quote.id.slice(-8)}`,
      text: `
New quote request received:

Customer: ${quote.customer.firstName} ${quote.customer.lastName}
Email: ${quote.customer.email}
Phone: ${quote.customer.phone}
Address: ${quote.installationAddress}
Urgency: ${quote.urgency}

${quote.customerNotes ? `Notes: ${quote.customerNotes}` : ''}

View in admin: ${process.env.NEXTAUTH_URL}/quotes/${quote.id}
      `,
    });
  } catch (error) {
    console.error('Failed to send admin notification:', error);
  }
}

export async function sendQuoteEmail(quote: QuoteWithCustomer) {
  if (!process.env.RESEND_API_KEY || !resend) {
    console.log('Email service not configured - skipping quote email');
    return;
  }

  try {
    await resend.emails.send({
      from: 'quotes@samedayramps.com',
      to: quote.customer.email,
      subject: 'Your Wheelchair Ramp Quote from Same Day Ramps',
      text: `
Hi ${quote.customer.firstName},

Thank you for your interest in Same Day Ramps! We've prepared a custom quote for your wheelchair ramp rental.

Installation Address: ${quote.installationAddress}
${quote.estimatedHeight ? `Estimated Height: ${quote.estimatedHeight} inches` : ''}
${quote.estimatedLength ? `Estimated Length: ${quote.estimatedLength} feet` : ''}

PRICING:
${quote.installationFee ? `Installation Fee: $${formatDecimal(quote.installationFee)}` : ''}
${quote.monthlyRate ? `Monthly Rental: $${formatDecimal(quote.monthlyRate)}/month` : ''}
${quote.estimatedCost ? `Total Estimated Cost: $${formatDecimal(quote.estimatedCost)}` : ''}

This quote is valid for 30 days. We can typically install your ramp within 24-48 hours of acceptance.

To accept this quote or if you have any questions, please call us at (940) 536-9626 or reply to this email.

Best regards,
Same Day Ramps Team
      `,
    });
  } catch (error) {
    console.error('Failed to send quote email:', error);
  }
} 