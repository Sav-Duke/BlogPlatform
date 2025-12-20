'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { Check, X, Trash2, Search, MessageSquare, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDate } from '@/lib/utils'

interface Comment {
  id: string
  content: string
  approved: boolean
  createdAt: string
  author: {
    name: string | null
    email: string
    image: string | null
  }
  post: {
    title: string
    slug: string
  }
}

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadComments()
  }, [filter])

  const loadComments = async () => {
    try {
      const params: any = {}
      if (filter === 'approved') params.approved = true
      if (filter === 'pending') params.approved = false

      const { data } = await axios.get('/api/comments', { params })
      setComments(data)
    } catch (error) {
      toast.error('Failed to load comments')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (id: string, approved: boolean) => {
    try {
      await axios.patch(`/api/comments/${id}`, { approved })
      toast.success(approved ? 'Comment approved' : 'Comment unapproved')
      loadComments()
    } catch (error) {
      toast.error('Failed to update comment')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this comment permanently?')) return

    try {
      await axios.delete(`/api/comments/${id}`)
      toast.success('Comment deleted')
      loadComments()
    } catch (error) {
      toast.error('Failed to delete comment')
    }
  }

  const filteredComments = comments.filter((comment) =>
    comment.content.toLowerCase().includes(search.toLowerCase()) ||
    comment.author.name?.toLowerCase().includes(search.toLowerCase()) ||
    comment.post.title.toLowerCase().includes(search.toLowerCase())
  )

  const pendingCount = comments.filter(c => !c.approved).length

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Comments</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage reader interactions and feedback
          </p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-lg">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">{pendingCount} pending approval</span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'approved'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'pending'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Pending
          </button>
        </div>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search comments..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-900"
          />
        </div>
      </div>

      {/* Comments List */}
      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : filteredComments.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No comments found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredComments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                    {comment.author.name?.charAt(0) || comment.author.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">
                        {comment.author.name || 'Anonymous'}
                      </span>
                      {!comment.approved && (
                        <span className="px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded">
                          Pending
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      On: <a href={`/blog/${comment.post.slug}`} className="text-primary-600 hover:underline">{comment.post.title}</a>
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      {formatDate(comment.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {comment.approved ? (
                    <button
                      onClick={() => handleApprove(comment.id, false)}
                      className="p-2 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-yellow-600 rounded"
                      title="Unapprove"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleApprove(comment.id, true)}
                      className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 rounded"
                      title="Approve"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
