import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { tagSchema } from '@/lib/validations'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !['EDITOR', 'ADMIN'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if tag exists
    const existing = await prisma.tag.findUnique({
      where: { id: params.id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 })
    }

    const json = await req.json()
    const body = tagSchema.partial().parse(json)

    // Check if new slug conflicts with another tag
    if (body.slug && body.slug !== existing.slug) {
      const slugConflict = await prisma.tag.findUnique({
        where: { slug: body.slug },
      })

      if (slugConflict) {
        return NextResponse.json(
          { error: 'A tag with this slug already exists' },
          { status: 409 }
        )
      }
    }

    const tag = await prisma.tag.update({
      where: { id: params.id },
      data: body,
      include: {
        _count: {
          select: { posts: true },
        },
      },
    })

    return NextResponse.json(tag)
  } catch (error: any) {
    console.error('Tag update error:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: error.message || 'Failed to update tag' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !['EDITOR', 'ADMIN'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if tag exists
    const tag = await prisma.tag.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    })

    if (!tag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 })
    }

    // Tags can be deleted even with posts (many-to-many relationship)
    await prisma.tag.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ 
      message: 'Tag deleted successfully',
      postsAffected: tag._count.posts 
    })
  } catch (error: any) {
    console.error('Tag deletion error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete tag' },
      { status: 500 }
    )
  }
}
