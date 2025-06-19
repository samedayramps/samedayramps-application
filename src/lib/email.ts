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

  const urgencyPrefix = quote.urgency === 'URGENT' ? 'URGENT - ' : '';
  
  try {
    await resend.emails.send({
      from: 'admin@samedayramps.com',
      to: 'ty@samedayramps.com',
      subject: `${urgencyPrefix}New Quote Request - ID: ${quote.id.slice(-8)}`,
      text: `
SAME DAY RAMPS - NEW QUOTE REQUEST

Quote ID: ${quote.id}
${quote.urgency ? `Priority: ${quote.urgency}` : ''}

CUSTOMER INFORMATION:
Name: ${quote.customer.firstName} ${quote.customer.lastName}
Email: ${quote.customer.email}
Phone: ${quote.customer.phone}

PROJECT DETAILS:
Installation Address: ${quote.installationAddress}
${quote.estimatedHeight ? `Estimated Height: ${quote.estimatedHeight} inches` : ''}
${quote.estimatedLength ? `Estimated Length: ${quote.estimatedLength} feet` : ''}

${quote.customerNotes ? `CUSTOMER NOTES:\n${quote.customerNotes}` : ''}

ADMIN ACTIONS:
View Quote: ${process.env.NEXTAUTH_URL}/quotes/${quote.id}
All Quotes: ${process.env.NEXTAUTH_URL}/quotes

This is an automated notification from Same Day Ramps admin system.
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
      subject: 'Your Wheelchair Ramp Rental Quote - Same Day Ramps',
      text: `
Dear ${quote.customer.firstName} ${quote.customer.lastName},

Thank you for requesting a wheelchair ramp rental quote from Same Day Ramps. We have prepared a customized quote based on your requirements.

PROJECT DETAILS:
Installation Address: ${quote.installationAddress}
${quote.estimatedHeight ? `Estimated Ramp Height: ${quote.estimatedHeight} inches` : ''}
${quote.estimatedLength ? `Estimated Ramp Length: ${quote.estimatedLength} feet` : ''}

QUOTE INFORMATION:
${quote.installationFee ? `Installation Fee: $${formatDecimal(quote.installationFee)}` : ''}
${quote.monthlyRate ? `Monthly Rental Rate: $${formatDecimal(quote.monthlyRate)} per month` : ''}
${quote.estimatedCost ? `Total Estimated Cost: $${formatDecimal(quote.estimatedCost)}` : ''}

IMPORTANT INFORMATION:
- This quote is valid for 30 days from the date of this email
- Installation typically completed within 24-48 hours of acceptance
- All installations include safety inspection and customer training
- Monthly rental includes maintenance and support

NEXT STEPS:
To accept this quote or discuss any questions, please contact us:
Phone: (940) 536-9626
Email: quotes@samedayramps.com

We appreciate your business and look forward to serving your accessibility needs.

Sincerely,
Same Day Ramps Team

---
Same Day Ramps
Professional Wheelchair Ramp Rentals
Phone: (940) 536-9626
Email: info@samedayramps.com
      `,
    });
  } catch (error) {
    console.error('Failed to send quote email:', error);
  }
} 