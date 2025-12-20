import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Clock, User, Eye } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Post {
  id: string
  title: string
  slug: string
  excerpt?: string | null
  coverImage?: string | null
  publishedAt?: Date | null
  readTime: number
  viewCount: number
  author: {
    name: string | null
    image: string | null
  }
  categories: Array<{
    name: string
    slug: string
    color?: string | null
  }>
  _count?: {
    comments: number
  }
}

export default function PostCard({ post }: { post: Post }) {
  return (
    <article className="group bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
      {/* Cover Image */}
      {post.coverImage && (
        <Link href={`/blog/${post.slug}`} className="block relative aspect-video overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
      )}

      <div className="p-6">
        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-3">
          {post.categories.slice(0, 2).map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="text-xs font-semibold px-3 py-1 rounded-full"
              style={{
                backgroundColor: category.color ? `${category.color}20` : '#3b82f620',
                color: category.color || '#3b82f6',
              }}
            >
              {category.name}
            </Link>
          ))}
        </div>

        {/* Title */}
        <Link href={`/blog/${post.slug}`}>
          <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-primary-600 transition">
            {post.title}
          </h3>
        </Link>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
            {post.excerpt}
          </p>
        )}

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{post.publishedAt ? formatDate(post.publishedAt) : 'Draft'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{post.readTime} min read</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{post.viewCount}</span>
          </div>
        </div>

        {/* Author */}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {post.author.image ? (
            <Image
              src={post.author.image}
              alt={post.author.name || 'Author'}
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold">
              {post.author.name?.charAt(0) || 'A'}
            </div>
          )}
          <span className="text-sm font-medium">{post.author.name}</span>
        </div>
      </div>
    </article>
  )
}
