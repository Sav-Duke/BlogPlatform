import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { commentSchema } from '@/lib/validations'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !['EDITOR', 'ADMIN'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const approved = searchParams.get('approved')
    const postId = searchParams.get('postId')

    const where: any = {}

    if (approved !== null) {
      where.approved = approved === 'true'
    }

    if (postId) {
      where.postId = postId
    }

    const comments = await prisma.comment.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        post: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(comments)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const json = await req.json()
    // Accept name for anonymous comments
    const { name, ...rest } = json
    const body = commentSchema.parse(rest)

    let authorId = session?.user?.id ?? null;
    let anonymousName = null;
    if (!authorId) {
      // Anonymous comment: require a name
      if (!name || typeof name !== 'string' || name.trim().length < 2) {
        return NextResponse.json({ error: 'Name is required for anonymous comments' }, { status: 400 })
      }
      anonymousName = name.trim();
    }

    const comment = await prisma.comment.create({
      data: {
        content: body.content,
        postId: body.postId,
        authorId: authorId,
        parentId: body.parentId,
        approved: false, // Requires moderation
        anonymousName: anonymousName,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    // Attach anonymous name to response if needed
    if (!authorId && anonymousName) {
      comment.author = { id: '', name: anonymousName, image: null };
    }

    return NextResponse.json(comment, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}
