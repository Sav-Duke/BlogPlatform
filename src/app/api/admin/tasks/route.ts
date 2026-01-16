import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { taskSchema } from '@/lib/validations'

// GET: List all tasks (admin) or assigned to user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    
    const isAdmin = ['ADMIN', 'EDITOR'].includes(session.user.role || '')
    const where: any = isAdmin ? {} : { assignedToId: session.user.id }

    // Filter by status
    if (status && ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(status)) {
      where.status = status
    }

    // Filter by priority
    if (priority && ['LOW', 'NORMAL', 'HIGH', 'URGENT'].includes(priority)) {
      where.priority = priority
    }

    const tasks = await prisma.task.findMany({
      where,
      include: { 
        assignedTo: { select: { name: true, email: true, id: true, image: true } }, 
        post: { select: { id: true, title: true, slug: true, status: true } },
        comments: {
          orderBy: { createdAt: 'desc' },
          take: 3,
          include: {
            author: { select: { name: true, image: true } }
          }
        },
        _count: { select: { comments: true } }
      },
      orderBy: { deadline: 'asc' },
    })
    return NextResponse.json({ tasks })
  } catch (error: any) {
    console.error('Task fetch error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch tasks' }, { status: 500 })
  }
}

// POST: Create a new task
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'EDITOR'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const json = await req.json()
    const body = taskSchema.parse(json)

    // Verify assigned user exists
    const assignedUser = await prisma.user.findUnique({
      where: { id: body.assignedToId },
    })

    if (!assignedUser) {
      return NextResponse.json({ error: 'Assigned user not found' }, { status: 404 })
    }

    const task = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description,
        topic: body.topic,
        deadline: new Date(body.deadline),
        assignedToId: body.assignedToId,
        status: body.status || 'OPEN',
        priority: body.priority || 'NORMAL',
        recurring: body.recurring || false,
        recurrence: body.recurrence,
        progress: body.progress || 0,
      },
      include: {
        assignedTo: { select: { name: true, email: true, id: true, image: true } },
      },
    })

    return NextResponse.json({ task }, { status: 201 })
  } catch (error: any) {
    console.error('Task creation error:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: error.message || 'Failed to create task' }, { status: 500 })
  }
}
