import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET: List all tasks (admin) or assigned to user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const isAdmin = session.user.role === 'ADMIN'
    const where = isAdmin ? {} : { assignedToId: session.user.id }
    const tasks = await prisma.task.findMany({
      where,
      include: { assignedTo: { select: { name: true, email: true, id: true } }, post: true },
      orderBy: { deadline: 'asc' },
    })
    return NextResponse.json({ tasks })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

// POST: Create a new task
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'EDITOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const { title, description, topic, deadline, assignedToId } = await req.json()
    if (!title || !deadline || !assignedToId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const task = await prisma.task.create({
      data: { title, description, topic, deadline: new Date(deadline), assignedToId },
    })
    return NextResponse.json({ task })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}
