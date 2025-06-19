import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const communicationSchema = z.object({
  type: z.enum(['QUOTE_REQUEST', 'QUOTE_FOLLOWUP', 'INSTALLATION_SCHEDULING', 'PAYMENT_DISCUSSION', 'SUPPORT_REQUEST', 'GENERAL_INQUIRY', 'FEEDBACK']),
  direction: z.enum(['INBOUND', 'OUTBOUND']),
  subject: z.string().optional(),
  content: z.string().min(1),
  contactMethod: z.enum(['EMAIL', 'PHONE', 'TEXT', 'IN_PERSON']),
  phoneNumber: z.string().optional(),
  emailAddress: z.string().email().optional(),
  isImportant: z.boolean().optional(),
  followUpDate: z.string().datetime().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const skip = (page - 1) * limit;

    const [communications, total] = await Promise.all([
      db.communication.findMany({
        where: { customerId: id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.communication.count({
        where: { customerId: id }
      })
    ]);

    return NextResponse.json({
      communications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Communication fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch communications' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    const validatedData = communicationSchema.parse(body);

    // Prepare data for database
    const communication = await db.communication.create({
      data: {
        customerId: id,
        type: validatedData.type,
        direction: validatedData.direction,
        subject: validatedData.subject,
        content: validatedData.content,
        contactMethod: validatedData.contactMethod,
        phoneNumber: validatedData.phoneNumber,
        emailAddress: validatedData.emailAddress,
        isImportant: validatedData.isImportant || false,
        followUpDate: validatedData.followUpDate ? new Date(validatedData.followUpDate) : null,
        createdBy: 'admin', // TODO: Get from session
      },
    });

    // Update customer's last contact date
    await db.customer.update({
      where: { id },
      data: { lastContactDate: new Date() }
    });

    return NextResponse.json(communication, { status: 201 });

  } catch (error) {
    console.error('Communication creation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation failed',
        details: error.errors 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Failed to create communication' 
    }, { status: 500 });
  }
} 