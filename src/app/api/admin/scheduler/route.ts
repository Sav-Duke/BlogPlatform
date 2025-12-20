import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !['AUTHOR', 'EDITOR', 'ADMIN'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const isAdmin = session.user.role === 'ADMIN'
    const where = isAdmin ? {} : { authorId: session.user.id }

    const posts = await prisma.post.findMany({
      where: {
        ...where,
        status: 'SCHEDULED',
        publishedAt: {
          gte: new Date(),
        },
      },
      include: {
        author: {
          select: { name: true },
        },
      },
      orderBy: { publishedAt: 'asc' },
    })

    return NextResponse.json({
      posts: posts.map(post => ({
        ...post,
        scheduledFor: post.publishedAt,
      })),
    })
  } catch (error) {
    console.error('Scheduler GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scheduled posts' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !['AUTHOR', 'EDITOR', 'ADMIN'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { postId, scheduledFor } = body

    // Verify user has permission to schedule this post
    const post = await prisma.post.findUnique({
      where: { id: postId },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const isAdmin = session.user.role === 'ADMIN'
    if (!isAdmin && post.authorId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update post with schedule
    await prisma.post.update({
      where: { id: postId },
      data: {
        status: 'SCHEDULED',
        publishedAt: new Date(scheduledFor),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Scheduler POST error:', error)
    return NextResponse.json(
      { error: 'Failed to schedule post' },
      { status: 500 }
    )
  }
}
