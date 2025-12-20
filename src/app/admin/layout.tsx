'use client'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { 
  LayoutDashboard, 
  FileText, 
  FolderOpen, 
  Tag, 
  MessageSquare, 
  Settings,
  Users,
  Activity,
  Image,
  Calendar,
  BarChart2,
  Shield,
  Command,
  Search,
  Palette
} from 'lucide-react'
import CommandPalette from '@/components/CommandPalette'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Move navigation array inside the component to ensure all icon references are in client context
  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart2 },
    { name: 'Posts', href: '/admin/posts', icon: FileText },
    { name: 'Scheduler', href: '/admin/scheduler', icon: Calendar },
    { name: 'Categories', href: '/admin/categories', icon: FolderOpen },
    { name: 'Tags', href: '/admin/tags', icon: Tag },
    { name: 'Media', href: '/admin/media', icon: Image },
    { name: 'Comments', href: '/admin/comments', icon: MessageSquare },
    { name: 'SEO Tools', href: '/admin/seo', icon: Shield },
    { name: 'Performance', href: '/admin/performance', icon: Activity },
    { name: 'Export/Import', href: '/admin/export-import', icon: Command },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Activity Logs', href: '/admin/activity-logs', icon: Activity },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
    // Custom feature links
    { name: 'AI Content Assistant', href: '/admin/posts/new#ai-content-assistant', icon: Command },
    { name: 'Theme Selector', href: '/admin/posts/new#theme-selector', icon: Palette },
    { name: 'Content Blocks', href: '/admin/posts/new#content-blocks', icon: FolderOpen },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <CommandPalette 
        isOpen={commandPaletteOpen} 
        onClose={() => setCommandPaletteOpen(false)} 
      />

      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-50">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <Link href="/admin" className="flex items-center space-x-2">
              <LayoutDashboard className="h-6 w-6 text-primary-600" />
              <span className="font-bold text-xl">Admin Panel</span>
            </Link>
          </div>

          {/* Quick Search */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition text-sm text-gray-600 dark:text-gray-400"
            >
              <Search className="h-4 w-4" />
              <span>Quick Search...</span>
              <kbd className="ml-auto px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded">⌘K</kbd>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              View Site
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-64">
        <main className="p-8">{children}</main>
      </div>
    </div>
  )
}
