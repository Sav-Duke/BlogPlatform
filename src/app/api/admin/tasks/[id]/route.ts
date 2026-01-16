import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { taskSchema } from '@/lib/validations'

// GET: Get a single task
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        assignedTo: { select: { name: true, email: true, id: true, image: true } },
        post: { select: { id: true, title: true, slug: true, status: true } },
        comments: {
          orderBy: { createdAt: 'desc' },
          include: {
            author: { select: { name: true, image: true } },
            replies: {
              include: {
                author: { select: { name: true, image: true } }
              }
            }
          }
        },
      },
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Check permissions
    const isAdmin = ['ADMIN', 'EDITOR'].includes(session.user.role || '')
    if (!isAdmin && task.assignedToId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ task })
  } catch (error: any) {
    console.error('Task fetch error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch task' }, { status: 500 })
  }
}

// PUT: Update a task
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const task = await prisma.task.findUnique({
      where: { id: params.id },
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const isAdmin = ['ADMIN', 'EDITOR'].includes(session.user.role || '')
    const isAssignee = task.assignedToId === session.user.id

    // Assignees can only update status and progress
    if (!isAdmin && !isAssignee) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const json = await req.json()

    // Partial update for assignees (status and progress only)
    if (!isAdmin && isAssignee) {
      const updates: any = {}
      if (json.status && ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(json.status)) {
        updates.status = json.status
      }
      if (typeof json.progress === 'number' && json.progress >= 0 && json.progress <= 100) {
        updates.progress = json.progress
      }

      const updatedTask = await prisma.task.update({
        where: { id: params.id },
        data: updates,
        include: {
          assignedTo: { select: { name: true, email: true, id: true, image: true } },
          post: { select: { id: true, title: true, slug: true, status: true } },
        },
      })

      return NextResponse.json({ task: updatedTask })
    }

    // Full update for admins/editors
    const body = taskSchema.partial().parse(json)

    // Verify assigned user exists if being changed
    if (body.assignedToId) {
      const assignedUser = await prisma.user.findUnique({
        where: { id: body.assignedToId },
      })

      if (!assignedUser) {
        return NextResponse.json({ error: 'Assigned user not found' }, { status: 404 })
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.topic !== undefined && { topic: body.topic }),
        ...(body.deadline && { deadline: new Date(body.deadline) }),
        ...(body.assignedToId && { assignedToId: body.assignedToId }),
        ...(body.status && { status: body.status }),
        ...(body.priority && { priority: body.priority }),
        ...(body.recurring !== undefined && { recurring: body.recurring }),
        ...(body.recurrence !== undefined && { recurrence: body.recurrence }),
        ...(body.progress !== undefined && { progress: body.progress }),
      },
      include: {
        assignedTo: { select: { name: true, email: true, id: true, image: true } },
        post: { select: { id: true, title: true, slug: true, status: true } },
      },
    })

    return NextResponse.json({ task: updatedTask })
  } catch (error: any) {
    console.error('Task update error:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: error.message || 'Failed to update task' }, { status: 500 })
  }
}

// DELETE: Delete a task
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'EDITOR'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const task = await prisma.task.findUnique({
      where: { id: params.id },
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    await prisma.task.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Task deleted successfully' })
  } catch (error: any) {
    console.error('Task deletion error:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete task' }, { status: 500 })
  }
}
