'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import axios from 'axios'
import toast from 'react-hot-toast'
import { formatDate } from '@/lib/utils'
import { MessageSquare, Send, Reply, Trash2, CheckCircle, Clock } from 'lucide-react'

interface Comment {
  id: string
  content: string
  createdAt: Date
  approved: boolean
  author: {
    id: string
    name: string | null
    image: string | null
  }
  replies?: Comment[]
}

interface CommentSectionProps {
  postId: string
  initialComments: Comment[]
}

export default function CommentSection({ postId, initialComments }: CommentSectionProps) {
  const { data: session } = useSession()
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newComment, setNewComment] = useState('')
  const [anonymousName, setAnonymousName] = useState('')
  const [asAnonymous, setAsAnonymous] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!asAnonymous && !session) {
      toast.error('Please sign in or select "Post as Anonymous"')
      return
    }
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty')
      return
    }
    if (asAnonymous && anonymousName.trim().length < 2) {
      toast.error('Name is required for anonymous comments')
      return
    }
    setIsSubmitting(true)
    try {
      const payload = {
        content: newComment,
        postId,
      };
      if (asAnonymous) payload['name'] = anonymousName.trim();
      const { data } = await axios.post('/api/comments', payload)
      toast.success('Comment submitted! It will appear after approval.')
      setNewComment('')
      setAnonymousName('')
      // Refresh comments
      const { data: updatedComments } = await axios.get(`/api/posts/${postId}/comments`)
      setComments(updatedComments)
    } catch (error) {
      toast.error('Failed to submit comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitReply = async (parentId: string) => {
    if (!session) {
      toast.error('Please sign in to reply')
      return
    }

    if (!replyContent.trim()) {
      toast.error('Reply cannot be empty')
      return
    }

    setIsSubmitting(true)
    try {
      await axios.post('/api/comments', {
        content: replyContent,
        postId,
        parentId,
      })

      toast.success('Reply submitted! It will appear after approval.')
      setReplyContent('')
      setReplyingTo(null)
      
      // Refresh comments
      const { data: updatedComments } = await axios.get(`/api/posts/${postId}/comments`)
      setComments(updatedComments)
    } catch (error) {
      toast.error('Failed to submit reply')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return

    try {
      await axios.delete(`/api/comments/${commentId}`)
      toast.success('Comment deleted')
      
      // Refresh comments
      const { data: updatedComments } = await axios.get(`/api/posts/${postId}/comments`)
      setComments(updatedComments)
    } catch (error) {
      toast.error('Failed to delete comment')
    }
  }

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => {
    const canDelete = session?.user?.id === comment.author?.id || 
                      ['ADMIN', 'EDITOR'].includes(session?.user?.role || '')
    // Prefer anonymousName, then author.name, then 'Anonymous'
    const displayName = comment.anonymousName || comment.author?.name || 'Anonymous';
    const avatarLetter = displayName.charAt(0).toUpperCase();

    return (
      <div className={`${isReply ? 'ml-12' : ''} mb-6`}>
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {comment.author?.image ? (
              <Image
                src={comment.author.image}
                alt={displayName}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                {avatarLetter}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold">{displayName}</span>
                <span className="text-xs text-gray-500">
                  {formatDate(new Date(comment.createdAt))}
                </span>
                {!comment.approved && (
                  <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded-full flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Pending approval
                  </span>
                )}
              </div>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 mt-2 text-sm">
              {session && !isReply && (
                <button
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  <Reply className="h-4 w-4" />
                  Reply
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              )}
            </div>

            {/* Reply Form */}
            {replyingTo === comment.id && (
              <div className="mt-4">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write your reply..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-800"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleSubmitReply(comment.id)}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Submit Reply
                  </button>
                  <button
                    onClick={() => {
                      setReplyingTo(null)
                      setReplyContent('')
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-4">
                {comment.replies.map((reply) => (
                  <CommentItem key={reply.id} comment={reply} isReply />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-12">
      <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <MessageSquare className="h-6 w-6" />
        Comments ({comments.length})
      </h3>

      {/* Comment Form */}
      <form onSubmit={handleSubmitComment} className="mb-8">
        <div className="flex gap-4 items-start">
          <div className="flex-shrink-0">
            {session && !asAnonymous && session.user?.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || 'You'}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                {(asAnonymous ? anonymousName?.charAt(0) : session?.user?.name?.charAt(0)) || 'U'}
              </div>
            )}
          </div>
          <div className="flex-1">
            {(!session || asAnonymous) && (
              <input
                type="text"
                value={anonymousName}
                onChange={e => setAnonymousName(e.target.value)}
                placeholder="Your name (required for anonymous)"
                className="mb-2 w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-800"
                disabled={!!session && !asAnonymous}
              />
            )}
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-800"
            />
            <div className="flex items-center gap-4 mt-2">
              {session && (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={asAnonymous}
                    onChange={e => setAsAnonymous(e.target.checked)}
                  />
                  Post as Anonymous
                </label>
              )}
              {!session && (
                <span className="text-sm text-gray-500">Posting as anonymous</span>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? 'Submitting...' : 'Post Comment'}
              </button>
              {!session && (
                <Link
                  href="/auth/signin"
                  className="inline-block px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </form>

      {/* Comments List */}
      {comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      )}
    </div>
  )
}
