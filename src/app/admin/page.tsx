import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { 
  FileText, 
  Users, 
  MessageSquare, 
  Eye,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Zap,
  Calendar,
  Target,
  Award,
  Activity
} from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import DashboardWidget from '@/components/DashboardWidget'

async function getStats() {
  const session = await getServerSession(authOptions)
  const isAdmin = session?.user?.role === 'ADMIN'

  const where = isAdmin ? {} : { authorId: session?.user?.id }

  const [
    totalPosts,
    publishedPosts,
    draftPosts,
    totalComments,
    pendingComments,
    totalViews,
    totalUsers,
  ] = await Promise.all([
    prisma.post.count({ where }),
    prisma.post.count({ where: { ...where, status: 'PUBLISHED' } }),
    prisma.post.count({ where: { ...where, status: 'DRAFT' } }),
    isAdmin ? prisma.comment.count() : 0,
    isAdmin ? prisma.comment.count({ where: { approved: false } }) : 0,
    prisma.post.aggregate({
      where,
      _sum: { viewCount: true },
    }),
    isAdmin ? prisma.user.count() : 0,
  ])

  return {
    totalPosts,
    publishedPosts,
    draftPosts,
    totalComments,
    pendingComments,
    totalViews: totalViews._sum.viewCount || 0,
    totalUsers,
  }
}

async function getRecentPosts(userId?: string, isAdmin?: boolean) {
  return await prisma.post.findMany({
    where: isAdmin ? {} : { authorId: userId },
    include: {
      author: {
        select: { name: true, image: true },
      },
      _count: {
        select: { comments: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  const isAdmin = session?.user?.role === 'ADMIN'
  
  const stats = await getStats()
  const recentPosts = await getRecentPosts(session?.user?.id, isAdmin)

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {session?.user?.name}! 👋</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here's what's happening with your blog today
        </p>
      </div>

      {/* Quick Actions Bar */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-6 mb-8 text-white">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/admin/posts/new" className="flex items-center gap-3 p-4 bg-white/10 rounded-lg hover:bg-white/20 transition backdrop-blur">
            <div className="p-2 bg-white/20 rounded">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold">New Post</div>
              <div className="text-sm text-white/80">Create content</div>
            </div>
          </Link>
          <Link href="/admin/media" className="flex items-center gap-3 p-4 bg-white/10 rounded-lg hover:bg-white/20 transition backdrop-blur">
            <div className="p-2 bg-white/20 rounded">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold">Media</div>
              <div className="text-sm text-white/80">Upload files</div>
            </div>
          </Link>
          <Link href="/admin/analytics" className="flex items-center gap-3 p-4 bg-white/10 rounded-lg hover:bg-white/20 transition backdrop-blur">
            <div className="p-2 bg-white/20 rounded">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold">Analytics</div>
              <div className="text-sm text-white/80">View insights</div>
            </div>
          </Link>
          <Link href="/admin/seo" className="flex items-center gap-3 p-4 bg-white/10 rounded-lg hover:bg-white/20 transition backdrop-blur">
            <div className="p-2 bg-white/20 rounded">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold">SEO Tools</div>
              <div className="text-sm text-white/80">Optimize content</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardWidget
          title="Total Posts"
          value={stats.totalPosts}
          change={12}
          trend="up"
          iconName="FileText"
          color="blue"
        >
          <div className="flex justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400">Published: {stats.publishedPosts}</span>
            <span className="text-gray-600 dark:text-gray-400">Drafts: {stats.draftPosts}</span>
          </div>
        </DashboardWidget>

        <DashboardWidget
          title="Total Views"
          value={stats.totalViews.toLocaleString()}
          change={24}
          trend="up"
          iconName="Eye"
          color="green"
        >
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Avg: {Math.round(stats.totalViews / (stats.publishedPosts || 1))} per post
          </div>
        </DashboardWidget>

        {isAdmin && (
          <>
            <DashboardWidget
              title="Comments"
              value={stats.totalComments}
              iconName="MessageSquare"
              color="purple"
            >
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {stats.pendingComments} pending approval
              </div>
            </DashboardWidget>

            <DashboardWidget
              title="Total Users"
              value={stats.totalUsers}
              change={8}
              trend="up"
              iconName="Users"
              color="orange"
            >
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Active community
              </div>
            </DashboardWidget>
          </>
        )}
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-green-600" />
            <h3 className="font-bold">SEO Score</h3>
          </div>
          <div className="text-3xl font-bold text-green-600 mb-2">85/100</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Excellent optimization
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-green-600 rounded-full" style={{ width: '85%' }} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-blue-600" />
            <h3 className="font-bold">Engagement Rate</h3>
          </div>
          <div className="text-3xl font-bold text-blue-600 mb-2">4.2%</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Above average
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full" style={{ width: '42%' }} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="h-5 w-5 text-purple-600" />
            <h3 className="font-bold">Content Quality</h3>
          </div>
          <div className="text-3xl font-bold text-purple-600 mb-2">A+</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Top tier content
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-purple-600 rounded-full" style={{ width: '92%' }} />
          </div>
        </div>
      </div>

      {/* Recent Activity & Content Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Posts */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Recent Posts</h2>
            <Link href="/admin/posts" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View all →
            </Link>
          </div>
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <Link
                key={post.id}
                href={`/admin/posts/${post.slug}`}
                className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-semibold mb-1 truncate">{post.title}</div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      post.status === 'PUBLISHED'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {post.status}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {post.viewCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {post._count.comments}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {formatDate(post.createdAt)}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Insights */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-primary-600" />
            <h2 className="text-xl font-bold">Quick Insights</h2>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-sm mb-1">Great Engagement!</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Your posts are getting 24% more views this week
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-start gap-3">
                <BarChart3 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-sm mb-1">Top Performing</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Your most viewed post has 2.5K views this month
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-sm mb-1">Posting Consistency</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    You've published {stats.publishedPosts} posts. Keep it up!
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-sm mb-1">SEO Opportunity</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    3 posts need meta descriptions updated
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Items */}
      {isAdmin && stats.pendingComments > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-semibold mb-1">Action Required</div>
              <div className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                You have {stats.pendingComments} comments waiting for approval
              </div>
              <Link
                href="/admin/comments"
                className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition text-sm font-medium"
              >
                Review Comments →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
