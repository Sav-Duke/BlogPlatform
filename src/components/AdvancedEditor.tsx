'use client'

import { EditorContent, useEditor, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { Color } from '@tiptap/extension-color'
import TextStyle from '@tiptap/extension-text-style'
import { common, createLowlight } from 'lowlight'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Link as LinkIcon, Image as ImageIcon, Minus, Undo, Redo,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, Highlighter, Palette, Table,
  FileCode, Video, Type, Sparkles, Eye
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface AdvancedEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

const lowlight = createLowlight(common)

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')

  if (!editor) return null

  const addLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run()
      setLinkUrl('')
      setShowLinkInput(false)
    }
  }

  const addImage = () => {
    const url = window.prompt('Enter image URL:')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  // Remove addTable if not supported by your Tiptap setup

  const addYouTube = () => {
    const url = window.prompt('Enter YouTube URL:')
    if (url) {
      const videoId = url.split('v=')[1] || url.split('/').pop()
      const iframe = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`
      editor.chain().focus().insertContent(iframe).run()
    }
  }

  const buttons = [
    {
      icon: Bold,
      label: 'Bold',
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold')
    },
    {
      icon: Italic,
      label: 'Italic',
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic')
    },
    {
      icon: UnderlineIcon,
      label: 'Underline',
      action: () => editor.chain().focus().toggleUnderline().run(),
      isActive: editor.isActive('underline')
    },
    {
      icon: Strikethrough,
      label: 'Strikethrough',
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: editor.isActive('strike')
    },
    {
      icon: Code,
      label: 'Code',
      action: () => editor.chain().focus().toggleCode().run(),
      isActive: editor.isActive('code')
    },
    { type: 'divider' },
    {
      icon: Heading1,
      label: 'Heading 1',
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: editor.isActive('heading', { level: 1 })
    },
    {
      icon: Heading2,
      label: 'Heading 2',
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive('heading', { level: 2 })
    },
    {
      icon: Heading3,
      label: 'Heading 3',
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: editor.isActive('heading', { level: 3 })
    },
    { type: 'divider' },
    {
      icon: List,
      label: 'Bullet List',
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive('bulletList')
    },
    {
      icon: ListOrdered,
      label: 'Numbered List',
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive('orderedList')
    },
    {
      icon: Quote,
      label: 'Quote',
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive('blockquote')
    },
    { type: 'divider' },
    {
      icon: AlignLeft,
      label: 'Align Left',
      action: () => editor.chain().focus().setTextAlign('left').run(),
      isActive: editor.isActive({ textAlign: 'left' })
    },
    {
      icon: AlignCenter,
      label: 'Align Center',
      action: () => editor.chain().focus().setTextAlign('center').run(),
      isActive: editor.isActive({ textAlign: 'center' })
    },
    {
      icon: AlignRight,
      label: 'Align Right',
      action: () => editor.chain().focus().setTextAlign('right').run(),
      isActive: editor.isActive({ textAlign: 'right' })
    },
    { type: 'divider' },
    {
      icon: LinkIcon,
      label: 'Link',
      action: () => setShowLinkInput(!showLinkInput),
      isActive: editor.isActive('link')
    },
    {
      icon: ImageIcon,
      label: 'Image',
      action: addImage,
      isActive: false
    },
    {
      icon: Video,
      label: 'YouTube',
      action: addYouTube,
      isActive: false
    },
    {
      icon: FileCode,
      label: 'Code Block',
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      isActive: editor.isActive('codeBlock')
    },
    {
      icon: Highlighter,
      label: 'Highlight',
      action: () => editor.chain().focus().toggleHighlight().run(),
      isActive: editor.isActive('highlight')
    },
    { type: 'divider' },
    {
      icon: Undo,
      label: 'Undo',
      action: () => editor.chain().focus().undo().run(),
      isActive: false
    },
    {
      icon: Redo,
      label: 'Redo',
      action: () => editor.chain().focus().redo().run(),
      isActive: false
    }
  ]

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-2">
      <div className="flex flex-wrap items-center gap-1">
        {buttons.map((btn, index) => {
          if (btn.type === 'divider') {
            return <div key={index} className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
          }

          const Icon = btn.icon
          return (
            <button
              key={index}
              onClick={btn.action}
              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition ${
                btn.isActive ? 'bg-gray-200 dark:bg-gray-800 text-primary-600' : ''
              }`}
              title={btn.label}
            >
              {Icon ? <Icon className="h-4 w-4" /> : null}
            </button>
          )
        })}
      </div>

      {showLinkInput && (
        <div className="flex items-center gap-2 mt-2 p-2 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600">
          <input
            type="url"
            placeholder="https://example.com"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="flex-1 px-3 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
            onKeyDown={(e) => e.key === 'Enter' && addLink()}
          />
          <button
            onClick={addLink}
            className="px-3 py-1 bg-primary-600 text-white rounded text-sm hover:bg-primary-700"
          >
            Add Link
          </button>
          <button
            onClick={() => setShowLinkInput(false)}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}

export default function AdvancedEditor({ content, onChange, placeholder }: AdvancedEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Image,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary-600 underline hover:text-primary-700'
        }
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        multicolor: true
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Color,
      TextStyle,
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[500px] p-6',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
