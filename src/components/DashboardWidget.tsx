'use client'


import { FileText, Eye, MessageSquare, Users, BarChart3, TrendingUp, Clock, CheckCircle, AlertCircle, Zap, Calendar, Target, Award, Activity } from 'lucide-react'
import { ReactNode } from 'react'

const iconMap = {
  FileText,
  Eye,
  MessageSquare,
  Users,
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
  Calendar,
  Target,
  Award,
  Activity,
}

interface DashboardWidgetProps {
  title: string
  value: string | number
  change?: number
  iconName: keyof typeof iconMap
  trend?: 'up' | 'down'
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
  children?: ReactNode
}

export default function DashboardWidget({
  title,
  value,
  change,
  iconName,
  trend,
  color = 'blue',
  children
}: DashboardWidgetProps) {
  const Icon = iconMap[iconName]
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500'
  }

  const lightColorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600'
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${lightColorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {Math.abs(change)}%
          </div>
        )}
      </div>
      <div>
        <div className="text-2xl font-bold mb-1">{value}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">{title}</div>
      </div>
      {children && <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">{children}</div>}
    </div>
  )
}
