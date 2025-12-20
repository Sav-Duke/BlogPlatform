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

    const [
      totalPosts,
      publishedPosts,
      draftPosts,
      totalUsers,
      totalComments,
      pendingComments,
      totalViews,
    ] = await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { status: 'PUBLISHED' } }),
      prisma.post.count({ where: { status: 'DRAFT' } }),
      prisma.user.count(),
      prisma.comment.count(),
      prisma.comment.count({ where: { approved: false } }),
      prisma.post.aggregate({
        _sum: { viewCount: true },
      }),
    ])

    // Get date ranges for growth calculations
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    // Calculate growth metrics
    const postsLastMonth = await prisma.post.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    })
    const postsPreviousMonth = await prisma.post.count({
      where: {
        createdAt: {
          gte: sixtyDaysAgo,
          lt: thirtyDaysAgo,
        },
      },
    })
    const postsGrowth = postsPreviousMonth > 0 
      ? ((postsLastMonth - postsPreviousMonth) / postsPreviousMonth) * 100 
      : postsLastMonth > 0 ? 100 : 0

    const usersLastMonth = await prisma.user.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    })
    const usersPreviousMonth = await prisma.user.count({
      where: {
        createdAt: {
          gte: sixtyDaysAgo,
          lt: thirtyDaysAgo,
        },
      },
    })
    const usersGrowth = usersPreviousMonth > 0 
      ? ((usersLastMonth - usersPreviousMonth) / usersPreviousMonth) * 100 
      : usersLastMonth > 0 ? 100 : 0

    const commentsLastMonth = await prisma.comment.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    })
    const commentsPreviousMonth = await prisma.comment.count({
      where: {
        createdAt: {
          gte: sixtyDaysAgo,
          lt: thirtyDaysAgo,
        },
      },
    })
    const commentsGrowth = commentsPreviousMonth > 0 
      ? ((commentsLastMonth - commentsPreviousMonth) / commentsPreviousMonth) * 100 
      : commentsLastMonth > 0 ? 100 : 0

    const viewsGrowth = postsGrowth // Simplified - using posts growth as proxy

    // Get recent posts
    const recentPosts = await prisma.post.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { name: true, image: true },
        },
        _count: {
          select: { comments: true },
        },
      },
    })

    // Get popular posts
    const popularPosts = await prisma.post.findMany({
      where: { status: 'PUBLISHED' },
      take: 5,
      orderBy: { viewCount: 'desc' },
      include: {
        author: {
          select: { name: true },
        },
      },
    })

    // Get post statistics by month (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const postsByMonth = await prisma.post.groupBy({
      by: ['publishedAt'],
      where: {
        publishedAt: {
          gte: sixMonthsAgo,
        },
      },
      _count: true,
    })

    return NextResponse.json({
      stats: {
        totalPosts,
        publishedPosts,
        draftPosts,
        totalUsers,
        totalComments,
        pendingComments,
        totalViews: totalViews._sum.viewCount || 0,
        postsGrowth: Math.round(postsGrowth * 10) / 10,
        viewsGrowth: Math.round(viewsGrowth * 10) / 10,
        usersGrowth: Math.round(usersGrowth * 10) / 10,
        commentsGrowth: Math.round(commentsGrowth * 10) / 10,
      },
      recentPosts,
      popularPosts,
      postsByMonth,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}
