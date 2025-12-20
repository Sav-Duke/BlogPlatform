'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import { 
  Bold, Italic, Strikethrough, Code, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Undo, Redo, Link as LinkIcon, ImageIcon,
  Youtube, AlignLeft, AlignCenter, AlignRight, UnderlineIcon, 
  Highlighter, Palette, Type, ChevronDown, Trash2, Edit2, Maximize2
} from 'lucide-react'
import { useCallback, useState, useRef } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const lowlight = createLowlight(common)

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showHighlightPicker, setShowHighlightPicker] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [imageEditMode, setImageEditMode] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const colors = [
    '#000000', '#374151', '#EF4444', '#F59E0B', '#10B981', 
    '#3B82F6', '#8B5CF6', '#EC4899', '#FFFFFF'
  ]

  const highlightColors = [
    '#FEF3C7', '#DBEAFE', '#D1FAE5', '#FCE7F3', 
    '#E0E7FF', '#FED7AA', '#D1D5DB'
  ]

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'editor-image',
        },
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary-600 hover:text-primary-700 underline',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph', 'image'],
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[500px] p-6',
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0]
          if (file.type.startsWith('image/')) {
            event.preventDefault()
            uploadImage(file)
            return true
          }
        }
        return false
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items
        if (items) {
          for (let i = 0; i < items.length; i++) {
            if (items[i].type.startsWith('image/')) {
              event.preventDefault()
              const file = items[i].getAsFile()
              if (file) uploadImage(file)
              return true
            }
          }
        }
        return false
      },
    },
  })

  const uploadImage = useCallback(async (file: File) => {
    if (!editor) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const { data } = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      editor.chain().focus().setImage({ src: data.url }).run()
      toast.success('Image uploaded successfully')
    } catch (error) {
      toast.error('Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }, [editor])

  const handleImageUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadImage(file)
  }

  const addImageByURL = useCallback(() => {
    const url = prompt('Enter image URL:')
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  const addLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href
    const url = prompt('Enter URL:', previousUrl)
    
    if (url === null) return
    
    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    
    if (editor) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
  }, [editor])

  const addYouTubeVideo = useCallback(() => {
    const url = prompt('Enter YouTube URL:')
    
    if (url && editor) {
      const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1]
      
      if (videoId) {
        const iframe = `<div class="video-wrapper" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; margin: 1.5em 0;"><iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`
        editor.chain().focus().insertContent(iframe).run()
      } else {
        toast.error('Invalid YouTube URL')
      }
    }
  }, [editor])

  const setTextColor = (color: string) => {
    editor?.chain().focus().setColor(color).run()
    setShowColorPicker(false)
  }

  const setHighlightColor = (color: string) => {
    editor?.chain().focus().setHighlight({ color }).run()
    setShowHighlightPicker(false)
  }

  if (!editor) {
    return null
  }

  const MenuButton = ({ onClick, active, children, title, disabled }: any) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition ${
        active ? 'bg-gray-300 dark:bg-gray-600' : ''
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={title}
    >
      {children}
    </button>
  )
    
    if (url && editor) {
      // Extract video ID from URL
      const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1]
      
      if (videoId) {
        const iframe = `<div class="video-wrapper"><iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`
        editor.chain().focus().insertContent(iframe).run()
      } else {
        toast.error('Invalid YouTube URL')
      }
    }
  }, [editor])

  if (!editor) {
    return null
  }

  const MenuButton = ({ onClick, active, children, title }: any) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition ${
        active ? 'bg-gray-200 dark:bg-gray-700' : ''
      }`}
      title={title}
    >
      {children}
    </button>
  )

  return (
    <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-300 dark:border-gray-700 p-2 flex flex-wrap gap-1">
        {/* Text Formatting */}
        <div className="flex gap-1 border-r border-gray-300 dark:border-gray-700 pr-2">
          <MenuButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive('underline')}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive('strike')}
            title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive('code')}
            title="Inline Code"
          >
            <Code className="h-4 w-4" />
          </MenuButton>
        </div>

        {/* Headings */}
        <div className="flex gap-1 border-r border-gray-300 dark:border-gray-700 pr-2">
          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive('heading', { level: 1 })}
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive('heading', { level: 3 })}
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </MenuButton>
        </div>

        {/* Text Alignment */}
        <div className="flex gap-1 border-r border-gray-300 dark:border-gray-700 pr-2">
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            active={editor.isActive({ textAlign: 'left' })}
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            active={editor.isActive({ textAlign: 'center' })}
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            active={editor.isActive({ textAlign: 'right' })}
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </MenuButton>
        </div>

        {/* Lists & Quotes */}
        <div className="flex gap-1 border-r border-gray-300 dark:border-gray-700 pr-2">
          <MenuButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive('blockquote')}
            title="Quote"
          >
            <Quote className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            active={editor.isActive('codeBlock')}
            title="Code Block"
          >
            <Code className="h-4 w-4" />
          </MenuButton>
        </div>

        {/* Color & Highlight */}
        <div className="flex gap-1 border-r border-gray-300 dark:border-gray-700 pr-2 relative">
          <div className="relative">
            <MenuButton
              onClick={() => setShowColorPicker(!showColorPicker)}
              title="Text Color"
            >
              <Palette className="h-4 w-4" />
            </MenuButton>
            {showColorPicker && (
              <div className="absolute top-full left-0 mt-1 p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg z-50 flex gap-1">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setTextColor(color)}
                    className="w-6 h-6 rounded border-2 border-gray-300 dark:border-gray-600 hover:scale-110 transition"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <MenuButton
              onClick={() => setShowHighlightPicker(!showHighlightPicker)}
              title="Highlight"
              active={editor.isActive('highlight')}
            >
              <Highlighter className="h-4 w-4" />
            </MenuButton>
            {showHighlightPicker && (
              <div className="absolute top-full left-0 mt-1 p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg z-50 flex gap-1">
                {highlightColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setHighlightColor(color)}
                    className="w-6 h-6 rounded border-2 border-gray-300 dark:border-gray-600 hover:scale-110 transition"
                    style={{ backgroundColor: color }}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => editor.chain().focus().unsetHighlight().run()}
                  className="w-6 h-6 rounded border-2 border-gray-300 dark:border-gray-600 hover:scale-110 transition bg-white dark:bg-gray-800"
                  title="Remove Highlight"
                >
                  <span className="text-xs">✕</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Media */}
        <div className="flex gap-1 border-r border-gray-300 dark:border-gray-700 pr-2">
          <MenuButton onClick={addLink} title="Add/Edit Link">
            <LinkIcon className="h-4 w-4" />
          </MenuButton>
          <MenuButton onClick={handleImageUpload} title="Upload Image">
            <ImageIcon className="h-4 w-4 text-green-600" />
          </MenuButton>
          <MenuButton onClick={addImageByURL} title="Add Image from URL">
            <ImageIcon className="h-4 w-4 text-blue-600" />
          </MenuButton>
          <MenuButton onClick={addYouTubeVideo} title="Embed YouTube Video">
            <Youtube className="h-4 w-4 text-red-600" />
          </MenuButton>
        </div>

        {/* Undo/Redo */}
        <div className="flex gap-1">
          <MenuButton
            onClick={() => editor.chain().focus().undo().run()}
            title="Undo (Ctrl+Z)"
            disabled={!editor.can().undo()}
          >
            <Undo className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().redo().run()}
            title="Redo (Ctrl+Y)"
            disabled={!editor.can().redo()}
          >
            <Redo className="h-4 w-4" />
          </MenuButton>
        </div>
      </div>

      {/* Editor */}
      <div className="relative bg-white dark:bg-gray-950">
        <EditorContent editor={editor} />
        
        {isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <div className="animate-spin h-12 w-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-white text-sm">Uploading image...</p>
            </div>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Helper Text */}
      <div className="bg-gray-50 dark:bg-gray-900 border-t border-gray-300 dark:border-gray-700 p-2 text-xs text-gray-600 dark:text-gray-400">
        <p>💡 <strong>Tips:</strong> Drag & drop images directly into the editor, paste from clipboard, or use the image buttons above.</p>
      </div>
    </div>
  )
}
