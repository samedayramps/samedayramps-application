import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const customerSearchSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED']).optional(),
  lifecycleStage: z.enum(['LEAD', 'PROSPECT', 'CUSTOMER', 'FORMER_CUSTOMER', 'ADVOCATE']).optional(),
  priority: z.enum(['LOW', 'STANDARD', 'HIGH', 'URGENT']).optional(),
  tags: z.string().optional(), // Comma-separated
  page: z.string().transform(val => parseInt(val) || 1),
  limit: z.string().transform(val => Math.min(parseInt(val) || 20, 100)),
  sortBy: z.enum(['name', 'email', 'createdAt', 'lastContactDate', 'totalRevenue']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams.entries());
    const validated = customerSearchSchema.parse(params);

    // Build where clause
    const where: Record<string, unknown> = {};
    
    if (validated.search) {
      where.OR = [
        { firstName: { contains: validated.search, mode: 'insensitive' } },
        { lastName: { contains: validated.search, mode: 'insensitive' } },
        { email: { contains: validated.search, mode: 'insensitive' } },
        { phone: { contains: validated.search } },
      ];
    }

    if (validated.status) where.status = validated.status;
    if (validated.lifecycleStage) where.lifecycleStage = validated.lifecycleStage;
    if (validated.priority) where.priority = validated.priority;
    
    if (validated.tags) {
      const tagArray = validated.tags.split(',').map(tag => tag.trim());
      where.tags = { hasEvery: tagArray };
    }

    // Build order by
    const orderBy: Record<string, unknown> = {};
    if (validated.sortBy === 'name') {
      orderBy.firstName = validated.sortOrder || 'asc';
    } else if (validated.sortBy) {
      orderBy[validated.sortBy] = validated.sortOrder || 'desc';
    } else {
      orderBy.updatedAt = 'desc';
    }

    const skip = (validated.page - 1) * validated.limit;

    const [customers, total] = await Promise.all([
      db.customer.findMany({
        where,
        include: {
          quotes: {
            select: { id: true, status: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
            take: 1
          },
          _count: {
            select: {
              quotes: true,
              rentals: true,
              communications: true
            }
          }
        },
        orderBy,
        skip,
        take: validated.limit,
      }),
      db.customer.count({ where })
    ]);

    return NextResponse.json({
      customers,
      pagination: {
        page: validated.page,
        limit: validated.limit,
        total,
        pages: Math.ceil(total / validated.limit)
      }
    });

  } catch (error) {
    console.error('Customer fetch error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid parameters',
        details: error.errors 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Failed to fetch customers' 
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const customerSchema = z.object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      email: z.string().email(),
      phone: z.string().min(10),
      alternatePhone: z.string().optional(),
      preferredContact: z.enum(['EMAIL', 'PHONE', 'TEXT', 'IN_PERSON']).optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      customerType: z.enum(['INDIVIDUAL', 'FAMILY', 'HEALTHCARE_FACILITY', 'CONTRACTOR', 'PROPERTY_MANAGER']).optional(),
      referralSource: z.string().optional(),
      priority: z.enum(['LOW', 'STANDARD', 'HIGH', 'URGENT']).optional(),
      notes: z.string().optional(),
      tags: z.array(z.string()).optional(),
    });

    const validatedData = customerSchema.parse(body);

    const customer = await db.customer.create({
      data: validatedData,
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

    return NextResponse.json(customer, { status: 201 });

  } catch (error) {
    console.error('Customer creation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation failed',
        details: error.errors 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Failed to create customer' 
    }, { status: 500 });
  }
} 