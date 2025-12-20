'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { Plus, Search, Edit, Trash2, Eye, Copy, Star, Pin, Calendar, FileText } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Post {
  id: string
  title: string
  slug: string
  status: string
  featured: boolean
  viewCount: number
  publishedAt: Date | null
  createdAt: Date
  author: {
    name: string | null
  }
  _count?: {
    comments: number
  }
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<string>('all')
  const [selectedPosts, setSelectedPosts] = useState<string[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)

  useEffect(() => {
    loadPosts()
  }, [filter])
  const [tab, setTab] = useState<'all' | 'pending'>('all')

  const loadPosts = async () => {
    try {
      const params: any = { limit: 100 }
      if (filter !== 'all') {
        params.status = filter.toUpperCase()
      }
      
      const { data } = await axios.get('/api/posts', { params })
      setPosts(data.posts)
      if (tab === 'pending') {
        params.status = 'PENDING'
      } else if (filter !== 'all') {
        params.status = filter.toUpperCase()
      }
    } catch (error) {
      toast.error('Failed to load posts')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return
  const handleApprove = async (slug: string) => {
    try {
      await axios.patch(`/api/posts/${slug}/status`, { status: 'PUBLISHED', publishedAt: new Date().toISOString() })
      toast.success('Post approved and published')
      loadPosts()
    } catch (error) {
      toast.error('Failed to approve post')
    }
  }

  const handleReject = async (slug: string) => {
    try {
      await axios.patch(`/api/posts/${slug}/status`, { status: 'ARCHIVED' })
      toast.success('Post rejected and archived')
      loadPosts()
    } catch (error) {
      toast.error('Failed to reject post')
    }
  }

    try {
      await axios.delete(`/api/posts/${slug}`)
      toast.success('Post deleted successfully')
      loadPosts()
    } catch (error) {
      toast.error('Failed to delete post')
    }
  }

  const handleDuplicate = async (slug: string) => {
    try {
      const { data } = await axios.get(`/api/posts/${slug}`)
      const newPost = {
        ...data,
        title: `${data.title} (Copy)`,
        slug: `${data.slug}-copy-${Date.now()}`,
        status: 'DRAFT',
        publishedAt: null,
        categoryIds: data.categories?.map((c: any) => c.id) || [],
        tagIds: data.tags?.map((t: any) => t.id) || [],
      }
      await axios.post('/api/posts', newPost)
      toast.success('Post duplicated successfully')
      loadPosts()
    } catch (error) {
      toast.error('Failed to duplicate post')
    }
  }

  const handleToggleFeatured = async (slug: string, featured: boolean) => {
    try {
      await axios.patch(`/api/posts/${slug}/feature`, { featured: !featured })
      toast.success(featured ? 'Removed from featured' : 'Added to featured')
      loadPosts()
    } catch (error) {
      toast.error('Failed to update post')
    }
  }

  const handleToggleStatus = async (slug: string, currentStatus: string) => {
    const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'
    try {
      await axios.patch(`/api/posts/${slug}/status`, { 
        status: newStatus,
        publishedAt: newStatus === 'PUBLISHED' ? new Date().toISOString() : null
      })
      toast.success(`Post ${newStatus === 'PUBLISHED' ? 'published' : 'unpublished'}`)
      loadPosts()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(search.toLowerCase())
  )

  const handleBulkAction = async (action: string) => {
    if (selectedPosts.length === 0) {
      toast.error('No posts selected')
      return
    }

    if (!confirm(`Are you sure you want to ${action} ${selectedPosts.length} post(s)?`)) return

    try {
      await axios.post('/api/posts/bulk', {
        postIds: selectedPosts,
        action,
      })
      toast.success(`Bulk ${action} completed`)
      setSelectedPosts([])
      setShowBulkActions(false)
      loadPosts()
    } catch (error) {
      toast.error(`Failed to ${action} posts`)
    }
  }

  const toggleSelectAll = () => {
    if (selectedPosts.length === filteredPosts.length) {
      setSelectedPosts([])
    } else {
      setSelectedPosts(filteredPosts.map(p => p.id))
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Posts</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your blog posts
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          <Plus className="h-5 w-5" />
          New Post
        </Link>
      </div>

      {/* Filters and Bulk Actions */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search posts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-600 focus:border-transparent"
            >
              <option value="all">All Posts</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {selectedPosts.length > 0 && (
            <div className="flex items-center gap-3 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
              <span className="font-medium">{selectedPosts.length} selected</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('publish')}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Publish
                </button>
                <button
                  onClick={() => handleBulkAction('unpublish')}
                  className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700"
                >
                  Unpublish
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
                <button
                  onClick={() => setSelectedPosts([])}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedPosts.length === filteredPosts.length && filteredPosts.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Post
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedPosts.includes(post.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPosts([...selectedPosts, post.id])
                          } else {
                            setSelectedPosts(selectedPosts.filter(id => id !== post.id))
                          }
                        }}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {post.featured && (
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        )}
                        <div>
                          <div className="font-medium">{post.title}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            /{post.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(post.slug, post.status)}
                        className={`px-2 py-1 text-xs rounded-full hover:opacity-80 ${
                          post.status === 'PUBLISHED'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                            : post.status === 'DRAFT'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                        }`}
                      >
                        {post.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <Eye className="h-3 w-3" />
                          {post.viewCount}
                        </div>
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <FileText className="h-3 w-3" />
                          {post._count?.comments || 0}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(post.publishedAt || post.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          className="p-2 text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                          title="Preview"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleToggleFeatured(post.slug, post.featured)}
                          className={`p-2 ${post.featured ? 'text-yellow-600' : 'text-gray-600 hover:text-yellow-600 dark:text-gray-400'}`}
                          title={post.featured ? 'Remove from featured' : 'Add to featured'}
                        >
                          <Star className={`h-4 w-4 ${post.featured ? 'fill-yellow-600' : ''}`} />
                        </button>
                        <button
                          onClick={() => handleDuplicate(post.slug)}
                          className="p-2 text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                          title="Duplicate"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <Link
                          href={`/admin/posts/${post.slug}`}
                          className="p-2 text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(post.slug)}
                          className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">No posts found</p>
            <Link
              href="/admin/posts/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              <Plus className="h-5 w-5" />
              Create Your First Post
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
