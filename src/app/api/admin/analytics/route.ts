import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !['ADMIN', 'EDITOR'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const range = searchParams.get('range') || '30days'

    // Calculate date ranges
    const now = new Date()
    let startDate: Date
    let previousStartDate: Date

    switch (range) {
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        previousStartDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
        break
      case '90days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        previousStartDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        previousStartDate = new Date(now.getFullYear() - 1, 0, 1)
        break
      default: // 30days
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        previousStartDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
    }

    // Get current period stats
    const [currentViews, previousViews, publishedPosts, totalComments] = await Promise.all([
      prisma.post.aggregate({
        where: { createdAt: { gte: startDate } },
        _sum: { viewCount: true },
      }),
      prisma.post.aggregate({
        where: { 
          createdAt: { gte: previousStartDate, lt: startDate }
        },
        _sum: { viewCount: true },
      }),
      prisma.post.findMany({
        where: { 
          status: 'PUBLISHED',
          publishedAt: { gte: startDate }
        },
        select: {
          id: true,
          title: true,
          viewCount: true,
          slug: true,
        },
        orderBy: { viewCount: 'desc' },
        take: 10,
      }),
      prisma.comment.count({
        where: { createdAt: { gte: startDate } }
      }),
    ])

    const totalViews = currentViews._sum.viewCount || 0
    const prevViews = previousViews._sum.viewCount || 0
    const viewsGrowth = prevViews > 0 ? ((totalViews - prevViews) / prevViews) * 100 : 100

    // Generate trend data (daily views for the period)
    const days = range === '7days' ? 7 : range === '90days' ? 90 : range === 'year' ? 365 : 30
    const viewsTrend = Array.from({ length: Math.min(days, 30) }, (_, i) => {
      const date = new Date(now.getTime() - (days - i - 1) * 24 * 60 * 60 * 1000)
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        views: Math.floor(Math.random() * 1000) + 100, // Mock data - replace with real analytics
      }
    })

    // Top content
    const topContent = publishedPosts.slice(0, 5).map(post => ({
      title: post.title.length > 20 ? post.title.substring(0, 20) + '...' : post.title,
      views: post.viewCount,
    }))

    // Mock data for traffic sources (integrate with real analytics service)
    const trafficSources = [
      { name: 'Direct', value: 45 },
      { name: 'Search', value: 30 },
      { name: 'Social', value: 15 },
      { name: 'Referral', value: 10 },
    ]

    // Device breakdown (mock data)
    const deviceBreakdown = [
      { device: 'Desktop', percentage: 55 },
      { device: 'Mobile', percentage: 35 },
      { device: 'Tablet', percentage: 10 },
    ]

    // Top locations (mock data)
    const topLocations = [
      { country: 'United States', flag: '🇺🇸', percentage: 45 },
      { country: 'United Kingdom', flag: '🇬🇧', percentage: 20 },
      { country: 'Canada', flag: '🇨🇦', percentage: 15 },
      { country: 'Australia', flag: '🇦🇺', percentage: 12 },
      { country: 'Germany', flag: '🇩🇪', percentage: 8 },
    ]

    // Calculate unique visitors (simplified - based on post views)
    const uniqueVisitors = Math.floor(totalViews * 0.6)
    const prevUniqueVisitors = Math.floor(prevViews * 0.6)
    const visitorsGrowth = prevUniqueVisitors > 0 
      ? ((uniqueVisitors - prevUniqueVisitors) / prevUniqueVisitors) * 100 
      : 100

    // Engagement metrics
    const engagementRate = totalViews > 0 ? ((totalComments / totalViews) * 100).toFixed(1) : 0
    const prevComments = await prisma.comment.count({
      where: { 
        createdAt: { gte: previousStartDate, lt: startDate }
      }
    })
    const prevEngagementRate = prevViews > 0 ? ((prevComments / prevViews) * 100) : 0
    const engagementGrowth = prevEngagementRate > 0 
      ? ((Number(engagementRate) - prevEngagementRate) / prevEngagementRate) * 100 
      : 100

    return NextResponse.json({
      totalViews,
      viewsGrowth,
      uniqueVisitors,
      visitorsGrowth,
      avgSessionDuration: '3m 24s',
      durationGrowth: 12.5,
      engagementRate,
      engagementGrowth,
      viewsTrend,
      topContent,
      trafficSources,
      deviceBreakdown,
      topLocations,
      activeUsers: Math.floor(Math.random() * 50) + 5,
      recentPages: [
        { path: '/blog/latest-post', viewers: 12 },
        { path: '/blog/popular-article', viewers: 8 },
        { path: '/about', viewers: 5 },
      ],
      metrics: {
        bounceRate: 42,
        pagesPerSession: 2.8,
        avgTimeOnPage: '2m 15s',
        conversionRate: 3.2,
      },
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
