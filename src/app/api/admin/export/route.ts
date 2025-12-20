import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'all'

    let data: any = {}

    if (type === 'posts' || type === 'all') {
      const posts = await prisma.post.findMany({
        include: {
          author: {
            select: { name: true, email: true },
          },
          categories: true,
          tags: true,
          comments: true,
        },
      })
      data.posts = posts
    }

    if (type === 'all') {
      const [users, categories, tags, settings] = await Promise.all([
        prisma.user.findMany({
          select: {
            name: true,
            email: true,
            role: true,
            bio: true,
            website: true,
          },
        }),
        prisma.category.findMany(),
        prisma.tag.findMany(),
        prisma.settings.findMany(),
      ])

      data.users = users
      data.categories = categories
      data.tags = tags
      data.settings = settings
    }

    data.exportDate = new Date().toISOString()
    data.version = '1.0.0'

    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="export-${type}-${Date.now()}.json"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    )
  }
}
