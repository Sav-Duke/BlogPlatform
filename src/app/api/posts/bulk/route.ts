import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { postIds, action } = await req.json()

    if (!postIds || !Array.isArray(postIds) || postIds.length === 0) {
      return NextResponse.json({ error: 'No posts selected' }, { status: 400 })
    }

    switch (action) {
      case 'publish':
        await prisma.post.updateMany({
          where: { id: { in: postIds } },
          data: { 
            status: 'PUBLISHED',
            publishedAt: new Date()
          },
        })
        break

      case 'unpublish':
        await prisma.post.updateMany({
          where: { id: { in: postIds } },
          data: { status: 'DRAFT' },
        })
        break

      case 'delete':
        await prisma.post.deleteMany({
          where: { id: { in: postIds } },
        })
        break

      case 'feature':
        await prisma.post.updateMany({
          where: { id: { in: postIds } },
          data: { featured: true },
        })
        break

      case 'unfeature':
        await prisma.post.updateMany({
          where: { id: { in: postIds } },
          data: { featured: false },
        })
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ message: `Bulk ${action} completed successfully` })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to perform bulk action' },
      { status: 500 }
    )
  }
}
