'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Command, Search, FileText, Plus, Settings, Users, 
  Tag, FolderOpen, Image, Calendar, BarChart2, Shield
} from 'lucide-react'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}


export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [search, setSearch] = useState('')
  const router = useRouter()

  // Move commands array inside the component to ensure all icon references are in client context
  const commands = [
    { icon: Plus, label: 'Create New Post', action: () => router.push('/admin/posts/new'), category: 'Create' },
    { icon: FileText, label: 'View All Posts', action: () => router.push('/admin/posts'), category: 'Navigate' },
    { icon: FolderOpen, label: 'Manage Categories', action: () => router.push('/admin/categories'), category: 'Navigate' },
    { icon: Tag, label: 'Manage Tags', action: () => router.push('/admin/tags'), category: 'Navigate' },
    { icon: Image, label: 'Media Library', action: () => router.push('/admin/media'), category: 'Navigate' },
    { icon: Users, label: 'Manage Users', action: () => router.push('/admin/users'), category: 'Navigate' },
    { icon: Calendar, label: 'Content Scheduler', action: () => router.push('/admin/scheduler'), category: 'Navigate' },
    { icon: BarChart2, label: 'Analytics Dashboard', action: () => router.push('/admin/analytics'), category: 'Navigate' },
    { icon: Shield, label: 'SEO Tools', action: () => router.push('/admin/seo'), category: 'Navigate' },
    { icon: Command, label: 'Performance Monitor', action: () => router.push('/admin/performance'), category: 'Navigate' },
    { icon: Command, label: 'Export/Import', action: () => router.push('/admin/export-import'), category: 'Navigate' },
    { icon: Settings, label: 'Settings', action: () => router.push('/admin/settings'), category: 'Navigate' },
  ]

  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(search.toLowerCase())
  )

  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = []
    acc[cmd.category].push(cmd)
    return acc
  }, {} as Record<string, typeof commands>)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-32"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="border-b border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search commands..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-lg"
              autoFocus
            />
            <kbd className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-800 rounded">ESC</kbd>
          </div>
        </div>

        {/* Commands List */}
        <div className="max-h-96 overflow-y-auto p-2">
          {Object.entries(groupedCommands).map(([category, cmds]) => (
            <div key={category} className="mb-4">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                {category}
              </div>
              {cmds.map((cmd, index) => (
                <button
                  key={index}
                  onClick={() => {
                    cmd.action()
                    onClose()
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-left"
                >
                  <cmd.icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span>{cmd.label}</span>
                </button>
              ))}
            </div>
          ))}

          {filteredCommands.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No commands found
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-800 px-4 py-3 text-xs text-gray-500 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded">Enter</kbd>
              Select
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded">Ctrl K</kbd>
            to open
          </span>
        </div>
      </div>
    </div>
  )
}
