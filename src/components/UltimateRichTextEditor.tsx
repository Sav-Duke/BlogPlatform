'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import ImageExtension from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import UnderlineExtension from '@tiptap/extension-underline'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import { 
  Bold, Italic, Strikethrough, Code, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Undo, Redo, Link as LinkIcon, Image as ImageIcon,
  Youtube, AlignLeft, AlignCenter, AlignRight, Underline as UnderlineIcon, 
  Highlighter, Palette, Maximize2, Minimize2, RotateCw, Trash2,
  Table as TableIcon, Columns, Type, FileCode, Settings, Sparkles,
  Square, Circle, Star, MessageCircle, ArrowRight, CheckCircle,
  AlertCircle, Info, Zap, Heart, Gift, TrendingUp, Award, Target,
  ChevronDown, ChevronUp, Plus, Minus, Move, Copy, Layout, AlignJustify, Box
} from 'lucide-react'
import { useCallback, useState, useRef, useEffect } from 'react'
import Cropper from 'react-easy-crop'
import axios from 'axios'
import toast from 'react-hot-toast'

import type { Transaction } from 'prosemirror-state';

const lowlight = createLowlight(common)

interface UltimateRichTextEditorProps {
  content: string
  onChange: (content: string) => void
}

// Custom Image Extension with Resizing
const ResizableImage = ImageExtension.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        renderHTML: attributes => {
          if (!attributes.width) {
            return {}
          }
          return { width: attributes.width }
        },
      },
      height: {
        default: null,
        renderHTML: attributes => {
          if (!attributes.height) {
            return {}
          }
          return { height: attributes.height }
        },
      },
      style: {
        default: null,
        renderHTML: attributes => {
          if (!attributes.style) {
            return {}
          }
          return { style: attributes.style }
        },
      },
    }
  },
})

// MenuButton helper component
const MenuButton = ({ onClick, active, children, title, disabled }: any) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-150 ${
      active ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : ''
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    title={title}
  >
    {children}
  </button>
)


function UltimateRichTextEditorInner({
  editor,
  onChange,
  colors,
  highlightColors,
  backgroundColors,
  fontSizes
}: any) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImageNode, setSelectedImageNode] = useState<{ pos: number; attrs: any } | null>(null);
  const [imageCaption, setImageCaption] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = useCallback(async (file: File) => {
    if (!editor) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      editor.chain().focus().setImage({ src: data.url }).run();
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  }, [editor]);

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadImage(file);
  };

  const addImageByURL = useCallback(() => {
    const url = prompt('Enter image URL:');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const resizeImage = useCallback((size: 'small' | 'medium' | 'large' | 'full') => {
    if (!editor || !selectedImageNode) return;
    const widthMap = {
      small: '300px',
      medium: '600px',
      large: '900px',
      full: '100%',
    };
    editor.chain().focus().command(({ tr }: { tr: Transaction }) => {
      tr.setNodeMarkup(selectedImageNode.pos, undefined, {
        ...selectedImageNode.attrs,
        width: widthMap[size],
      });
      return true;
    }).run();
  }, [editor, selectedImageNode]);

  const updateCaption = () => {
    if (!editor || !selectedImageNode) return;
    editor.chain().focus().command(({ tr }: { tr: Transaction }) => {
      tr.setNodeMarkup(selectedImageNode.pos, undefined, {
        ...selectedImageNode.attrs,
        caption: imageCaption,
      });
      return true;
    }).run();
  };

  const replaceImage = async (file: File) => {
    if (!editor || !selectedImageNode || !file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (!data?.url) return;
      editor.chain().focus().command(({ tr }: { tr: Transaction }) => {
        tr.setNodeMarkup(selectedImageNode.pos, undefined, {
          ...selectedImageNode.attrs,
          src: data.url,
        });
        return true;
      }).run();
      toast.success('Image replaced');
    } catch (e) {
      toast.error('Failed to replace image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ background: '#fff', borderRadius: 8, border: '1.5px solid #d1d5db', boxShadow: '0 2px 8px #0001', padding: 0 }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, borderBottom: '1px solid #e5e7eb', padding: 8, background: '#f9fafb', borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
        <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold"><Bold size={18} /></MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><Italic size={18} /></MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline"><UnderlineIcon size={18} /></MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough"><Strikethrough size={18} /></MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline Code"><Code size={18} /></MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Heading 1"><Heading1 size={18} /></MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2"><Heading2 size={18} /></MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3"><Heading3 size={18} /></MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List"><List size={18} /></MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered List"><ListOrdered size={18} /></MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote"><Quote size={18} /></MenuButton>
        <MenuButton onClick={() => editor.chain().focus().undo().run()} title="Undo"><Undo size={18} /></MenuButton>
        <MenuButton onClick={() => editor.chain().focus().redo().run()} title="Redo"><Redo size={18} /></MenuButton>
        <MenuButton onClick={() => {
          const url = prompt('Enter URL:');
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }} active={editor.isActive('link')} title="Insert Link"><LinkIcon size={18} /></MenuButton>
        <MenuButton onClick={handleImageUpload} title="Insert Image"><ImageIcon size={18} /></MenuButton>
        <MenuButton onClick={addImageByURL} title="Insert Image by URL"><ImageIcon size={18} style={{ opacity: 0.7 }} /></MenuButton>
        <MenuButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule"><Minus size={18} /></MenuButton>
        <MenuButton onClick={() => editor.chain().focus().setHardBreak().run()} title="Line Break"><ArrowRight size={18} /></MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code Block"><FileCode size={18} /></MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} title="Highlight"><Highlighter size={18} /></MenuButton>
        <MenuButton onClick={() => editor.chain().focus().setColor('#EF4444').run()} title="Red Text"><Palette size={18} color="#EF4444" /></MenuButton>
        <MenuButton onClick={() => editor.chain().focus().setColor('#3B82F6').run()} title="Blue Text"><Palette size={18} color="#3B82F6" /></MenuButton>
        <MenuButton onClick={() => editor.chain().focus().setColor('#10B981').run()} title="Green Text"><Palette size={18} color="#10B981" /></MenuButton>
        <MenuButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align Left"><AlignLeft size={18} /></MenuButton>
        <MenuButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align Center"><AlignCenter size={18} /></MenuButton>
        <MenuButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align Right"><AlignRight size={18} /></MenuButton>
        <MenuButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Justify"><AlignJustify size={18} /></MenuButton>
        {/* Table features if available */}
        <MenuButton onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title="Insert Table"><TableIcon size={18} /></MenuButton>
      </div>
      {/* Editor Content */}
      <EditorContent 
        editor={editor} 
        style={{ minHeight: 300, border: 'none', borderRadius: 8, padding: 16, background: '#fff' }}
      />
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  );
}

export default function UltimateRichTextEditor({ content, onChange }: UltimateRichTextEditorProps) {
  const colors = [
    '#000000', '#FFFFFF', '#EF4444', '#F59E0B', '#10B981',
    '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280', '#F97316'
  ];
  const highlightColors = [
    '#FEF3C7', '#DBEAFE', '#D1FAE5', '#FCE7F3',
    '#E0E7FF', '#FED7AA', '#D1D5DB', '#FDE047'
  ];
  const backgroundColors = [
    '#FFFFFF', '#F9FAFB', '#F3F4F6', '#E5E7EB',
    '#DBEAFE', '#FEF3C7', '#D1D5DB', '#FCE7F3',
    '#E0E7FF', '#FED7AA', '#1F2937', '#111827'
  ];
  const fontSizes = ['12', '14', '16', '18', '20', '24', '28', '32', '36', '48', '64'];
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      ResizableImage.configure({
        HTMLAttributes: { class: 'editor-image' },
        inline: false,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-700 underline cursor-pointer',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      UnderlineExtension,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
        // Placeholder.configure({
        //   placeholder: 'Start writing your content here...'
        // }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });
  if (!editor) return null;
  return (
    <UltimateRichTextEditorInner
      editor={editor}
      onChange={onChange}
      colors={colors}
      highlightColors={highlightColors}
      backgroundColors={backgroundColors}
      fontSizes={fontSizes}
    />
  );
}
