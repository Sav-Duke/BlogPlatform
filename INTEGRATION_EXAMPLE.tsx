// EXAMPLE: How to integrate all new features into your post editor

'use client'

import { useState } from 'react'
import AdvancedEditor from '@/components/AdvancedEditor'
import ThemeSelector, { BlogTheme } from '@/components/ThemeSelector'
import AIContentAssistant from '@/components/AIContentAssistant'
import ContentBlocks from '@/components/ContentBlocks'

export default function EnhancedPostEditor() {
  const [content, setContent] = useState('')
  const [theme, setTheme] = useState<BlogTheme>('minimalist')
  const [title, setTitle] = useState('')

  const handleBlockSelect = (blockType: string) => {
    console.log('Selected block type:', blockType)
    // Add block to editor
  }

  const handleSave = async () => {
    const postData = {
      title,
      content,
      theme,
      // ... other fields
    }
    
    // Save to API
    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData)
    })
    
    // Handle response
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create New Post</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Use our advanced editor and AI tools to create amazing content
        </p>
      </div>

      {/* Title Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Post Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter an amazing title..."
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-lg font-semibold"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Advanced Editor */}
          <div>
            <label className="block text-sm font-medium mb-2">Content</label>
            <AdvancedEditor
              content={content}
              onChange={setContent}
              placeholder="Start writing your amazing content..."
            />
          </div>

          {/* AI Content Assistant */}
          <AIContentAssistant 
            content={content}
            onSuggestion={(suggestion) => console.log(suggestion)}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Theme Selector */}
          <ThemeSelector
            currentTheme={theme}
            onThemeChange={setTheme}
          />

          {/* Content Blocks */}
          <ContentBlocks onBlockSelect={handleBlockSelect} />

          {/* Save Button */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <button
              onClick={handleSave}
              className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition"
            >
              Publish Post
            </button>
            <button
              onClick={handleSave}
              className="w-full mt-3 px-6 py-3 bg-gray-200 dark:bg-gray-800 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 font-semibold transition"
            >
              Save Draft
            </button>
          </div>

          {/* Post Stats */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="font-semibold mb-4">Post Stats</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Words:</span>
                <span className="font-semibold">{content.split(' ').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Reading Time:</span>
                <span className="font-semibold">{Math.ceil(content.split(' ').length / 200)} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Characters:</span>
                <span className="font-semibold">{content.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
