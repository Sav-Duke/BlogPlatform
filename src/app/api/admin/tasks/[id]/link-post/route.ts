import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PATCH: Link a post to a task (for auto-posting)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { postId } = await req.json()
    if (!postId) {
      return NextResponse.json({ error: 'Missing postId' }, { status: 400 })
    }
    // Only allow linking if user owns the task or is admin/editor
    const task = await prisma.task.findUnique({ where: { id: params.id }, include: { assignedTo: true } })
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    const isAdminOrEditor = ['ADMIN', 'EDITOR'].includes(session.user.role)
    if (!isAdminOrEditor && task.assignedToId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    // Link post to task
    await prisma.post.update({ where: { id: postId }, data: { scheduledTaskId: params.id, status: 'SCHEDULED', publishedAt: task.deadline } })
    await prisma.task.update({ where: { id: params.id }, data: { post: { connect: { id: postId } } } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to link post to task' }, { status: 500 })
  }
}
