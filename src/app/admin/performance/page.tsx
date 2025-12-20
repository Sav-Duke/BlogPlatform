'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { Activity, Zap, Database, HardDrive, TrendingUp, AlertTriangle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function PerformancePage() {
  const [metrics, setMetrics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadMetrics()
    const interval = setInterval(loadMetrics, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const loadMetrics = async () => {
    try {
      const { data } = await axios.get('/api/admin/performance')
      setMetrics(data)
    } catch (error) {
      console.error('Failed to load performance metrics')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="p-8">Loading performance metrics...</div>
  }

  const getStatusColor = (value: number, threshold: number) => {
    if (value < threshold * 0.7) return 'text-green-600'
    if (value < threshold * 0.9) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Performance Monitor</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Real-time system performance and optimization insights
        </p>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <Zap className="h-8 w-8 text-blue-600" />
            <div>
              <div className={`text-3xl font-bold ${getStatusColor(metrics.responseTime, 1000)}`}>
                {metrics.responseTime}ms
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Response Time</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <Activity className="h-8 w-8 text-green-600" />
            <div>
              <div className="text-3xl font-bold text-green-600">{metrics.uptime}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Uptime</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <Database className="h-8 w-8 text-purple-600" />
            <div>
              <div className={`text-3xl font-bold ${getStatusColor(metrics.dbQueryTime, 500)}`}>
                {metrics.dbQueryTime}ms
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">DB Query Time</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <HardDrive className="h-8 w-8 text-yellow-600" />
            <div>
              <div className="text-3xl font-bold">{metrics.cacheHitRate}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Cache Hit Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Trend */}
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800 mb-8">
        <h3 className="text-lg font-bold mb-4">Response Time Trend (Last Hour)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={metrics.responseTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="responseTime" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Database Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-bold mb-4">Database Statistics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Queries</span>
              <span className="font-bold">{metrics.dbStats.totalQueries.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Slow Queries</span>
              <span className="font-bold text-yellow-600">{metrics.dbStats.slowQueries}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Database Size</span>
              <span className="font-bold">{metrics.dbStats.size}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Connection Pool</span>
              <span className="font-bold">{metrics.dbStats.connections}/100</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-bold mb-4">Cache Performance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Cache Hits</span>
              <span className="font-bold text-green-600">{metrics.cacheStats.hits.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Cache Misses</span>
              <span className="font-bold text-red-600">{metrics.cacheStats.misses.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Cache Size</span>
              <span className="font-bold">{metrics.cacheStats.size}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Evictions</span>
              <span className="font-bold">{metrics.cacheStats.evictions}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Optimization Recommendations */}
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Optimization Recommendations
        </h3>
        <div className="space-y-3">
          {metrics.recommendations.map((rec: any, index: number) => (
            <div key={index} className={`flex items-start gap-3 p-3 rounded-lg ${
              rec.priority === 'high' 
                ? 'bg-red-50 dark:bg-red-900/20' 
                : rec.priority === 'medium'
                ? 'bg-yellow-50 dark:bg-yellow-900/20'
                : 'bg-blue-50 dark:bg-blue-900/20'
            }`}>
              <AlertTriangle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                rec.priority === 'high' 
                  ? 'text-red-600' 
                  : rec.priority === 'medium'
                  ? 'text-yellow-600'
                  : 'text-blue-600'
              }`} />
              <div className="flex-1">
                <div className="font-medium mb-1">{rec.title}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{rec.description}</div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                rec.priority === 'high' 
                  ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' 
                  : rec.priority === 'medium'
                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
              }`}>
                {rec.priority}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
