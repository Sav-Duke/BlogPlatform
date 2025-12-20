'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { 
  TrendingUp, TrendingDown, Users, Eye, MessageSquare, Clock,
  Globe, Monitor, Smartphone, MapPin, Calendar, Download, Filter
} from 'lucide-react'
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer 
} from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [dateRange, setDateRange] = useState('30days')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [dateRange])

  const loadAnalytics = async () => {
    try {
      const { data } = await axios.get(`/api/admin/analytics?range=${dateRange}`)
      setAnalytics(data)
    } catch (error) {
      console.error('Failed to load analytics')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="p-8">Loading analytics...</div>
  }

  const stats = [
    {
      title: 'Total Views',
      value: analytics?.totalViews?.toLocaleString() || '0',
      change: analytics?.viewsGrowth || 0,
      icon: Eye,
      color: 'bg-blue-500',
    },
    {
      title: 'Unique Visitors',
      value: analytics?.uniqueVisitors?.toLocaleString() || '0',
      change: analytics?.visitorsGrowth || 0,
      icon: Users,
      color: 'bg-green-500',
    },
    {
      title: 'Avg. Session Duration',
      value: analytics?.avgSessionDuration || '0m',
      change: analytics?.durationGrowth || 0,
      icon: Clock,
      color: 'bg-yellow-500',
    },
    {
      title: 'Engagement Rate',
      value: `${analytics?.engagementRate || 0}%`,
      change: analytics?.engagementGrowth || 0,
      icon: MessageSquare,
      color: 'bg-purple-500',
    },
  ]

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive insights and metrics
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="year">This Year</option>
          </select>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <span className={`text-sm font-medium flex items-center gap-1 ${
                stat.change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {Math.abs(stat.change).toFixed(1)}%
              </span>
            </div>
            <p className="text-2xl font-bold mb-1">{stat.value}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Page Views Over Time */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-bold mb-4">Page Views Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics?.viewsTrend || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="views" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top Content */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-bold mb-4">Top Performing Content</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics?.topContent || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="title" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="views" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Traffic Sources */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-bold mb-4">Traffic Sources</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics?.trafficSources || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {(analytics?.trafficSources || []).map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Device Breakdown */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-bold mb-4">Devices</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics?.deviceBreakdown || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="device" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="percentage" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Geographic Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Top Locations
          </h3>
          <div className="space-y-3">
            {(analytics?.topLocations || []).map((location: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{location.flag}</span>
                  <span className="font-medium">{location.country}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full" 
                      style={{ width: `${location.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-12 text-right">{location.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Activity */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Real-time Activity
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <span className="font-medium">Active Users</span>
              <span className="text-2xl font-bold text-green-600">{analytics?.activeUsers || 0}</span>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Recent Pages</h4>
              {(analytics?.recentPages || []).map((page: any, index: number) => (
                <div key={index} className="flex items-center justify-between text-sm p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                  <span className="truncate">{page.path}</span>
                  <span className="text-gray-500">{page.viewers} viewing</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800 mb-8">
        <h3 className="text-lg font-bold mb-4">Engagement Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">
              {analytics?.metrics?.bounceRate || 0}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Bounce Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {analytics?.metrics?.pagesPerSession || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Pages/Session</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {analytics?.metrics?.avgTimeOnPage || '0m'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg. Time on Page</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {analytics?.metrics?.conversionRate || 0}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</div>
          </div>
        </div>
      </div>
    </div>
  )
}
