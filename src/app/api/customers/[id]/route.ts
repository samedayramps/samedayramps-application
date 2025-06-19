import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const customer = await db.customer.findUnique({
      where: { id },
      include: {
        quotes: {
          orderBy: { createdAt: 'desc' }
        },
        rentals: {
          orderBy: { createdAt: 'desc' }
        },
        communications: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        tasks: {
          where: { status: { not: 'COMPLETED' } },
          orderBy: { dueDate: 'asc' }
        },
        _count: {
          select: {
            quotes: true,
            rentals: true,
            communications: true,
            tasks: true
          }
        }
      }
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error('Customer fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    const updateSchema = z.object({
      firstName: z.string().min(1).optional(),
      lastName: z.string().min(1).optional(),
      email: z.string().email().optional(),
      phone: z.string().min(10).optional(),
      alternatePhone: z.string().optional(),
      preferredContact: z.enum(['EMAIL', 'PHONE', 'TEXT', 'IN_PERSON']).optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      customerType: z.enum(['INDIVIDUAL', 'FAMILY', 'HEALTHCARE_FACILITY', 'CONTRACTOR', 'PROPERTY_MANAGER']).optional(),
      status: z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED']).optional(),
      lifecycleStage: z.enum(['LEAD', 'PROSPECT', 'CUSTOMER', 'FORMER_CUSTOMER', 'ADVOCATE']).optional(),
      priority: z.enum(['LOW', 'STANDARD', 'HIGH', 'URGENT']).optional(),
      referralSource: z.string().optional(),
      notes: z.string().optional(),
      tags: z.array(z.string()).optional(),
      nextFollowUpDate: z.string().datetime().optional(),
    });

    const validatedData = updateSchema.parse(body);

    // Prepare data for database update
    const updateData: Record<string, unknown> = { ...validatedData };
    
    // Convert datetime string to Date object
    if (validatedData.nextFollowUpDate) {
      updateData.nextFollowUpDate = new Date(validatedData.nextFollowUpDate);
    }

    const customer = await db.customer.update({
      where: { id },
      data: {
        ...updateData,
        lastContactDate: new Date(),
      },
      include: {
        _count: {
          select: {
            quotes: true,
            rentals: true,
            communications: true
          }
        }
      }
    });

    return NextResponse.json(customer);
  } catch (error) {
    console.error('Customer update error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation failed',
        details: error.errors 
      }, { status: 400 });
    }

    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
  }
} 