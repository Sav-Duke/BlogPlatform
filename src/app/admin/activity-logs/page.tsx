'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { Activity, User, FileText, Tag, MessageSquare, Settings, Filter, Search, Calendar } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

interface ActivityLog {
  id: string
  action: string
  entity: string
  entityId: string | null
  description: string
  metadata: string | null
  ipAddress: string | null
  createdAt: Date
  user: {
    name: string | null
    email: string
  }
}

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState({
    entity: 'all',
    action: 'all',
    search: '',
  })

  useEffect(() => {
    loadLogs()
  }, [filter])

  const loadLogs = async () => {
    try {
      const params: any = {}
      if (filter.entity !== 'all') params.entity = filter.entity
      if (filter.action !== 'all') params.action = filter.action
      if (filter.search) params.search = filter.search

      const { data } = await axios.get('/api/admin/activity-logs', { params })
      setLogs(data.logs)
    } catch (error) {
      toast.error('Failed to load activity logs')
    } finally {
      setIsLoading(false)
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'DELETE':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'PUBLISH':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      case 'LOGIN':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getEntityIcon = (entity: string) => {
    switch (entity) {
      case 'POST':
        return <FileText className="h-4 w-4" />
      case 'CATEGORY':
      case 'TAG':
        return <Tag className="h-4 w-4" />
      case 'COMMENT':
        return <MessageSquare className="h-4 w-4" />
      case 'USER':
        return <User className="h-4 w-4" />
      case 'SETTING':
        return <Settings className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Activity Logs</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track all admin actions and system events
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              <Filter className="h-4 w-4 inline mr-1" />
              Entity Type
            </label>
            <select
              value={filter.entity}
              onChange={(e) => setFilter({ ...filter, entity: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-800"
            >
              <option value="all">All Entities</option>
              <option value="POST">Posts</option>
              <option value="CATEGORY">Categories</option>
              <option value="TAG">Tags</option>
              <option value="COMMENT">Comments</option>
              <option value="USER">Users</option>
              <option value="SETTING">Settings</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <Activity className="h-4 w-4 inline mr-1" />
              Action Type
            </label>
            <select
              value={filter.action}
              onChange={(e) => setFilter({ ...filter, action: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-800"
            >
              <option value="all">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="PUBLISH">Publish</option>
              <option value="UNPUBLISH">Unpublish</option>
              <option value="LOGIN">Login</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <Search className="h-4 w-4 inline mr-1" />
              Search
            </label>
            <input
              type="text"
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              placeholder="Search logs..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-800"
            />
          </div>
        </div>
      </div>

      {/* Logs List */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
        {logs.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No activity logs found
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      {getEntityIcon(log.entity)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                      <span className="text-xs text-gray-500">
                        {log.entity}
                      </span>
                    </div>
                    <p className="text-sm font-medium mb-1">
                      {log.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {log.user.name || log.user.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(log.createdAt)}
                      </span>
                      {log.ipAddress && log.ipAddress !== 'unknown' && (
                        <span>IP: {log.ipAddress}</span>
                      )}
                    </div>
                    {log.metadata && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                          View metadata
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-x-auto">
                          {JSON.stringify(JSON.parse(log.metadata), null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
