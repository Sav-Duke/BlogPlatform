import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET: Get task comments
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
      select: { id: true, assignedToId: true },
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Check permissions
    const isAdmin = ['ADMIN', 'EDITOR'].includes(session.user.role || '')
    if (!isAdmin && task.assignedToId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const comments = await prisma.taskComment.findMany({
      where: { 
        taskId: params.id,
        parentId: null,
      },
      include: {
        author: { select: { name: true, image: true, id: true } },
        replies: {
          include: {
            author: { select: { name: true, image: true, id: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ comments })
  } catch (error: any) {
    console.error('Task comments fetch error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch comments' }, { status: 500 })
  }
}

// POST: Add a task comment
export async function POST(
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
      select: { id: true, assignedToId: true },
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Check permissions
    const isAdmin = ['ADMIN', 'EDITOR'].includes(session.user.role || '')
    if (!isAdmin && task.assignedToId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { content, parentId } = await req.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 })
    }

    if (content.length > 2000) {
      return NextResponse.json({ error: 'Comment is too long (max 2000 characters)' }, { status: 400 })
    }

    // Verify parent comment exists if provided
    if (parentId) {
      const parentComment = await prisma.taskComment.findFirst({
        where: { id: parentId, taskId: params.id },
      })

      if (!parentComment) {
        return NextResponse.json({ error: 'Parent comment not found' }, { status: 404 })
      }
    }

    const comment = await prisma.taskComment.create({
      data: {
        content: content.trim(),
        taskId: params.id,
        authorId: session.user.id,
        parentId: parentId || null,
      },
      include: {
        author: { select: { name: true, image: true, id: true } },
      },
    })

    return NextResponse.json({ comment }, { status: 201 })
  } catch (error: any) {
    console.error('Task comment creation error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create comment' }, { status: 500 })
  }
}
