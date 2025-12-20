'use client'

import { useState } from 'react'
import ThemedPost from './ThemedPost'
import { Check, Palette } from 'lucide-react'

export type BlogTheme = 'minimalist' | 'magazine' | 'photography' | 'dark-tech' | 'elegant' | 'creative'

interface ThemeSelectorProps {
  currentTheme: BlogTheme
  onThemeChange: (theme: BlogTheme) => void
  previewContent?: {
    title: string
    content: string
    author: { name: string; image?: string }
    publishedAt: Date
    categories: { name: string; slug: string }[]
    tags: { name: string; slug: string }[]
    coverImage?: string
    readTime?: number
  }
}

const themes = [
  {
    id: 'minimalist' as BlogTheme,
    name: 'Minimalist',
    description: 'Clean, white space, typography focused',
    preview: 'bg-gradient-to-br from-gray-50 to-white',
    accent: 'border-gray-400'
  },
  {
    id: 'magazine' as BlogTheme,
    name: 'Magazine',
    description: 'Grid layouts, news-style, dynamic',
    preview: 'bg-gradient-to-br from-red-50 to-orange-50',
    accent: 'border-red-500'
  },
  {
    id: 'photography' as BlogTheme,
    name: 'Photography',
    description: 'Image-heavy, galleries, full-width',
    preview: 'bg-gradient-to-br from-slate-700 to-slate-900',
    accent: 'border-slate-600'
  },
  {
    id: 'dark-tech' as BlogTheme,
    name: 'Dark Tech',
    description: 'Dark mode, code-friendly, modern',
    preview: 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900',
    accent: 'border-blue-500'
  },
  {
    id: 'elegant' as BlogTheme,
    name: 'Elegant',
    description: 'Serif fonts, sophisticated, luxury',
    preview: 'bg-gradient-to-br from-amber-50 to-yellow-50',
    accent: 'border-amber-600'
  },
  {
    id: 'creative' as BlogTheme,
    name: 'Creative',
    description: 'Bold colors, artistic, unique',
    preview: 'bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400',
    accent: 'border-purple-500'
  }
]

export default function ThemeSelector({ currentTheme, onThemeChange, previewContent }: ThemeSelectorProps) {
  const [previewTheme, setPreviewTheme] = useState<BlogTheme | null>(null)
  // Sample content for preview if not provided
  const sampleContent = {
    title: 'How to Build a World-Class Blog',
    content: '<p>This is a <strong>sample post</strong> showing how your content will look in this theme. Add images, code, and more!</p><ul><li>Beautiful typography</li><li>Responsive images</li><li>Interactive elements</li></ul>',
    author: { name: 'Jane Doe', image: '' },
    publishedAt: new Date(),
    categories: [{ name: 'Tech', slug: 'tech' }],
    tags: [{ name: 'Next.js', slug: 'nextjs' }, { name: 'Design', slug: 'design' }],
    coverImage: '',
    readTime: 4,
  }
  const previewData = previewContent || sampleContent
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Palette className="h-5 w-5 text-primary-600" />
        <h3 className="font-bold text-lg">Post Theme</h3>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Choose how your post will be displayed to readers
      </p>

      <div className="flex flex-wrap gap-6 justify-center">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => setPreviewTheme(theme.id)}
            className={`relative p-6 rounded-xl border-2 transition-all min-h-[180px] flex-1 max-w-xs ${
              currentTheme === theme.id
                ? `${theme.accent} shadow-2xl scale-105`
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            type="button"
            style={{ minWidth: 240 }}
          >
            <div className={`h-32 rounded-lg mb-4 flex items-center justify-center ${theme.preview} overflow-hidden relative`}>
              <span className="z-0 text-xl font-bold opacity-80">{theme.name}</span>
            </div>
            <div className="font-semibold text-base mb-1">{theme.name}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">{theme.description}</div>
            {currentTheme === theme.id && (
              <div className="absolute top-2 right-2 bg-primary-600 text-white rounded-full p-1">
                <Check className="h-4 w-4" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Modal Preview */}
      {previewTheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-4xl w-full relative animate-fade-in overflow-y-auto max-h-[90vh]">
            <button onClick={() => setPreviewTheme(null)} className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-xl font-bold">×</button>
            <ThemedPost post={previewData as any} theme={previewTheme} />
            <div className="mt-4 flex justify-end">
              <button
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                onClick={() => {
                  onThemeChange(previewTheme)
                  setPreviewTheme(null)
                }}
              >
                Use this theme
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
