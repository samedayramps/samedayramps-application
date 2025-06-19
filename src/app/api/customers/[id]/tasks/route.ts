import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'STANDARD', 'HIGH', 'URGENT']).optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  dueDate: z.string().datetime().optional(),
  assignedTo: z.string().optional(),
  quoteId: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { customerId: id };
    if (status) {
      where.status = status;
    }

    const [tasks, total] = await Promise.all([
      db.task.findMany({
        where,
        orderBy: { dueDate: 'asc' },
        skip,
        take: limit,
        include: {
          quote: {
            select: { id: true, installationAddress: true }
          }
        }
      }),
      db.task.count({ where })
    ]);

    return NextResponse.json({
      tasks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Task fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    const validatedData = taskSchema.parse(body);

    const task = await db.task.create({
      data: {
        customerId: id,
        title: validatedData.title,
        description: validatedData.description,
        priority: validatedData.priority || 'STANDARD',
        status: validatedData.status || 'PENDING',
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        assignedTo: validatedData.assignedTo,
        quoteId: validatedData.quoteId,
        createdBy: 'admin', // TODO: Get from session
      },
      include: {
        quote: {
          select: { id: true, installationAddress: true }
        }
      }
    });

    return NextResponse.json(task, { status: 201 });

  } catch (error) {
    console.error('Task creation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation failed',
        details: error.errors 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Failed to create task' 
    }, { status: 500 });
  }
} 