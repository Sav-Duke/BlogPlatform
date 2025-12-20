'use client'

import { Type, Image, Code, Video, Table, Quote, List } from 'lucide-react'

interface ContentBlock {
  id: string
  type: 'text' | 'image' | 'code' | 'video' | 'table' | 'quote' | 'list'
  icon: any
  label: string
  description: string
}

const blocks: ContentBlock[] = [
  { id: 'text', type: 'text', icon: Type, label: 'Text Block', description: 'Rich text paragraph' },
  { id: 'image', type: 'image', icon: Image, label: 'Image', description: 'Add images or galleries' },
  { id: 'code', type: 'code', icon: Code, label: 'Code Block', description: 'Syntax highlighted code' },
  { id: 'video', type: 'video', icon: Video, label: 'Video', description: 'Embed YouTube, Vimeo' },
  { id: 'table', type: 'table', icon: Table, label: 'Table', description: 'Data tables' },
  { id: 'quote', type: 'quote', icon: Quote, label: 'Quote', description: 'Blockquote or callout' },
  { id: 'list', type: 'list', icon: List, label: 'List', description: 'Bullet or numbered list' }
]

interface ContentBlocksProps {
  onBlockSelect: (type: string) => void
}

export default function ContentBlocks({ onBlockSelect }: ContentBlocksProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
      <h4 className="font-semibold text-sm mb-3 text-gray-700 dark:text-gray-300">Add Content Block</h4>
      <div className="grid grid-cols-2 gap-2">
        {blocks.map((block) => {
          const Icon = block.icon
          return (
            <button
              key={block.id}
              onClick={() => onBlockSelect(block.type)}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-primary-500 transition text-left"
            >
              <Icon className="h-5 w-5 text-primary-600 flex-shrink-0" />
              <div className="min-w-0">
                <div className="font-medium text-sm truncate">{block.label}</div>
                <div className="text-xs text-gray-500 truncate">{block.description}</div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
