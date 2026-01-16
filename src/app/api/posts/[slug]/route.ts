import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { postSchema } from '@/lib/validations'
import { calculateReadTime } from '@/lib/utils'

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Validate slug format
    if (!params.slug || params.slug.length > 200) {
      return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
    }

    const post = await prisma.post.findUnique({
      where: { slug: params.slug },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            bio: true,
            website: true,
            twitter: true,
          },
        },
        categories: true,
        tags: true,
        comments: {
          where: { approved: true, parentId: null },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            replies: {
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Increment view count
    await prisma.post.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    })

    return NextResponse.json(post)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const post = await prisma.post.findUnique({
      where: { slug: params.slug },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    if (
      post.authorId !== session.user.id &&
      !['EDITOR', 'ADMIN'].includes(session.user.role || '')
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const json = await req.json()
    const body = postSchema.parse(json)

    const readTime = calculateReadTime(body.content)

    // Ensure seoKeywords is a string
    const seoKeywords = Array.isArray(body.seoKeywords) 
      ? body.seoKeywords.join(', ') 
      : (body.seoKeywords || '')

    const updatedPost = await prisma.post.update({
      where: { slug: params.slug },
      data: {
        title: body.title,
        slug: body.slug,
        excerpt: body.excerpt,
        content: body.content,
        coverImage: body.coverImage,
        status: body.status,
        featured: body.featured,
        readTime,
        publishedAt:
          body.status === 'PUBLISHED' && !post.publishedAt
            ? new Date()
            : post.publishedAt,
        seoTitle: body.seoTitle,
        seoDescription: body.seoDescription,
        seoKeywords: seoKeywords,
        categories: {
          set: [],
          connect: body.categoryIds.map((id) => ({ id })),
        },
        tags: {
          set: [],
          connect: body.tagIds?.map((id) => ({ id })) || [],
        },
      },
      include: {
        author: true,
        categories: true,
        tags: true,
      },
    })

    return NextResponse.json(updatedPost)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const post = await prisma.post.findUnique({
      where: { slug: params.slug },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    if (
      post.authorId !== session.user.id &&
      session.user.role !== 'ADMIN'
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.post.delete({
      where: { slug: params.slug },
    })

    return NextResponse.json({ message: 'Post deleted successfully' })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}
