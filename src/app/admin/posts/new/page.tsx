'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import toast from 'react-hot-toast'
import UltimateRichTextEditor from '@/components/UltimateRichTextEditor'
import ThemeSelector, { BlogTheme } from '@/components/ThemeSelector'
import { ArrowLeft, Save, Eye } from 'lucide-react'
import Link from 'next/link'
import slugify from 'slugify'

interface Category {
  id: string
  name: string
  slug: string
}

interface Tag {
  id: string
  name: string
  slug: string
}

export default function NewPostPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [uploadingCover, setUploadingCover] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    coverImage: '',
    status: 'DRAFT',
    featured: false,
    readTime: 5,
    categories: [] as string[],
    tags: [] as string[],
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    theme: 'minimalist' as BlogTheme,
  })

  useEffect(() => {
    loadCategoriesAndTags()
  }, [])

  useEffect(() => {
    if (formData.title && !formData.slug) {
      setFormData(prev => ({
        ...prev,
        slug: slugify(formData.title, { lower: true, strict: true })
      }))
    }
  }, [formData.title])

  const loadCategoriesAndTags = async () => {
    try {
      const [categoriesRes, tagsRes] = await Promise.all([
        axios.get('/api/categories'),
        axios.get('/api/tags'),
      ])
      setCategories(categoriesRes.data)
      setTags(tagsRes.data)
    } catch (error) {
      toast.error('Failed to load categories and tags')
    }
  }

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingCover(true)
    try {
      const data = new FormData()
      data.append('file', file)

      const res = await axios.post('/api/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setFormData(prev => ({ ...prev, coverImage: res.data.url }))
      toast.success('Cover image uploaded')
    } catch (error) {
      toast.error('Failed to upload cover image')
    } finally {
      setUploadingCover(false)
    }
  }

  const [showCategoryPopup, setShowCategoryPopup] = useState(false);
  const handleSubmit = async (status: string) => {
    if (!formData.title || !formData.content) {
      toast.error('Title and content are required')
      return
    }
    if (status === 'PUBLISHED' && formData.categories.length === 0) {
      setShowCategoryPopup(true);
      return;
    }
    setIsLoading(true)
    try {
      const postData = {
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: formData.content,
        coverImage: formData.coverImage,
        status,
        featured: formData.featured,
        categoryIds: formData.categories,
        tagIds: formData.tags,
        seoTitle: formData.seoTitle,
        seoDescription: formData.seoDescription,
        seoKeywords: formData.seoKeywords,
        theme: formData.theme,
      }
      await axios.post('/api/posts', postData)
      toast.success(`Post ${status === 'PUBLISHED' ? 'published' : 'saved as draft'}`)
      router.push('/admin/posts')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create post')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 relative">
      {/* Elegant Category Popup */}
      {showCategoryPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-8 max-w-sm w-full text-center border border-primary-600 animate-fade-in">
            <div className="flex flex-col items-center gap-3">
              <svg className="h-12 w-12 text-primary-600 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="#f3f4f6" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01" /></svg>
              <h2 className="text-xl font-bold text-primary-700 dark:text-primary-400">Please select a category</h2>
              <p className="text-gray-600 dark:text-gray-300">You must select at least one category before publishing your post.</p>
              <button
                onClick={() => setShowCategoryPopup(false)}
                className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg shadow hover:bg-primary-700 transition"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/posts"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Create New Post</h1>
              <p className="text-gray-600 dark:text-gray-400">Share your knowledge with the world</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleSubmit('DRAFT')}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition disabled:opacity-50"
            >
              <Save className="h-4 w-4 inline mr-2" />
              Save Draft
            </button>
            <button
              onClick={() => handleSubmit('PUBLISHED')}
              disabled={isLoading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
            >
              <Eye className="h-4 w-4 inline mr-2" />
              Publish
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6">
              <label className="block text-sm font-medium mb-2">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter post title..."
                className="w-full px-4 py-3 text-2xl font-bold border-0 focus:ring-0 bg-transparent"
              />
            </div>

            {/* Slug */}
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6">
              <label className="block text-sm font-medium mb-2">URL Slug</label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">/blog/</span>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="post-url-slug"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-transparent"
                />
              </div>
            </div>

            {/* Excerpt */}
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6">
              <label className="block text-sm font-medium mb-2">Excerpt</label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Brief description of your post..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-transparent"
              />
            </div>

            {/* Content Editor */}
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6">
              <label className="block text-sm font-medium mb-4">Content *</label>
              <UltimateRichTextEditor
                content={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
              />
            </div>

            {/* SEO Section */}
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">SEO Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">SEO Title</label>
                  <input
                    type="text"
                    value={formData.seoTitle}
                    onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                    placeholder="SEO optimized title..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">SEO Description</label>
                  <textarea
                    value={formData.seoDescription}
                    onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                    placeholder="Meta description for search engines..."
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">SEO Keywords</label>
                  <input
                    type="text"
                    value={formData.seoKeywords}
                    onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
                    placeholder="keyword1, keyword2, keyword3"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Theme Selector */}
            <ThemeSelector
              currentTheme={formData.theme}
              onThemeChange={(theme) => setFormData({ ...formData, theme })}
              previewContent={{
                title: formData.title || 'Sample Title',
                content: formData.content || '<p>This is a sample post content for preview.</p>',
                author: { name: 'Author', image: '' },
                publishedAt: new Date(),
                categories: categories.length ? categories.map(c => ({ name: c.name, slug: c.slug })) : [{ name: 'Category', slug: 'category' }],
                tags: tags.length ? tags.map(t => ({ name: t.name, slug: t.slug })) : [{ name: 'Tag', slug: 'tag' }],
                coverImage: formData.coverImage,
                readTime: formData.readTime,
              }}
            />
            {/* Cover Image */}
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6">
              <label className="block text-sm font-medium mb-4">Cover Image</label>
              {formData.coverImage ? (
                <div className="relative">
                  <img src={formData.coverImage} alt="Cover" className="w-full rounded-lg" />
                  <button
                    onClick={() => setFormData({ ...formData, coverImage: '' })}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageUpload}
                    className="hidden"
                    id="cover-upload"
                  />
                  <label
                    htmlFor="cover-upload"
                    className="block w-full p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-center cursor-pointer hover:border-primary-600 transition"
                  >
                    {uploadingCover ? (
                      <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
                    ) : (
                      <>
                        <div className="text-gray-400 mb-2">Click to upload</div>
                        <div className="text-sm text-gray-500">PNG, JPG up to 10MB</div>
                      </>
                    )}
                  </label>
                </div>
              )}
            </div>

            {/* Categories */}
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6">
              <label className={`block text-sm font-medium mb-4 flex items-center gap-1 ${formData.categories.length === 0 ? 'text-red-600 dark:text-red-400' : ''}`}>
                Categories <span className="text-red-600 dark:text-red-400">*</span>
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {categories.map((category) => (
                  <label key={category.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.categories.includes(category.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            categories: [...formData.categories, category.id],
                          })
                        } else {
                          setFormData({
                            ...formData,
                            categories: formData.categories.filter((id) => id !== category.id),
                          })
                        }
                      }}
                      className={`rounded border-gray-300 focus:ring-primary-600 ${formData.categories.length === 0 ? 'ring-2 ring-red-400' : 'text-primary-600'}`}
                    />
                    <span>{category.name}</span>
                  </label>
                ))}
              </div>
              {formData.categories.length === 0 && (
                <div className="mt-2 text-xs text-red-600 dark:text-red-400 font-semibold flex items-center gap-1">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
                  Please select at least one category.
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6">
              <label className="block text-sm font-medium mb-4">Tags</label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {tags.map((tag) => (
                  <label key={tag.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.tags.includes(tag.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            tags: [...formData.tags, tag.id],
                          })
                        } else {
                          setFormData({
                            ...formData,
                            tags: formData.tags.filter((id) => id !== tag.id),
                          })
                        }
                      }}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                    />
                    <span>{tag.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6">
              <label className="block text-sm font-medium mb-4">Settings</label>
              <div className="space-y-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                  />
                  <span>Featured Post</span>
                </label>
                <div>
                  <label className="block text-sm mb-2">Read Time (minutes)</label>
                  <input
                    type="number"
                    value={formData.readTime}
                    onChange={(e) => setFormData({ ...formData, readTime: parseInt(e.target.value) || 5 })}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
