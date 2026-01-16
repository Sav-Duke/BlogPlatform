import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { postSchema } from '@/lib/validations'
import { calculateReadTime, slugify } from '@/lib/utils'
import { generateUniqueSlug } from '@/lib/db-helpers'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')))
    const status = searchParams.get('status')
    const categorySlug = searchParams.get('category')
    const tagSlug = searchParams.get('tag')
    const authorId = searchParams.get('authorId')
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')?.trim()

    // Special case: fetch all drafts for a user (for task linking)
    if (searchParams.get('allDraftsForUser') === 'true' && authorId) {
      const drafts = await prisma.post.findMany({
        where: { authorId, status: 'DRAFT' },
        select: { id: true, title: true, slug: true },
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json({ posts: drafts })
    }

    const where: any = {}

    if (status) {
      where.status = status
    } else {
      where.status = 'PUBLISHED'
    }

    if (categorySlug) {
      where.categories = {
        some: { slug: categorySlug },
      }
    }

    if (tagSlug) {
      where.tags = {
        some: { slug: tagSlug },
      }
    }

    if (authorId) {
      where.authorId = authorId
    }

    if (featured === 'true') {
      where.featured = true
    }

    if (search && search.length > 0) {
      // Sanitize search input
      const sanitizedSearch = search.replace(/[%_]/g, '\\$&')
      where.OR = [
        { title: { contains: sanitizedSearch, mode: 'insensitive' } },
        { excerpt: { contains: sanitizedSearch, mode: 'insensitive' } },
        { content: { contains: sanitizedSearch, mode: 'insensitive' } },
      ]
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
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
          categories: true,
          tags: true,
          _count: {
            select: { comments: true },
          },
        },
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.post.count({ where }),
    ])

    return NextResponse.json({
      posts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
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

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['AUTHOR', 'EDITOR', 'ADMIN'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const json = await req.json()
    const body = postSchema.parse(json)

    // Authors can only create PENDING posts
    let status = body.status
    let publishedAt = null
    if (session.user.role === 'AUTHOR') {
      status = 'PENDING'
    } else if (status === 'PUBLISHED') {
      publishedAt = new Date()
    }

    const readTime = calculateReadTime(body.content)

    // Ensure seoKeywords is a string
    const seoKeywords = Array.isArray(body.seoKeywords) 
      ? body.seoKeywords.join(', ') 
      : (body.seoKeywords || '')

    // Generate unique slug (fallback to title when slug not provided)
    const baseSlug = slugify(body.slug || body.title)
    const uniqueSlug = await generateUniqueSlug(prisma.post, baseSlug)

    const post = await prisma.post.create({
      data: {
        title: body.title,
        slug: uniqueSlug,
        excerpt: body.excerpt,
        content: body.content,
        coverImage: body.coverImage,
        status,
        featured: body.featured,
        readTime,
        authorId: session.user.id,
        publishedAt,
        seoTitle: body.seoTitle,
        seoDescription: body.seoDescription,
        seoKeywords: seoKeywords,
        categories: {
          connect: body.categoryIds.map((id) => ({ id })),
        },
        tags: {
          connect: body.tagIds?.map((id) => ({ id })) || [],
        },
      },
      include: {
        author: true,
        categories: true,
        tags: true,
      },
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}
